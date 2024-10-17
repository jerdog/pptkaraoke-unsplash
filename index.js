// Access the query string parameters
const queryParams = new URLSearchParams(window.location.search);
const searchTermsElement = document.getElementById('searchTerms');
const searchTerm = searchTermsElement.getAttribute('data-query') || 'funny photos'; // Default to 'funny photos' if not provided
const numberOfSlides = queryParams.get('slides') || 8; // Default to 8 slides if not provided, for a 2min karaoke presentation

console.log('Search Term:', searchTerm);

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

// Function to fetch data from the Netlify function
function fetchSlides() {
    const url = `/.netlify/functions/unsplash?query=${encodeURIComponent(searchTerm)}&slides=${numberOfSlides}`;
    // console.log('Constructed URL:', url); // Log to ensure it's correct
  
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // console.log('Unsplash API Response:', data); // Log the API response
        generateSlides(data); // Use the data to generate slides
      })
      .catch(error => console.error('Error fetching data from Netlify function:', error));
  }

// Function to generate slides dynamically
function generateSlides(photos) {
    console.log('Photos Data:', photos);

    photos.forEach(photo => {
        if (photo && photo.urls && photo.urls.regular) { // Ensure the required properties exist
          const slide = document.createElement('section');
          slide.innerHTML = 
            "<figure>" + 
                "<a href=" + photo.links.download_location + ">" +
                "<img src=" + photo.urls.regular + " alt=" + photo.alt_description + " style=width:100%; height:auto;></a>" + 
                    "<figcaption style=font-size:15px;>" +
                        // API requires using profile link with utm: ?utm_source=your_app_name&utm_medium=referral
                        "Photo by <a href=" + photo.user.links.html + 
                            "?utm_source=Jerdog_PPT_Karaoke&utm_medium=referral target=_blank>" + photo.user.name + " </a> " +
                        "on <a href=https://unsplash.com/?utm_source=Jerdog_PPT_Karaoke&utm_medium=referral target=_blank>Unsplash</a>" +
                    "<figcaption>" + 
            "</figure>";
          document.getElementById('autogenSlides').appendChild(slide);
          Reveal.sync(); // Sync Reveal.js after dynamically adding content
        } else {
          console.warn('Missing photo data:', photo); // Log missing or malformed data
        }
      });
  }

// Generate the slides based on query parameters
fetchSlides();
