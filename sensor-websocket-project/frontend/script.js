class WebSocketClient {
    constructor() {
        this.socket = null;
        this.connectionStatus = document.getElementById('connectionStatus');
        this.dataDisplay = document.getElementById('dataDisplay');
        this.serverIPInput = document.getElementById('serverIP');
        this.connectBtn = document.getElementById('connectBtn');

        this.initEventListeners();
    }

    initEventListeners() {
        this.connectBtn.addEventListener('click', () => this.connectWebSocket());
    }

    connectWebSocket() {
        // Close existing connection if any
        if (this.socket) {
            this.socket.close();
        }

        const serverURL = this.serverIPInput.value.trim();
        if (!serverURL) {
            alert('Please enter a WebSocket server URL');
            return;
        }

        try {
            this.socket = new WebSocket(serverURL);
            
            this.socket.onopen = () => {
                console.log('WebSocket connection established');
                this.updateConnectionStatus('Connected', 'green');
                this.dataDisplay.innerHTML = '<p>Connected. Waiting for data...</p>';
            };

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.displayData(data);
                } catch (error) {
                    console.error('Error parsing data:', error);
                }
            };

            this.socket.onclose = () => {
                console.log('WebSocket connection closed');
                this.updateConnectionStatus('Disconnected', 'red');
                this.dataDisplay.innerHTML = '<p>Disconnected from server</p>';
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.updateConnectionStatus('Connection Error', 'red');
                this.dataDisplay.innerHTML = '<p>Connection error</p>';
            };

        } catch (error) {
            console.error('WebSocket connection error:', error);
            alert('Failed to connect to WebSocket server');
        }
    }

    updateConnectionStatus(message, color) {
        this.connectionStatus.innerHTML = `<p style="color:${color};">${message}</p>`;
    }

    displayData(data) {
        const dataRow = document.createElement('div');
        dataRow.classList.add('data-row');
        dataRow.innerHTML = `
            <strong>Timestamp:</strong> ${data.timestamp}<br>
            <strong>Temperature:</strong> ${data.temperature}°C<br>
            <strong>Humidity:</strong> ${data.humidity}%
        `;
        
        // Add the new data row to the top of the display
        this.dataDisplay.insertBefore(dataRow, this.dataDisplay.firstChild);
        
        // Limit to last 5 entries
        if (this.dataDisplay.children.length > 6) {
            this.dataDisplay.removeChild(this.dataDisplay.lastChild);
        }
    }
}

// Initialize the WebSocket client when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new WebSocketClient();
});