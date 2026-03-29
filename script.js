// script.js

const apiKey = '4wfLNaAe3mRo64uI1gj9LgvbJQbeyJ5kmWIb4iOM'; // Replace with your OMDb API key
// DOM Elements - Obtain the year input in the search form to display NASA images based on the year entered by the user.
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('year-input');
const imageResults = document.getElementById('image-results');

// Modal Elements - Obtain the modal elements to display the full-size image and its details when a thumbnail is clicked.
const modal = document.getElementById('image-modal');
const modalImage = document.getElementById('modal-image');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const closeModalButton = document.getElementById('close-modal');

// Event Listener for Search Form - Listen for the form submission to trigger the search for NASA images based on the year entered by the user.
searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const year = searchInput.value.trim();
    if (year) {
        await fetchNasaImages(year);
    }
});

// Fetch NASA Images - Fetch images from the NASA API based on the year entered by the user and display them as thumbnails.
async function fetchNasaImages(year) {
    try {
        const response = await fetch(`https://images-api.nasa.gov/search?q=${year}&media_type=image`);
        const data = await response.json();
        displayImages(data.collection.items);
    } catch (error) {
        console.error('Error fetching NASA images:', error);
    }
}

// Display Images - Display the fetched NASA images as thumbnails in the image results section.
function displayImages(images) {
    imageResults.innerHTML = '';
    images.forEach(image => {
        const thumbnailUrl = image.links[0].href;
        const title = image.data[0].title;
        const description = image.data[0].description;

        const imgElement = document.createElement('img');
        imgElement.src = thumbnailUrl;
        imgElement.alt = title;
        imgElement.classList.add('thumbnail');
        imgElement.addEventListener('click', () => openModal(thumbnailUrl, title, description));

        imageResults.appendChild(imgElement);
    });
}
