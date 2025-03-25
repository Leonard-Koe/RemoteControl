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

    // Use project root for data persistence
    const dataFilePath = path.join(__dirname, '..', 'system-data.json');

    // Read existing data
    let existingData = [];
    try {
      const rawData = await fs.readFile(dataFilePath, 'utf8');
      existingData = JSON.parse(rawData);
    } catch (readError) {
      console.log('Creating new data file');
    }

    // Add new data point with receive timestamp
    existingData.push({
      ...systemData,
      receivedAt: new Date().toISOString()
    });

    // Keep only last 50 entries
    if (existingData.length > 50) {
      existingData = existingData.slice(-50);
    }

    // Write updated data back to file
    await fs.writeFile(dataFilePath, JSON.stringify(existingData, null, 2));

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