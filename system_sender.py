import requests
import platform
import psutil
import socket
from datetime import datetime
import json
import time
import logging
import traceback

# Configure logging to write to both console and file
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),  # Console output
        logging.FileHandler('system_sender.log')  # File output
    ]
)

def get_system_info():
    """Collect comprehensive system information."""
    try:
        system_info = {
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
        logging.info(f"Collected system info: {json.dumps(system_info, indent=2)}")
        return system_info
    except Exception as e:
        logging.error(f"Error collecting system info: {e}")
        logging.error(traceback.format_exc())
        return None

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
        logging.info(f"Attempting to send data to: {url}")
        logging.info(f"Payload: {json.dumps(data, indent=2)}")
        
        response = requests.post(url, 
                                 data=json.dumps(data), 
                                 headers=headers,
                                 timeout=10)  # Add timeout to prevent hanging
        
        # Log full response details
        logging.info(f"Response status code: {response.status_code}")
        logging.info(f"Response headers: {response.headers}")
        try:
            logging.info(f"Response body: {response.text}")
        except Exception as e:
            logging.error(f"Could not log response body: {e}")
        
        # Raise an exception for HTTP errors
        response.raise_for_status()
        
        logging.info("Data sent successfully!")
        logging.info(f"Server response: {response.json()}")
    except requests.exceptions.RequestException as e:
        logging.error(f"Request Error sending data: {e}")
        logging.error(traceback.format_exc())
        # More detailed error handling
        if hasattr(e, 'response') and e.response is not None:
            logging.error(f"Response content: {e.response.text}")
        else:
            logging.error("No additional error details available.")
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        logging.error(traceback.format_exc())

def main():
    # Replace with your actual Netlify site URL
    netlify_endpoint = "remotecontrol1.netlify.app"
    
    while True:
        try:
            # Collect system information
            system_data = get_system_info()
            
            # Only send if system data was successfully collected
            if system_data:
                # Send data to Netlify
                send_data_to_netlify(netlify_endpoint, system_data)
            else:
                logging.warning("Skipping data send due to collection failure")
            
            # Wait for 5 minutes before next send
            logging.info("Waiting 5 minutes before next data collection...")
            time.sleep(300)
        except Exception as e:
            logging.error(f"Unexpected error in main loop: {e}")
            logging.error(traceback.format_exc())
            logging.info("Retrying in 1 minute...")
            time.sleep(60)

if __name__ == '__main__':
    main()