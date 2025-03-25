document.addEventListener('DOMContentLoaded', () => {
    const dataContainer = document.getElementById('data-container');
    
    // Ersetzen Sie dies mit Ihrer Firebase Realtime Database URL
    const DATABASE_URL = 'https://IHRE-FIREBASE-APP.firebaseio.com/systemdata.json';

    async function fetchSystemData() {
        try {
            const response = await fetch(DATABASE_URL);
            const data = await response.json();

            if (!data) {
                dataContainer.innerHTML = '<p>Keine Daten empfangen...</p>';
                return;
            }

            const tableHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>Zeitstempel</th>
                            <th>Hostname</th>
                            <th>Betriebssystem</th>
                            <th>CPU-Auslastung</th>
                            <th>Speicher</th>
                            <th>IP-Adresse</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(data).map(([key, entry]) => `
                            <tr>
                                <td>${entry.timestamp}</td>
                                <td>${entry.hostname}</td>
                                <td>${entry.operating_system}</td>
                                <td>${entry.cpu_usage}%</td>
                                <td>${entry.memory_usage}%</td>
                                <td>${entry.ip_address}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

            dataContainer.innerHTML = tableHTML;
        } catch (error) {
            console.error('Fehler beim Laden der Daten:', error);
            dataContainer.innerHTML = `<p>Fehler: ${error.message}</p>`;
        }
    }

    // Daten alle 30 Sekunden aktualisieren
    fetchSystemData();
    setInterval(fetchSystemData, 30000);
});