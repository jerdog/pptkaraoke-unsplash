// netlify/functions/unsplash.js

exports.handler = async function(event, context) {
  try {
    // Use dynamic import for ES Module
    const fetch = (await import('node-fetch')).default;

    const ACCESS_KEY = process.env.ACCESS_KEY;
    if (!ACCESS_KEY) {
      throw new Error("Unsplash access key is missing");
    }
    const searchTerm = event.queryStringParameters || 'funny'; // Default search term if none provided

    // Log query parameters and access key
    // console.log('Query Parameters:', event.queryStringParameters);
    // console.log('Search Term:', searchTerm);

    const response = await fetch(`https://api.unsplash.com/photos/random?query=${encodeURIComponent(searchTerm)}&orientation=landscape&content_filter=low&client_id=${ACCESS_KEY}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching Unsplash data: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Error in Unsplash function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};


