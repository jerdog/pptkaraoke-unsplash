// Access the query string parameters
const queryParams = new URLSearchParams(window.location.search);
const searchTermsElement = document.getElementById('searchTerms');
const searchTerm = searchTermsElement.getAttribute('data-query') || 'funny photos'; // Default to 'funny photos' if not provided
const numberOfSlides = queryParams.get('slides') || 5; // Default to 5 slides if not provided

// Initialize Reveal.js
 Reveal.initialize({
        width: '70%',
        height: '70%',
        margin: 0.05,
        hash: true,
        controls: false,
        progress: true,
        center: true,
        transition: 'slide', // none/fade/slide/convex/concave/zoom
        slideNumber: 'all',
        hash: true,
        history: true,
        loop: false,
        help: true,
        autoSlide: 15000,
        showNotes: false,
        viewDistance: 5,



        // Learn about plugins: https://revealjs.com/plugins/
        plugins: [ RevealMarkdown, RevealHighlight ]
    });

// Function to generate slides dynamically
function fetchImages() {
    const url = `/.netlify/functions/unsplash?query=${encodeURIComponent(searchTerm)}`;
    for (let i = 0; i < numberOfSlides; i++) {
        // Fetch the random image data from your Netlify function
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok. Error status: ${response.status}; ${searchTerm}`);
                }
                return response.json();
            })
            .then(data => {
                // Use the data to create a slide for each image
                generateSlides(data);
            })
            .catch(error => console.error('Error fetching data from Netlify function:', error));
        }
}

// Function to generate slides dynamically
function generateSlides(data) {
    // Fetch the random image data from your Netlify function
    const photo = data; // The data returned by the Unsplash API
    const slide = document.createElement('section');
    slide.innerHTML = `<figure><img src="${photo.urls.regular}" alt="${photo.alt_description}" style="width:100%; height:auto;"><figcaption style="font-size:15px">via <a href="${photo.urls.regular}" target="_blank">Unsplash</a>, Photographer: ${photo.user.name}</figcaption></figure>`;
    document.getElementById('autogenSlides').appendChild(slide);
    Reveal.sync(); // Sync Reveal.js after dynamically adding content
}

// Generate the slides based on query parameters
fetchImages();
