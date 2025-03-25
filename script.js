class WebSocketClient {
    constructor() {
        // Standardmäßige WebSocket-Server-URL
        this.defaultServerUrl = 'wss://uXenon.pythonanywhere.com';
        
        this.connectionStatus = document.getElementById('connectionStatus');
        this.dataDisplay = document.getElementById('dataDisplay');
        this.serverIPInput = document.getElementById('serverIP');
        this.connectBtn = document.getElementById('connectBtn');

        // Setze Standardwert
        this.serverIPInput.value = this.defaultServerUrl;

        this.connectBtn.addEventListener('click', () => this.connectWebSocket());
    }

    connectWebSocket() {
        const serverURL = this.serverIPInput.value.trim();
        
        if (!serverURL) {
            alert('Bitte WebSocket-Server-URL eingeben');
            return;
        }

        // Verbindung herstellen
        this.socket = new WebSocket(serverURL);
        
        this.socket.onopen = () => {
            this.connectionStatus.innerHTML = '<p style="color:green;">Verbunden</p>';
            this.dataDisplay.innerHTML = 'Warte auf Daten...';
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.displayData(data);
        };

        this.socket.onclose = () => {
            this.connectionStatus.innerHTML = '<p style="color:red;">Getrennt</p>';
        };
    }

    displayData(data) {
        const dataRow = document.createElement('div');
        dataRow.innerHTML = `
            Zeitstempel: ${data.timestamp}<br>
            Temperatur: ${data.temperature}°C<br>
            Luftfeuchtigkeit: ${data.humidity}%
        `;
        
        this.dataDisplay.insertBefore(dataRow, this.dataDisplay.firstChild);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WebSocketClient();
});