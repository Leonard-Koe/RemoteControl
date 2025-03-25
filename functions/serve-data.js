const { createClient } = require('@netlify/functions');

const handler = async (event, context) => {
    console.log('Received request with method:', event.httpMethod);

    // Create Netlify KV client
    const client = createClient(context);

    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
        console.error('Method Not Allowed');
        return { 
            statusCode: 405, 
            body: JSON.stringify({ message: 'Method Not Allowed' }) 
        };
    }

    try {
        // Retrieve data from KV store
        const systemData = await client.get('SYSTEM_DATA') || [];
        console.log('Retrieved stored data:', systemData);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(systemData)
        };
    } catch (error) {
        console.error('Error serving data:', error);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ 
                message: 'Error serving data', 
                error: error.toString(),
                details: error.stack 
            }) 
        };
    }
};

module.exports = { handler };