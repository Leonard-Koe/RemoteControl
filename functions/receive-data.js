const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event, context) => {
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

    // Retrieve existing data from environment variable or create new
    const existingDataStr = process.env.SYSTEM_DATA || '[]';
    let existingData = JSON.parse(existingDataStr);

    // Add new data point with receive timestamp
    const newEntry = {
      ...systemData,
      receivedAt: new Date().toISOString()
    };
    existingData.push(newEntry);

    // Keep only last 50 entries
    if (existingData.length > 50) {
      existingData = existingData.slice(-50);
    }

    // Update environment variable
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
      body: JSON.stringify({ message: 'Error processing data', error: error.toString() }) 
    };
  }
};

// Export a function to retrieve the data
exports.getSystemData = async () => {
  try {
    const existingDataStr = process.env.SYSTEM_DATA || '[]';
    return JSON.parse(existingDataStr);
  } catch (error) {
    console.error('Error retrieving data:', error);
    return [];
  }
};