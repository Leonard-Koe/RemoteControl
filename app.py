import asyncio
import websockets
import json
import random
import datetime

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
    print(f"Neuer Client verbunden. Gesamte Clients: {len(connected_clients)}")

async def unregister(websocket):
    connected_clients.remove(websocket)
    print(f"Client getrennt. Gesamte Clients: {len(connected_clients)}")

async def data_sender(websocket, path=None):
    try:
        await register(websocket)
        while True:
            data = DataGenerator.generate_sensor_data()
            await websocket.send(json.dumps(data))
            await asyncio.sleep(2)
    except websockets.exceptions.ConnectionClosed:
        print("Client-Verbindung geschlossen")
    finally:
        await unregister(websocket)

async def start_websocket_server():
    server = await websockets.serve(
        data_sender, 
        "0.0.0.0", 
        8765,
        origins=["*"]
    )
    print("WebSocket-Server gestartet")
    await server.wait_closed()

def run_server():
    asyncio.run(start_websocket_server())

if __name__ == "__main__":
    run_server()