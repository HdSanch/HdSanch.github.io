from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI = "mongodb+srv://andradedilan00:aHqsdvRTZSOtkjnN@deuna.vk2nr.mongodb.net/?retryWrites=true&w=majority&appName=DeUna"

client = AsyncIOMotorClient(MONGO_URI)
db = client.test  # Base de datos de prueba
print(db.list_collection_names())