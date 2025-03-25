import requests
import platform
import psutil
import socket
from datetime import datetime
import json
import time
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(levelname)s - %(message)s')

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
    
    # Use the correct Netlify function path
    url = f"{url.rstrip('/')}/.netlify/functions/receive-data"
    
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
        
        logging.info("Data sent successfully!")
        logging.info(f"Server response: {response.json()}")
    except requests.exceptions.RequestException as e:
        logging.error(f"Error sending data: {e}")
        # More detailed error handling
        if hasattr(e, 'response') and e.response is not None:
            logging.error(f"Response content: {e.response.text}")
        else:
            logging.error("No additional error details available.")

def main():
    # Replace with your actual Netlify site URL
    netlify_endpoint = "remotecontrol1.netlify.app"
    
    while True:
        try:
            # Collect system information
            system_data = get_system_info()
            
            # Send data to Netlify
            send_data_to_netlify(netlify_endpoint, system_data)
            
            # Wait for 5 minutes before next send
            time.sleep(300)
        except Exception as e:
            logging.error(f"Unexpected error: {e}")
            logging.info("Retrying in 1 minute...")
            time.sleep(60)

if __name__ == '__main__':
    main()