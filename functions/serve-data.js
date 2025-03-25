// Global variable to simulate persistent storage
let systemData = [];

const handler = async (event, context) => {
  console.log('Received request with method:', event.httpMethod);
  console.log('Current stored data:', systemData);

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    console.error('Method Not Allowed');
    return { 
      statusCode: 405, 
      body: JSON.stringify({ message: 'Method Not Allowed' }) 
    };
  }

  try {
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