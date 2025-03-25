const crypto = require('crypto');

// Global variable to store system data (will reset on each function cold start)
let systemDataStore = [];

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
        
        // Add received timestamp and unique ID
        systemData.receivedAt = new Date().toISOString();
        systemData.id = crypto.randomBytes(8).toString('hex');
        
        // Add to global store
        systemDataStore.push(systemData);
        
        // Keep only last 50 entries
        if (systemDataStore.length > 50) {
            systemDataStore = systemDataStore.slice(-50);
        }
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                message: 'Data received successfully',
                entriesCount: systemDataStore.length,
                lastEntryId: systemData.id
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

// Expose the data store for serve-data function
exports.systemDataStore = systemDataStore;