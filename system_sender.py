import requests
import platform
import psutil
import socket
from datetime import datetime
import json
import time
import urllib.parse

def get_system_info():
    """Collect comprehensive system information."""
    return {
        'timestamp': datetime.now().isoformat(),
        'hostname': socket.gethostname(),
        'operating_system': f"{platform.system()} {platform.release()}",
        'cpu_usage': psutil.cpu_percent(),
        'memory_usage': psutil.virtual_memory().percent,
        'memory_total': round(psutil.virtual_memory().total / (1024 * 1024 * 1024), 2),  # in GB
        'memory_available': round(psutil.virtual_memory().available / (1024 * 1024 * 1024), 2),  # in GB
        'ip_address': socket.gethostbyname(socket.gethostname()),
        'disk_usage': psutil.disk_usage('/').percent,
        'network_sent': psutil.net_io_counters().bytes_sent,
        'network_received': psutil.net_io_counters().bytes_recv
    }

def send_data_to_netlify(url, data):
    """Send system data to Netlify serverless function."""
    # Ensure URL has https:// prefix
    if not url.startswith(('http://', 'https://')):
        url = f'https://{url}'
    
    # Ensure URL ends with the correct function path
    if not url.endswith('/receive-data'):
        url = urllib.parse.urljoin(url, '.netlify/functions/receive-data')
    
    try:
        headers = {
            'Content-Type': 'application/json'
        }
        response = requests.post(url, 
                                 data=json.dumps(data), 
                                 headers=headers,
                                 timeout=10)  # Add timeout to prevent hanging
        
        # Raise an exception for HTTP errors
        response.raise_for_status()
        
        print("Data sent successfully!")
        print("Server response:", response.json())
    except requests.exceptions.RequestException as e:
        print(f"Error sending data: {e}")
        # More detailed error handling
        if hasattr(e, 'response') and e.response is not None:
            print("Response content:", e.response.text)
        else:
            print("No additional error details available.")

def main():
    # Prompt user for Netlify site URL
    netlify_endpoint = input("Enter your Netlify site URL (e.g., cheerful-mermaid-38ac59.netlify.app): ")
    
    while True:
        try:
            # Collect system information
            system_data = get_system_info()
            
            # Send data to Netlify
            send_data_to_netlify(netlify_endpoint, system_data)
            
            # Wait for 5 minutes before next send
            time.sleep(300)
        except Exception as e:
            print(f"Unexpected error: {e}")
            print("Retrying in 1 minute...")
            time.sleep(60)

if __name__ == '__main__':
    main()