import requests
import platform
import psutil
import socket
from datetime import datetime
import json
import time
import logging
import traceback
import sys

# More comprehensive logging configuration
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),  # Console output
        logging.FileHandler('system_sender.log', mode='a')  # File output, append mode
    ]
)

def validate_system_info(system_info):
    """Validate collected system information."""
    required_keys = [
        'timestamp', 'hostname', 'operating_system', 
        'cpu_usage', 'memory_usage', 'memory_total', 
        'memory_available', 'ip_address', 'disk_usage'
    ]
    
    if not system_info:
        logging.error("System info is None")
        return False
    
    for key in required_keys:
        if key not in system_info:
            logging.error(f"Missing required key: {key}")
            return False
        
        if system_info[key] is None:
            logging.error(f"Value for {key} is None")
            return False
    
    return True

def get_system_info():
    """Collect comprehensive system information with enhanced error handling."""
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
        
        if not validate_system_info(system_info):
            logging.error("System info validation failed")
            return None
        
        logging.info(f"Collected system info: {json.dumps(system_info, indent=2)}")
        return system_info
    except Exception as e:
        logging.error(f"Comprehensive error in system info collection:")
        logging.error(f"Error Type: {type(e).__name__}")
        logging.error(f"Error Details: {str(e)}")
        logging.error(f"Full Traceback: {traceback.format_exc()}")
        return None

def send_data_to_netlify(url, data):
    """Enhanced data sending with comprehensive error handling."""
    try:
        # Prefix URL with https if no protocol specified
        if not url.startswith(('http://', 'https://')):
            url = f'https://{url}'
        
        # Construct full Netlify function URL
        full_url = f"{url.rstrip('/')}/.netlify/functions/receive-data"
        
        logging.info(f"Full send URL: {full_url}")
        logging.info(f"Payload size: {len(json.dumps(data))} bytes")
        
        headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'SystemMonitorSender/1.0'
        }
        
        response = requests.post(
            full_url, 
            data=json.dumps(data), 
            headers=headers,
            timeout=15  # Increased timeout
        )
        
        # Log full response details
        logging.info(f"Response Status: {response.status_code}")
        logging.info(f"Response Headers: {dict(response.headers)}")
        logging.info(f"Response Body: {response.text}")
        
        response.raise_for_status()  # Raise exception for HTTP errors
        
        return response.json()
    
    except requests.exceptions.RequestException as e:
        logging.error(f"Network Request Error: {e}")
        logging.error(f"Error Type: {type(e).__name__}")
        if hasattr(e, 'response') and e.response is not None:
            logging.error(f"Error Response: {e.response.text}")
        return None
    except Exception as e:
        logging.error(f"Unexpected error in send_data_to_netlify: {e}")
        logging.error(traceback.format_exc())
        return None

def main():
    # Configurable via environment variable or hardcoded
    netlify_endpoint = "remotecontrol1.netlify.app"
    
    logging.info("System Monitor Sender - Starting Main Loop")
    logging.info(f"Target Endpoint: {netlify_endpoint}")
    
    consecutive_failures = 0
    max_consecutive_failures = 5
    
    while True:
        try:
            system_data = get_system_info()
            
            if not system_data:
                logging.warning("System data collection failed")
                consecutive_failures += 1
                time.sleep(60)  # Wait a minute before retry
                continue
            
            result = send_data_to_netlify(netlify_endpoint, system_data)
            
            if result:
                logging.info("Data sent successfully")
                consecutive_failures = 0
            else:
                logging.warning("Data send failed")
                consecutive_failures += 1
            
            # Progressive backoff
            if consecutive_failures > 0:
                sleep_time = min(300, 30 * consecutive_failures)
                logging.info(f"Waiting {sleep_time} seconds before next attempt")
                time.sleep(sleep_time)
            else:
                logging.info("Waiting 5 minutes before next data collection")
                time.sleep(300)
            
            # Emergency exit if too many consecutive failures
            if consecutive_failures >= max_consecutive_failures:
                logging.critical(f"Too many consecutive failures ({consecutive_failures}). Exiting.")
                break
        
        except Exception as e:
            logging.error(f"Unexpected error in main loop: {e}")
            logging.error(traceback.format_exc())
            time.sleep(60)  # Wait a minute before retry

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        logging.critical(f"Fatal error: {e}")
        logging.critical(traceback.format_exc())
        sys.exit(1)