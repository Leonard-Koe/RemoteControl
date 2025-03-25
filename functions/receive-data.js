exports.handler = async (event, context) => {
    console.log('Received request with method:', event.httpMethod);
    console.log('Request headers:', event.headers);
    console.log('Request body:', event.body);
  
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      console.error('Method Not Allowed');
      return { 
        statusCode: 405, 
        body: JSON.stringify({ message: 'Method Not Allowed' }) 
      };
    }
  
    try {
      // Parse incoming system data
      const systemData = JSON.parse(event.body);
      console.log('Parsed system data:', JSON.stringify(systemData, null, 2));
  
      // Check if Netlify KV is available
      if (typeof context.storage === 'undefined') {
        console.error('Netlify KV storage not configured');
        
        // Optional: Log to a file or send to an external logging service
        const logEntry = {
          timestamp: new Date().toISOString(),
          message: 'KV Storage Not Configured',
          data: systemData
        };
        
        // You might want to implement a more robust logging mechanism here
        
        return {
          statusCode: 500,
          body: JSON.stringify({ 
            message: 'KV Storage Configuration Error',
            details: 'Please verify Netlify KV storage setup',
            receivedData: systemData
          })
        };
      }
  
      // Rest of the existing implementation remains the same
      // ...
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