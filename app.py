import os
import asyncio
import websockets
import json
import random
import datetime

# Simulated sensor data generator
class DataGenerator:
    @staticmethod
    def generate_sensor_data():
        return {
            'temperature': round(random.uniform(20.0, 30.0), 1),
            'humidity': round(random.uniform(40.0, 60.0), 1),
            'timestamp': datetime.datetime.now().isoformat()
        }

connected_clients = set()

async def register(websocket):
    connected_clients.add(websocket)
    print(f"New client connected. Total clients: {len(connected_clients)}")

async def unregister(websocket):
    connected_clients.remove(websocket)
    print(f"Client disconnected. Total clients: {len(connected_clients)}")

async def data_sender(websocket, path=None):
    try:
        await register(websocket)
        while True:
            data = DataGenerator.generate_sensor_data()
            await websocket.send(json.dumps(data))
            await asyncio.sleep(2)
    except websockets.exceptions.ConnectionClosed:
        print("Client connection closed")
    finally:
        await unregister(websocket)

async def create_server():
    # Use PORT from Heroku environment or default
    port = int(os.environ.get('PORT', 8765))
    server = await websockets.serve(
        data_sender, 
        "0.0.0.0", 
        port,
        origins=["*"]
    )
    print(f"Server started on port {port}")
    await server.wait_closed()

def start_server():
    asyncio.run(create_server())

# Entry point for Heroku
if __name__ == "__main__":
    start_server()