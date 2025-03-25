// Global variable to simulate persistent storage
let systemData = [];

const handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
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
      body: JSON.stringify({ message: 'Error serving data', error: error.toString() }) 
    };
  }
};

// Modify this to update the global data
const updateSystemData = (newData) => {
  systemData.push(newData);
  
  // Keep only last 50 entries
  if (systemData.length > 50) {
    systemData = systemData.slice(-50);
  }
};

module.exports = { handler, updateSystemData };