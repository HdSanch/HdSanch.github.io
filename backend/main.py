from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List

app = FastAPI()

# Configurar CORS para permitir conexiones desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir solicitudes desde el frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lista para almacenar las conexiones activas
connections: List[WebSocket] = []
usernames = {}  # Diccionario para asignar usernames a websockets

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    username = f"User{len(connections) + 1}"  # Asignar un identificador único
    usernames[websocket] = username
    connections.append(websocket)
    
    try:
        while True:
            data = await websocket.receive_text()
            message = f"{usernames[websocket]}:{data}"  # Adjuntar username al mensaje

            # Enviar el mensaje a todos los clientes conectados
            for connection in connections:
                await connection.send_text(message)
    except WebSocketDisconnect:
        print(f"Cliente {username} desconectado")
        connections.remove(websocket)
        del usernames[websocket]
    except Exception as e:
        print(f"Error en WebSocket: {e}")
        connections.remove(websocket)
        del usernames[websocket]

