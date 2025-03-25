import asyncio
import websockets
import json
import random
import datetime
import os

class DataGenerator:
    @staticmethod
    def generate_sensor_data():
        return {
            'temperature': round(random.uniform(20.0, 30.0), 1),
            'humidity': round(random.uniform(40.0, 60.0), 1),
            'timestamp': datetime.datetime.now().isoformat()
        }

async def websocket_handler(websocket, path):
    try:
        while True:
            # Generiere Sensordaten
            data = DataGenerator.generate_sensor_data()
            
            # Sende Daten an verbundene Clients
            await websocket.send(json.dumps(data))
            
            # Warte 2 Sekunden
            await asyncio.sleep(2)
    except websockets.exceptions.ConnectionClosed:
        print("Client disconnected")

async def main():
    # Server auf allen Netzwerkschnittstellen
    server = await websockets.serve(
        websocket_handler, 
        "0.0.0.0", 
        8765,
        # Erlaube Verbindungen von überall
        origins=["*"]
    )
    
    print("WebSocket-Server läuft")
    await server.wait_closed()

# Starten des Servers
if __name__ == "__main__":
    asyncio.run(main())