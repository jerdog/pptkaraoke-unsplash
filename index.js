// Access the query string parameters
const queryParams = new URLSearchParams(window.location.search);
const delay = (queryParams.get('delay') || 15) * 1000;
const slides = (queryParams.get('slides') || 8); // Default to 8 slides if not provided, for a 2min karaoke presentation
const title = queryParams.get('title') || 'Default Title'; // Default to 'Default Title' if not provided

// Log received query parameters
console.log('Search Term:', title);
console.log('Number of Slides:', slides);
console.log('Delay:', delay);

// Cache DOM elements
const autogenSlidesElement = document.getElementById('autogenSlides');
const titleElement = document.getElementById('titleSlide');

// Initialize Reveal.js
Reveal.initialize({
    width: '70%',
    height: '70%',
    margin: 0.05,
    hash: true,
    controls: true,
    progress: true,
    center: true,
    transition: 'slide', // none/fade/slide/convex/concave/zoom
    slideNumber: 'all',
    hash: true,
    history: true,
    loop: false,
    help: true,
    // autoSlide: 15000,
    autoSlide: delay,
    showNotes: false,
    viewDistance: 5,

    // Learn about plugins: https://revealjs.com/plugins/
    plugins: [RevealMarkdown, RevealHighlight]
});

console.log('Slideshow window initialized.');
window.initSlideshow = initSlideshow;

// Generate the slides based on query parameters
// console.log('Generating slides based on query parameters...');
// const debouncedFetchTitle = debounce(getTalkTitle, 300);
// const debouncedFetchSlides = debounce(fetchSlides, 300);
// debouncedFetchTitle()
// debouncedFetchSlides();

// Main function to initialize the slideshow
async function initSlideshow({ slides, delay, ai }) {
    console.log('Initializing slideshow...');
    const title = await getTalkTitle(ai);
    console.log('Generated Title:', title);
    fetchSlides(slides, delay, title);
}

// Debounce function to limit the rate of function execution
function debounce(func, wait) {
    console.log('Debouncing function...');
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// function to get random talk title
async function getTalkTitle(ai) {
    console.log('Getting talk title...');
    try {
        const response = await fetch(`/.netlify/functions/randomTalkTitle?ai=${ai}`);
        const data = await response.json();
        
        console.log('Title:', data.title);

        if (data.title) {
            const slideTitle = document.createElement('section');
                slideTitle.setAttribute('data-background-image',"https://picsum.photos/1920/1080/")
                slideTitle.setAttribute('data-background-size', 'contain');
                slideTitle.setAttribute('data-background-position', 'center');
                slideTitle.setAttribute('data-background-opacity', '0.5');
                slideTitle.setAttribute('data-autoslide', '0');
                if (title) {
                    slideTitle.innerHTML = `<h3>${data.title}</h3>`;
                } else {
                    throw new Error(data.error || 'Failed to fetch talk title.');
                }          

                document.querySelector('.slides').appendChild(slideTitle);
                // Reveal.sync();
        
            return data.title;
        } else {
            throw new Error(data.error || 'Failed to fetch talk title.');
        }
    } catch (error) {
        console.error('Error fetching talk title:', error);
        return 'Fallback Talk Title'; // Provide a fallback title
    }
}

// Function to fetch data from the Netlify function
async function fetchSlides(slides, delay, title) {
    console.log('Fetching slides...');
        try {
            const response = await fetch(`/.netlify/functions/unsplash?query=${encodeURIComponent(title)}&slides=${slides}`);
                if (!response.ok) throw new Error(`Unsplash request failed: ${response.status}`);
            
            const unsplashData = await response.json();
            const photos = unsplashData.slides;
            console.log('Fetched Photos:', photos);

            photos.forEach(photo => {
                // Create a new section for each photo
                if (photo && photo.urls && photo.urls.regular) { // Ensure the required properties exist
                    // Create a new slide element (section)
                    const slide = document.createElement('section');
                    // Add custom data attributes to the section tag
                    slide.setAttribute('data-background-image', photo.urls.regular);
                    slide.setAttribute('data-background-size', 'contain');
                    slide.setAttribute('data-background-position', 'center');
                    slide.setAttribute('data-author', photo.user.name); // Author's name
                    slide.setAttribute('data-location', photo.location ? photo.location.name : 'Unknown'); // Location (if available)
                    slide.setAttribute('data-created-at', photo.created_at); // Photo creation date
                    slide.innerHTML = `
                    <div class="desc">
                        <font size="3rem;" color="white">
                            Photo by <a href="${photo.user.links.html}?utm_source=Jerdog_PPT_Karaoke&utm_medium=referral" target="_blank">${photo.user.name}</a> on <a href="https://unsplash.com/?utm_source=Jerdog_PPT_Karaoke&utm_medium=referral" target="_blank">Unsplash</a>
                        </font>
                    </div>`;
                    document.querySelector('.slides').appendChild(slide);
                    Reveal.sync();
                } else { 
                    console.warn('Missing photo data:', photo); // Log missing or malformed data for debugging
                }
            });
        } catch (error) {
            console.error('Error fetching data from Netlify function:', error);
            alert('An error occurred while fetching slides. Please try again later.');
        }

    // End the slideshow after the last slides
    const endSlide = document.createElement('section');
        endSlide.innerHTML = `<h2>End</h2>`;
        document.querySelector('.slides').appendChild(endSlide);
        // Reveal.sync();
    }
