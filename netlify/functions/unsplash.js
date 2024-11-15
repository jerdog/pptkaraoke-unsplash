exports.handler = async function(event, context) {
  const ACCESS_KEY = process.env.ACCESS_KEY; // Use environment variable
  const queryParams = event.queryStringParameters || {};
  const query = queryParams.query || 'funny nature'; // Default to 'nature' if not provided
  const slides = event.queryStringParameters.slides || 8; // Default to 8 slides if not provided, for a 2min karaoke presentation

  // Log received query parameters
  console.log('Received Query Parameters:', queryParams);
  console.log('Search Term:', query);
  console.log('Number of Slides:', slides);
  console.log('Access Key Present:', !!ACCESS_KEY); // To confirm the key is available (Don't log the actual key)

  try {
    // Construct Unsplash API URL and log it
    const unsplashResponse = await fetch(`https://api.unsplash.com/photos/random?query=${query}&orientation=landscape&content_filter=low&count=${slides}&client_id=${ACCESS_KEY}`);
    if (!unsplashResponse.ok) throw new Error(`Error fetching Unsplash data: ${unsplashResponse.statusText}`);

    // console.log('Constructed Unsplash API URL:', apiUrl); // Log URL to verify

    // Using the built-in fetch in Node.js 18+
    const data = await unsplashResponse.json(); // Unsplash API returns JSON response
    return {
      statusCode: 200,
      body: JSON.stringify({ slides: data }),
    };
    }
    
    // Log the response status and response body
    // console.log('Unsplash Response Status:', unsplashResponse.status);
    // console.log('Unsplash Response Data:', responseData);
  catch (error) {
    console.error('Error in Unsplash function:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
