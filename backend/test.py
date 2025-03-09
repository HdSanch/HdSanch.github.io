"""
Script de prueba de conexión a MongoDB para DeUna Emprende.

Este script verifica que la conexión a la base de datos MongoDB
configurada en el archivo .env esté funcionando correctamente.
Utiliza motor_asyncio para realizar conexiones asíncronas.

Autor: Equipo Push&Commit
Fecha: Marzo 2025
"""

import asyncio
import os
from typing import Dict, Any
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Cargar variables de entorno desde el archivo .env
load_dotenv()

# Obtener la URI de conexión a MongoDB desde las variables de entorno
MONGO_URI = os.getenv("MONGO_URI")


async def check_mongo_connection() -> None:
    """
    Verifica la conexión a MongoDB usando la URI definida en el archivo .env.
    
    Esta función intenta establecer una conexión con MongoDB y ejecuta
    un comando de ping para comprobar que la conexión funciona correctamente.
    
    Raises:
        Exception: Si la conexión falla por cualquier motivo, captura y muestra el error.
    
    Returns:
        None: La función no retorna valores, solo imprime el resultado.
    """
    # Verificar que MONGO_URI está definida
    if not MONGO_URI:
        print("ERROR: La variable MONGO_URI no está definida en el archivo .env")
        return
    
    try:
        # Intentar establecer conexión con MongoDB
        client = AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        
        # Acceder a la base de datos admin para realizar pruebas básicas
        db = client.admin
        
        # Ejecutar el comando ping para verificar la conexión
        server_info: Dict[str, Any] = await db.command("ping")
        
        # Mostrar mensaje de éxito si la conexión funciona
        print("ÉXITO: Conexión establecida a MongoDB:", server_info)
        
        # Listar las bases de datos disponibles (información adicional)
        database_names = await client.list_database_names()
        print("INFO: Bases de datos disponibles:", database_names)
        
    except Exception as e:
        # Capturar y mostrar cualquier error de conexión
        print("ERROR: Fallo en la conexión con MongoDB:", e)
        print("\nSugerencias de solución:")
        print("  - Verifique que la cadena de conexión en el archivo .env sea correcta")
        print("  - Asegúrese de que el servidor MongoDB esté ejecutándose")
        print("  - Compruebe que el usuario tenga permisos adecuados")
        print("  - Verifique la configuración de red y firewall")


# Punto de entrada principal
if __name__ == "__main__":
    print("INICIO: Verificando conexión a MongoDB...")
    # Ejecutar la función asíncrona
    asyncio.run(check_mongo_connection())