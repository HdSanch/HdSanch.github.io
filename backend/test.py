from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

# ⚠️ Reemplaza con tu URI de MongoDB Atlas
MONGO_URI = "mongodb+srv://andradedilan00:aHqsdvRTZSOtkjnN@deuna.vk2nr.mongodb.net/?retryWrites=true&w=majority&appName=DeUna"

async def test_mongodb():
    try:
        client = AsyncIOMotorClient(MONGO_URI)
        db = client.chatDB  # Nombre de tu base de datos
        collection = db.messages  # Nombre de la colección

        # Insertar un mensaje de prueba
        mensaje_prueba = {"user_id": "test_user", "text": "Mensaje de prueba"}
        resultado = await collection.insert_one(mensaje_prueba)
        print(f"✅ Mensaje insertado con ID: {resultado.inserted_id}")

        # Leer todos los mensajes guardados
        mensajes = await collection.find().to_list(None)
        print("📜 Mensajes en la base de datos:")
        for msg in mensajes:
            print(msg)

    except Exception as e:
        print(f"❌ Error al conectar con MongoDB: {e}")

    finally:
        client.close()

# Ejecutar la prueba
asyncio.run(test_mongodb())
