const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event) => {
    console.log('Received request with method:', event.httpMethod);
    
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { 
            statusCode: 405, 
            body: JSON.stringify({ message: 'Method Not Allowed' }) 
        };
    }
  
    try {
        // Parse incoming system data
        const systemData = JSON.parse(event.body);
        systemData.receivedAt = new Date().toISOString();
        
        // Attempt to use persistent storage
        const dataFilePath = path.join(__dirname, 'system_data.json');
        
        let existingData = [];
        try {
            const existingDataRaw = await fs.readFile(dataFilePath, 'utf8');
            existingData = JSON.parse(existingDataRaw);
        } catch (readError) {
            console.warn('No existing data file found. Creating new one.');
        }
        
        // Add new entry and keep last 50
        existingData.push(systemData);
        if (existingData.length > 50) {
            existingData = existingData.slice(-50);
        }
        
        // Write back to file
        await fs.writeFile(dataFilePath, JSON.stringify(existingData, null, 2));
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                message: 'Data received successfully',
                entriesCount: existingData.length 
            })
        };
    } catch (error) {
        console.error('Error processing data:', error);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ 
                message: 'Error processing data', 
                error: error.toString(),
                details: error.stack 
            }) 
        };
    }
};