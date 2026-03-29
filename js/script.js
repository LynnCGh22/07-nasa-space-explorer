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
// Display Image Elements (Year, Title, Explanation, etc.)
const imageModal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalYear = document.getElementById('modalYear');
const modalExplanation = document.getElementById('modalExplanation');
const modalCloseButton = document.getElementById('modalCloseButton');
const modalVideo = document.getElementById('modalVideo');

// Function to render the gallery with images
function renderGallery(items) {
  // Clear the gallery
  gallery.innerHTML = '';
  
  // Filter to only show image entries (some APOD entries are videos)
  const imageItems = items.filter((item) => item.media_type === 'image');
  
  // Check if we have any images
  if (imageItems.length === 0) {
    gallery.innerHTML = `
      <div class="placeholder">
        <p>No images found in this date range. Try different dates.</p>
      </div>
    `;
    return;
  }

  //Check if we have any videos 
  if (items.some((item) => item.media_type === 'video')) {
    gallery.innerHTML += `
      <div class="placeholder">
        <p>Some entries in this date range are videos. Click on an image to see details.</p>
      </div>
    `;
  } 
  
  // Loop through each image and create a gallery item
  imageItems.forEach((item) => {
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    galleryItem.innerHTML = `
      <img src="${item.url}" alt="${item.title}" class="gallery-image" />
      <div class="gallery-info">
        <h3>${item.title}</h3>
        <p>${item.date}</p>
      </div>
    `;
    gallery.appendChild(galleryItem);
  });
  
  // Add click listeners to each gallery item to show the modal
  document.querySelectorAll('.gallery-item').forEach((item, index) => {
    item.addEventListener('click', () => {
      showImageModal(imageItems[index]);
    });
  });
}

// Function to show the modal with image details
function showImageModal(imageData) {
  // Update modal content with the image data
  modalImage.src = imageData.url;
  modalTitle.textContent = imageData.title;
  modalDate.textContent = imageData.date;
  modalYear.textContent = new Date(imageData.date).getFullYear();
  modalExplanation.textContent = imageData.explanation;
  
  // Show the modal
  imageModal.style.display = 'block';
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
  // Check each date range to see if there are any APOD video entries, and if so, show a message to the user that some entries are videos and they can click on an image to see details
  if(apodData.some((item) => item.media_type === 'video')) {
    gallery.innerHTML = `
      <div class="placeholder">
        <p>Some entries in this date range are videos. Click on an image to see details.</p>
      </div>
    `;
  }
  
  // Show loading message
  gallery.innerHTML = `
    <div class="placeholder">
      <p>Loading NASA images...</p>
    </div>
  `;
  
  // Build the NASA API URL with the selected dates
  const url = `https://api.nasa.gov/planetary/apod?api_key=${nasaApiKey}&start_date=${startDate}&end_date=${endDate}`;
  
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
  imageModal.style.display = 'none';
});

// Close modal when clicking outside the modal content
window.addEventListener('click', (event) => {
  if (event.target === imageModal) {
    imageModal.style.display = 'none';
  }
});

// Load images immediately for the default date range when the page loads
fetchAndRenderApodImages();


