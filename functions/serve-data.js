const { systemDataStore } = require('./receive-data');

exports.handler = async (event) => {
    console.log('Serve Data Function - Start');
    
    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
        return { 
            statusCode: 405, 
            body: JSON.stringify({ 
                message: 'Method Not Allowed',
                receivedMethod: event.httpMethod 
            }) 
        };
    }

    try {
        // If no data, provide fallback
        const dataToSend = systemDataStore.length > 0 
            ? systemDataStore 
            : [
                {
                    timestamp: new Date().toISOString(),
                    hostname: 'TestHost',
                    operating_system: 'Test OS',
                    cpu_usage: 10.5,
                    memory_usage: 50.0,
                    memory_total: 16.0,
                    memory_available: 8.0,
                    ip_address: '127.0.0.1',
                    disk_usage: 75.0
                }
            ];

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(dataToSend)
        };
    } catch (error) {
        console.error('Comprehensive Error in Serve Data:', error);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ 
                message: 'Unexpected Server Error',
                errorType: error.name,
                errorMessage: error.message,
                errorStack: error.stack
            }) 
        };
    }
};