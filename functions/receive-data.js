const handler = async (event, context) => {
    console.log('Serve Data Function - Start');
    console.log('Request Method:', event.httpMethod);
    console.log('Event Object:', JSON.stringify(event, null, 2));
    console.log('Context Object:', JSON.stringify(context, null, 2));
  
    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
      console.error('Method Not Allowed');
      return { 
        statusCode: 405, 
        body: JSON.stringify({ 
          message: 'Method Not Allowed',
          receivedMethod: event.httpMethod 
        }) 
      };
    }
  
    try {
      // Hardcoded test data for debugging
      const systemData = [
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
  
      console.log('Returning system data:', JSON.stringify(systemData, null, 2));
  
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'X-Debug-Info': 'Netlify Function Served Data'
        },
        body: JSON.stringify(systemData)
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
  
  module.exports = { handler };