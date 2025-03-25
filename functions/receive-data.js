const handler = async (event, context) => {
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
  
      // Retrieve existing data from environment variable or create new
      const existingDataStr = process.env.SYSTEM_DATA || '[]';
      let existingData = JSON.parse(existingDataStr);
      console.log('Existing data before update:', existingData);
  
      // Add new data point with receive timestamp
      const newEntry = {
        ...systemData,
        receivedAt: new Date().toISOString()
      };
      existingData.push(newEntry);
      console.log('Updated data:', existingData);
  
      // Keep only last 50 entries
      if (existingData.length > 50) {
        existingData = existingData.slice(-50);
      }
  
      // Update environment variable (Note: this won't persist between serverless invocations)
      process.env.SYSTEM_DATA = JSON.stringify(existingData);
  
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
  
  module.exports = { handler };