
"""
Servidor de Chat WebSocket para DeUna Emprende

Este módulo implementa un servidor de chat en tiempo real utilizando WebSockets
con FastAPI y MongoDB para almacenar usuarios y mensajes. Permite la conexión
de múltiples clientes simultáneamente y mantiene un historial de conversaciones.

Autor: Equipo Push&Commit
Fecha: Marzo 2025
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Optional
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import json
from pydantic import BaseModel
import uuid
import os
from dotenv import load_dotenv

# Cargar variables de entorno desde archivo .env
load_dotenv()

# Inicializar la aplicación FastAPI
app = FastAPI(
    title="DeUna Emprende Chat API",
    description="API para el servicio de chat en tiempo real de DeUna Emprende",
    version="1.0.0"
)

# Configurar CORS para permitir conexiones desde el frontend
# Esto es necesario para que el frontend pueda comunicarse con esta API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominios exactos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuración de la conexión a MongoDB Atlas
MONGO_URI = os.getenv("MONGO_URI")
client = AsyncIOMotorClient(MONGO_URI)
db = client.chat_db
users_collection = db.users
messages_collection = db.messages

# Diccionario para almacenar las conexiones WebSocket activas
connections: Dict[str, WebSocket] = {}  # Mapeo de user_id -> websocket


class User(BaseModel):
    """
    Modelo de datos para representar un usuario del chat.
    
    Attributes:
        user_id (str): Identificador único del usuario
        username (str): Nombre de usuario para mostrar en el chat
    """
    user_id: str
    username: str


async def get_or_create_user(user_id: str, username: str) -> Dict:
    """
    Obtiene un usuario existente o crea uno nuevo en la base de datos.
    
    Args:
        user_id (str): Identificador único del usuario
        username (str): Nombre de usuario para mostrar
        
    Returns:
        Dict: Documento del usuario desde la base de datos
    """
    user = await users_collection.find_one({"user_id": user_id})
    if not user:
        user = {
            "user_id": user_id, 
            "username": username, 
            "created_at": datetime.utcnow()
        }
        await users_collection.insert_one(user)
    return user


async def save_message(user_id: str, username: str, content: str) -> Dict:
    """
    Guarda un mensaje en la base de datos.
    
    Args:
        user_id (str): Identificador del usuario que envía el mensaje
        username (str): Nombre del usuario que envía el mensaje
        content (str): Contenido del mensaje
        
    Returns:
        Dict: Documento del mensaje guardado
    """
    message = {
        "user_id": user_id,
        "username": username,
        "content": content,
        "created_at": datetime.utcnow()
    }
    await messages_collection.insert_one(message)
    return message


async def get_recent_messages(limit: int = 50) -> List[Dict]:
    """
    Obtiene los mensajes más recientes del historial.
    
    Args:
        limit (int, optional): Número máximo de mensajes a recuperar. Default: 50
        
    Returns:
        List[Dict]: Lista de mensajes ordenados cronológicamente
    """
    cursor = messages_collection.find().sort("created_at", -1).limit(limit)
    messages = await cursor.to_list(length=limit)
    # Revertir para obtener orden cronológico (más antiguos primero)
    return list(reversed(messages))


@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """
    Endpoint WebSocket para la conexión de chat.
    
    Maneja la conexión inicial, registro de usuario, envío del historial
    y la comunicación bidireccional mientras la conexión está activa.
    
    Args:
        websocket (WebSocket): Objeto WebSocket para la conexión
        user_id (str): Identificador único del usuario que se conecta
    """
    # Aceptar la conexión WebSocket
    await websocket.accept()
    
    try:
        # Recibir información de registro inicial
        registration_data = await websocket.receive_text()
        data = json.loads(registration_data)
        username = data.get("username", f"User{len(connections) + 1}")
        
        # Registrar o recuperar información del usuario
        user = await get_or_create_user(user_id, username)
        
        # Guardar la conexión en el diccionario de conexiones activas
        connections[user_id] = websocket
        
        # Enviar historial de mensajes recientes al usuario recién conectado
        recent_messages = await get_recent_messages()
        history = {
            "type": "history",
            "messages": [
                {
                    "sender": msg["username"],
                    "user_id": msg["user_id"],
                    "text": msg["content"],
                    "timestamp": msg["created_at"].isoformat()
                } for msg in recent_messages
            ]
        }
        await websocket.send_text(json.dumps(history))
        
        # Bucle principal para recibir mensajes mientras la conexión está activa
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            content = message_data.get("text", "")
            
            # Guardar mensaje en la base de datos
            message = await save_message(user_id, username, content)
            
            # Preparar mensaje para difusión a todos los clientes
            broadcast_message = {
                "type": "message",
                "sender": username,
                "user_id": user_id,
                "text": content,
                "timestamp": message["created_at"].isoformat()
            }
            
            # Enviar el mensaje a todos los clientes conectados
            for conn_id, connection in connections.items():
                await connection.send_text(json.dumps(broadcast_message))
                
    except WebSocketDisconnect:
        # Manejar desconexión normal del cliente
        print(f"Cliente {username} ({user_id}) desconectado")
        if user_id in connections:
            del connections[user_id]
    except Exception as e:
        # Manejar otros errores durante la comunicación
        print(f"Error en WebSocket: {e}")
        if user_id in connections:
            del connections[user_id]


@app.get("/")
async def root():
    """
    Endpoint raíz para verificar que la API está funcionando.
    
    Returns:
        Dict: Mensaje informativo que indica que la API está activa
    """
    return {
        "message": "Chat API activa. Conecta mediante WebSocket a /ws/{user_id}",
        "version": "1.0.0",
        "status": "online"
    }


# Punto de entrada principal para ejecución directa
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    print(f"Iniciando servidor de chat en {host}:{port}")
    uvicorn.run("main:app", host=host, port=port, reload=True)