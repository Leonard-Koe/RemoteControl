import requests
import json
import platform
import psutil
import socket
from datetime import datetime

def get_system_info():
    """Sammelt Informationen über das aktuelle System."""
    return {
        'timestamp': datetime.now().isoformat(),
        'hostname': socket.gethostname(),
        'operating_system': platform.system(),
        'os_version': platform.version(),
        'cpu_usage': psutil.cpu_percent(),
        'memory_usage': psutil.virtual_memory().percent,
        'ip_address': socket.gethostbyname(socket.gethostname())
    }

def send_data_to_firebase(url, data):
    """Sendet Daten an Firebase Realtime Database."""
    try:
        response = requests.post(url, json=data)
        response.raise_for_status()
        print("Daten erfolgreich gesendet!")
        print("Serverantwort:", response.text)
    except requests.exceptions.RequestException as e:
        print(f"Fehler beim Senden der Daten: {e}")

def main():
    # Ersetzen Sie dies mit Ihrer Firebase Realtime Database URL
    firebase_url = 'https://remotecontrol-39186.firebaseio.com/systemdata.json'
    
    # Systemdaten sammeln
    system_data = get_system_info()
    
    # Daten an Firebase senden
    send_data_to_firebase(firebase_url, system_data)

if __name__ == '__main__':
    main()