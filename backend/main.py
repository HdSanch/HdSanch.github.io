from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import json
from pydantic import BaseModel
import uuid
import os
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()

app = FastAPI()

# Configurar CORS para permitir conexiones desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Conexión a MongoDB Atlas desde variables de entorno
MONGO_URI = os.getenv("MONGO_URI")
client = AsyncIOMotorClient(MONGO_URI)
db = client.chat_db
users_collection = db.users
messages_collection = db.messages

# Lista para almacenar las conexiones activas
connections: Dict[str, WebSocket] = {}  # userId -> websocket

class User(BaseModel):
    user_id: str
    username: str

async def get_or_create_user(user_id: str, username: str):
    """Obtiene o crea un usuario en la base de datos"""
    user = await users_collection.find_one({"user_id": user_id})
    if not user:
        user = {"user_id": user_id, "username": username, "created_at": datetime.utcnow()}
        await users_collection.insert_one(user)
    return user

async def save_message(user_id: str, username: str, content: str):
    """Guarda un mensaje en la base de datos"""
    message = {
        "user_id": user_id,
        "username": username,
        "content": content,
        "created_at": datetime.utcnow()
    }
    await messages_collection.insert_one(message)
    return message

async def get_recent_messages(limit: int = 50):
    """Obtiene los mensajes más recientes"""
    cursor = messages_collection.find().sort("created_at", -1).limit(limit)
    messages = await cursor.to_list(length=limit)
    return list(reversed(messages))

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await websocket.accept()
    
    # Recibir información de registro
    registration_data = await websocket.receive_text()
    data = json.loads(registration_data)
    username = data.get("username", f"User{len(connections) + 1}")
    
    # Registrar o recuperar usuario
    user = await get_or_create_user(user_id, username)
    
    # Guardar la conexión
    connections[user_id] = websocket
    
    # Enviar historial de mensajes recientes
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
    
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            content = message_data.get("text", "")
            
            # Guardar mensaje en la base de datos
            message = await save_message(user_id, username, content)
            
            # Preparar mensaje para broadcast
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
        print(f"Cliente {username} ({user_id}) desconectado")
        if user_id in connections:
            del connections[user_id]
    except Exception as e:
        print(f"Error en WebSocket: {e}")
        if user_id in connections:
            del connections[user_id]

@app.get("/")
async def root():
    return {"message": "Chat API activa. Conecta mediante WebSocket a /ws/{user_id}"}