const { getSystemData } = require('./receive-data');

exports.handler = async (event, context) => {
  try {
    const systemData = await getSystemData();

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