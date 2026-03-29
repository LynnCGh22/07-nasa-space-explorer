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
const ImageYear = document.getElementById('ImageYear');
const ImageTitle = document.getElementById('ImageTitle');
const ImageExplanation = document.getElementById('ImageExplanation');
const ImageURL = document.getElementById('ImageURL');
const ImageMediaType = document.getElementById('ImageMediaType');


// Load images when the button is clicked.
getImagesButton.addEventListener('click', () => {
  fetchAndRenderApodImages();
});

// Optional: load images immediately for the default date range.
fetchAndRenderApodImages();

// Fetch APOD data for the selected date range, then render it.
async function fetchAndRenderApodImages() {
  const startDate = startInput.value;
  const endDate = endInput.value;

  if (!startDate || !endDate) {
    gallery.innerHTML = `
      <div class="placeholder">
        <p>Please select both start and end dates.</p>
      </div>
    `;
    return;
  }

  gallery.innerHTML = `
    <div class="placeholder">
      <p>Loading NASA images...</p>
    </div>
  `;

  const url = `https://api.nasa.gov/planetary/apod?api_key=${nasaApiKey}&start_date=${startDate}&end_date=${endDate}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const apodData = await response.json();

    // APOD can return a single object or an array depending on the query.
    const items = Array.isArray(apodData) ? apodData : [apodData];

    // Show newest entries first for a more natural gallery experience.
    items.sort((a, b) => new Date(b.date) - new Date(a.date));

    renderGallery(items);
  } catch (error) {
    console.error('Error fetching APOD images:', error);
    gallery.innerHTML = `
      <div class="placeholder">
        <p>Sorry, we could not load images right now. Please try again.</p>
      </div>
    `;
  }
}

// Build the gallery cards and only render entries that are actual images.
function renderGallery(items) {
  const imageItems = items.filter((item) => item.media_type === 'image');

  if (imageItems.length === 0) {
    gallery.innerHTML = `
      <div class="placeholder">
        <p>No image results in this date range. Try different dates.</p>
      </div>
    `;
    return;
  }

  gallery.innerHTML = '';

  imageItems.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'gallery-item';

    card.innerHTML = `
      <img src="${item.url}" alt="${item.title}">
      <p><strong>${item.title}</strong></p>
      <p>${item.date}</p>
      <p>${item.explanation}</p>
    `;

    gallery.appendChild(card);
  });
}


