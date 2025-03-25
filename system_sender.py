import requests
import platform
import psutil
import socket
from datetime import datetime
import json
import time

def get_system_info():
    """Collect comprehensive system information."""
    return {
        'timestamp': datetime.now().isoformat(),
        'hostname': socket.gethostname(),
        'operating_system': f"{platform.system()} {platform.release()}",
        'cpu_usage': psutil.cpu_percent(),
        'memory_usage': psutil.virtual_memory().percent,
        'memory_total': psutil.virtual_memory().total / (1024 * 1024 * 1024),  # in GB
        'memory_available': psutil.virtual_memory().available / (1024 * 1024 * 1024),  # in GB
        'ip_address': socket.gethostbyname(socket.gethostname()),
        'disk_usage': psutil.disk_usage('/').percent,
        'network_sent': psutil.net_io_counters().bytes_sent,
        'network_received': psutil.net_io_counters().bytes_recv
    }

def send_data_to_netlify(url, data):
    """Send system data to Netlify serverless function."""
    try:
        headers = {
            'Content-Type': 'application/json'
        }
        response = requests.post(url, 
                                 data=json.dumps(data), 
                                 headers=headers)
        
        # Raise an exception for HTTP errors
        response.raise_for_status()
        
        print("Data sent successfully!")
        print("Server response:", response.json())
    except requests.exceptions.RequestException as e:
        print(f"Error sending data: {e}")
        if hasattr(e, 'response'):
            print("Response content:", e.response.text)

def main():
    # Your Netlify site URL - REPLACE WITH YOUR ACTUAL NETLIFY FUNCTION ENDPOINT
    netlify_endpoint = 'cheerful-mermaid-38ac59.netlify.app'
    
    while True:
        # Collect system information
        system_data = get_system_info()
        
        # Send data to Netlify
        send_data_to_netlify(netlify_endpoint, system_data)
        
        # Wait for 5 minutes before next send
        time.sleep(300)

if __name__ == '__main__':
    main()