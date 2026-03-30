// This file is for our main JavaScript code that interacts with the NASA API and updates the page
// Demo key for NASA API (you can get your own key from https://api.nasa.gov/)
const nasaApiKey = '4wfLNaAe3mRo64uI1gj9LgvbJQbeyJ5kmWIb4iOM';
// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);
// Find the button and gallery container on the page
const getImagesButton = document.getElementById('getImagesButton');
const gallery = document.getElementById('gallery');
const spaceFactText = document.getElementById('spaceFactText');
const spaceFactLink = document.getElementById('spaceFactLink');
// Display Image Elements (Year, Title, Explanation, etc.)
const imageModal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalYear = document.getElementById('modalYear');
const modalExplanation = document.getElementById('modalExplanation');
const modalVideoMessage = document.getElementById('modalVideoMessage');
const modalVideoLinkWrap = document.getElementById('modalVideoLinkWrap');
const modalVideoLink = document.getElementById('modalVideoLink');
const modalCloseButton = document.getElementById('modalCloseButton');
const modalVideo = document.getElementById('modalVideo');

// Helper function to count how many APOD entries are videos
function countVideoEntries(items) {
  return items.filter((item) => item.media_type === 'video').length;
}

// Helper function to convert some common video links to embeddable links
function getEmbeddableVideoUrl(videoUrl) {
  try {
    const parsedUrl = new URL(videoUrl);

    // Convert YouTube watch links to embed links
    if (parsedUrl.hostname.includes('youtube.com') && parsedUrl.searchParams.get('v')) {
      const videoId = parsedUrl.searchParams.get('v');
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // Convert youtu.be short links to embed links
    if (parsedUrl.hostname.includes('youtu.be')) {
      const videoId = parsedUrl.pathname.replace('/', '');
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // Most other providers (including many apod.nasa.gov pages) block iframe embed.
    // Return null so we can show a thumbnail + external link fallback.
    return null;
  } catch (error) {
    return null;
  }
}

// Function to render the gallery with images
function renderGallery(items) {
  // Clear the gallery
  gallery.innerHTML = '';

  // Check if we have any entries to display
  if (items.length === 0) {
    gallery.innerHTML = `
      <div class="placeholder">
        <p>No APOD entries found in this date range. Try different dates.</p>
      </div>
    `;
    return;
  }

  // Show a note when the selected date range includes videos
  const videoCount = countVideoEntries(items);
  if (videoCount > 0) {
    gallery.innerHTML += `
      <div class="placeholder">
        <p>${videoCount} entr${videoCount === 1 ? 'y is' : 'ies are'} video${videoCount === 1 ? '' : 's'} in this date range. Click any card to see details.</p>
      </div>
    `;
  } 
  
  // Loop through each APOD item (image or video) and create a gallery item
  items.forEach((item) => {
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    galleryItem.setAttribute('tabindex', '0');
    galleryItem.setAttribute('role', 'button');
    galleryItem.setAttribute('aria-label', `${item.title} from ${item.date}. Open details`);

    // Use image URL for images and thumbnail URL for videos when available
    const previewUrl = item.media_type === 'video' ? item.thumbnail_url : item.url;
    const previewElement = previewUrl
      ? `<img src="${previewUrl}" alt="${item.title}" class="gallery-image" />`
      : `<div class="gallery-video-fallback">Video Preview</div>`;

    galleryItem.innerHTML = `
      ${previewElement}
      <div class="gallery-info">
        <h3>${item.title}</h3>
        <p>${item.date} ${item.media_type === 'video' ? '• Video' : '• Image'}</p>
      </div>
    `;
    gallery.appendChild(galleryItem);
  });
  
  // Add click listeners to each gallery item to show the modal
  document.querySelectorAll('.gallery-item').forEach((item, index) => {
    item.addEventListener('click', () => {
      showMediaModal(items[index]);
    });

    // Support keyboard users: Enter and Space open the selected item.
    item.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        showMediaModal(items[index]);
      }
    });
  });
}

// Function to show the modal with image or video details
function showMediaModal(mediaData) {
  modalVideoMessage.style.display = 'none';
  modalVideoMessage.textContent = '';
  modalVideoLinkWrap.style.display = 'none';
  modalVideoLink.href = '#';

  // Show an embedded video when APOD entry is a video
  if (mediaData.media_type === 'video') {
    const embeddableVideoUrl = getEmbeddableVideoUrl(mediaData.url);

    modalImage.style.display = 'none';
    modalImage.src = '';

    if (embeddableVideoUrl) {
      modalVideo.style.display = 'block';
      modalVideo.src = embeddableVideoUrl;
    } else {
      // If iframe embed is not supported, show thumbnail image instead.
      modalVideo.style.display = 'none';
      modalVideo.src = '';
      modalImage.style.display = 'block';
      modalImage.src = mediaData.thumbnail_url || '';

      modalVideoMessage.style.display = 'block';
      modalVideoMessage.textContent = 'This video cannot be embedded here, but you can still open it in a new tab.';
      modalVideoLinkWrap.style.display = 'block';
      modalVideoLink.href = mediaData.url;
    }
  } else {
    modalVideo.style.display = 'none';
    modalVideo.src = '';
    modalImage.style.display = 'block';
    modalImage.src = mediaData.url;
  }

  modalTitle.textContent = mediaData.title;
  modalDate.textContent = mediaData.date;
  modalYear.textContent = new Date(mediaData.date).getFullYear();
  modalExplanation.textContent = mediaData.explanation;
  
  // Show the modal
  imageModal.style.display = 'block';
  modalCloseButton.focus();
}

// Helper function to close modal and stop any playing video
function closeModal() {
  imageModal.style.display = 'none';
  modalVideo.src = '';
  modalVideoMessage.style.display = 'none';
  modalVideoLinkWrap.style.display = 'none';
}

// Helper function to shorten long APOD explanations into a quick fun fact
function buildFunFactFromExplanation(explanationText) {
  const firstSentence = explanationText.split('. ')[0]?.trim();

  if (!firstSentence) {
    return 'Space is full of amazing discoveries from NASA every day!';
  }

  return firstSentence.endsWith('.') ? firstSentence : `${firstSentence}.`;
}

// Function to fetch one random APOD entry and display a fun fact
async function fetchAndRenderSpaceFact() {
  const factApiUrl = `https://api.nasa.gov/planetary/apod?api_key=${nasaApiKey}&count=1`;

  try {
    const response = await fetch(factApiUrl);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const apodFactData = await response.json();
    const randomEntry = Array.isArray(apodFactData) ? apodFactData[0] : null;

    if (!randomEntry || !randomEntry.explanation) {
      throw new Error('No fun fact available right now');
    }

    const funFact = buildFunFactFromExplanation(randomEntry.explanation);
    spaceFactText.textContent = funFact;

    // Link directly to the API endpoint for the exact APOD date used in this fact.
    spaceFactLink.href = `https://api.nasa.gov/planetary/apod?api_key=${nasaApiKey}&date=${randomEntry.date}`;
  } catch (error) {
    console.error('Error fetching space fact:', error);
    spaceFactText.textContent = 'Could not load a space fact right now. Try refreshing the page!';
    spaceFactLink.href = 'https://api.nasa.gov/planetary/apod';
  }
}

// Function to fetch and render images from NASA APOD API
async function fetchAndRenderApodImages() {
  const startDate = startInput.value;
  const endDate = endInput.value;
  
  // Check if both dates are selected
  if (!startDate || !endDate) {
    gallery.innerHTML = `
      <div class="placeholder">
        <p>Please select both start and end dates.</p>
      </div>
    `;
    return;
  }
  // Show loading message
  gallery.innerHTML = `
    <div class="placeholder">
      <p>Loading NASA images...</p>
    </div>
  `;
  
  // Build the NASA API URL with the selected dates
  const url = `https://api.nasa.gov/planetary/apod?api_key=${nasaApiKey}&start_date=${startDate}&end_date=${endDate}&thumbs=true`;
  
  try {
    // Fetch data from the NASA API
    const response = await fetch(url);
    
    // Check if the response is ok (status code 200-299)
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    
    // Parse the JSON response
    const apodData = await response.json();
    
    // NASA APOD API returns an array of images
    if (Array.isArray(apodData) && apodData.length > 0) {
      // Sort images by date (newest first)
      apodData.sort((a, b) => new Date(b.date) - new Date(a.date));
      renderGallery(apodData);
    }
    else {
      throw new Error('No images found for the selected date range');
    }
    
  } catch (error) {
    // Log the error to the console for debugging
    console.error('Error fetching APOD images:', error);
    gallery.innerHTML = `
      <div class="placeholder">
        <p>Sorry, we could not load images right now. Please try again.</p>
      </div>
    `;
  }
}

// Add click event listener to the button to fetch images
getImagesButton.addEventListener('click', fetchAndRenderApodImages);

// Close modal when the close button is clicked
modalCloseButton.addEventListener('click', () => {
  closeModal();
});

// Close modal when clicking outside the modal content
window.addEventListener('click', (event) => {
  if (event.target === imageModal) {
    closeModal();
  }
});

// Close modal with Escape key for keyboard accessibility
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && imageModal.style.display === 'block') {
    closeModal();
  }
});

// Load images immediately for the default date range when the page loads
fetchAndRenderApodImages();

// Load a fun space fact when the page loads
fetchAndRenderSpaceFact();

// Theme Toggle - Light/Dark Mode
// Get the theme toggle button and the body element
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Check if user has a saved theme preference in localStorage
const savedTheme = localStorage.getItem('theme');

// Apply saved theme or default to light mode
if (savedTheme === 'dark') {
  body.classList.add('dark-mode');
  themeToggle.textContent = '☀️'; // Show sun icon when in dark mode
} else {
  body.classList.remove('dark-mode');
  themeToggle.textContent = '🌙'; // Show moon icon when in light mode
}

// Add click event listener to toggle between light and dark modes
themeToggle.addEventListener('click', () => {
  // Toggle dark-mode class on the body
  body.classList.toggle('dark-mode');
  
  // Update the button icon based on the current mode
  if (body.classList.contains('dark-mode')) {
    themeToggle.textContent = '☀️'; // Show sun icon to let user switch to light mode
    localStorage.setItem('theme', 'dark'); // Save preference
  } else {
    themeToggle.textContent = '🌙'; // Show moon icon to let user switch to dark mode
    localStorage.setItem('theme', 'light'); // Save preference
  }
});


