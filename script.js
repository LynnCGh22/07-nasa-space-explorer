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
const modalYear = document.getElementById('modal-year');
const modalDescription = document.getElementById('modal-description');
const closeModalButton = document.getElementById('close-modal');
const modalContent = document.querySelector('.modal-content');
const modalBody = document.querySelector('.modal-body');

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

// Function to Show Image Details - Show the full-size image and its details in the modal when a thumbnail is clicked.
function showImageDetails(image) {
    fetch('https://images-api.nasa.gov/search?q={apiKey}&media_type=image')
        .then(response => response.json())
        .then(data => {
            // Process the fetched image details
            if(data.Response === 'True') {
              modalTitle.textContent = data.Title;
              modalYear.textContent = data.Year;
              modalDescription.textContent = data.Plot;
              modalImage.src = data.Poster;
              modal.style.display = 'block';
            } else {
              alert('Error fetching image details:', data.Error);
            }
        })
        .catch(error => {
            console.error('Error fetching image details:', error);
            alert('An error occurred while fetching image details. Please try again later.');
        });
}

// Open Modal - Open the modal to display the full-size image and its details when a thumbnail is clicked.
function openModal(imageUrl, title, description) {
    modalImage.src = imageUrl;
    modalTitle.textContent = title;
    modalDescription.textContent = description;
    modal.style.display = 'block';
}

// Close Modal - Listen for the close button click to close the modal.
closeModalButton.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Close Modal on Outside Click - Listen for clicks outside the modal to close it.
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Close Modal on Escape Key Press - Listen for the Escape key press to close the modal.
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        modal.style.display = 'none';
    }
});

// Allow the "Get Images" button to be triggered by clicking the button.
searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const year = searchInput.value.trim();
    if (year) {
        fetchNasaImages(year);
    }
});

// Allow the "Get Images" button to be triggered by pressing the Enter key when the year input field is focused.
searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        searchForm.dispatchEvent(new Event('submit'));
    }
});