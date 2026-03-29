// NASA's APOD API has data from June 16, 1995 onwards.
const earliestDate = '1995-06-16';
const today = new Date().toISOString().split('T')[0];

// Find page elements.
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const getImagesButton = document.querySelector('.filters button');
const gallery = document.getElementById('gallery');
const modal = document.getElementById('image-modal');
const modalImage = document.getElementById('modal-image');
const modalTitle = document.getElementById('modal-title');
const modalYear = document.getElementById('modal-year');
const modalDescription = document.getElementById('modal-description');
const closeModalButton = document.getElementById('close-modal');

// Keeping your "searchInput" style so Enter-key logic matches your original approach.
const searchInput = startInput;

// NASA API key (restored from your original file).
// You can switch to 'DEMO_KEY' if needed.
const nasaApiKey = '4wfLNaAe3mRo64uI1gj9LgvbJQbeyJ5kmWIb4iOM';

// Set date limits and default range (last 9 days including today).
setupDateInputs(startInput, endInput);

// Click the button to fetch images.
getImagesButton.addEventListener('click', () => {
	fetchAndRenderApodImages();
});

// Press Enter in either date input to fetch images.
searchInput.addEventListener('keydown', (event) => {
	if (event.key === 'Enter') {
		event.preventDefault();
		fetchAndRenderApodImages();
	}
});

endInput.addEventListener('keydown', (event) => {
	if (event.key === 'Enter') {
		event.preventDefault();
		fetchAndRenderApodImages();
	}
});

// Close modal interactions.
closeModalButton.addEventListener('click', () => {
	modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
	if (event.target === modal) {
		modal.style.display = 'none';
	}
});

window.addEventListener('keydown', (event) => {
	if (event.key === 'Escape') {
		modal.style.display = 'none';
	}
});

// Show the default date range on page load.
fetchAndRenderApodImages();

function setupDateInputs(startDateInput, endDateInput) {
	startDateInput.min = earliestDate;
	startDateInput.max = today;
	endDateInput.min = earliestDate;
	endDateInput.max = today;

	const lastWeek = new Date();
	lastWeek.setDate(lastWeek.getDate() - 8);
	startDateInput.value = lastWeek.toISOString().split('T')[0];
	endDateInput.value = today;

	startDateInput.addEventListener('change', () => {
		const startDate = new Date(startDateInput.value);
		const endDate = new Date(startDate);
		endDate.setDate(startDate.getDate() + 8);

		endDateInput.value =
			endDate > new Date(today) ? today : endDate.toISOString().split('T')[0];
	});
}

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
		const items = Array.isArray(apodData) ? apodData : [apodData];

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
			<button class="details-button" type="button">Show Details</button>
		`;

		const cardImage = card.querySelector('img');
		const detailsButton = card.querySelector('.details-button');

		cardImage.addEventListener('click', () => {
			ShowImageDetails(item);
		});

		detailsButton.addEventListener('click', () => {
			ShowImageDetails(item);
		});

		gallery.appendChild(card);
	});
}

// Show image details in the modal.
function ShowImageDetails(image) {
	modalImage.src = image.hdurl || image.url;
	modalImage.alt = image.title;
	modalTitle.textContent = image.title;
	modalYear.textContent = image.date;
	modalDescription.textContent = image.explanation;
	modal.style.display = 'block';
}

// Keep a lower-case alias so either function name works.
function showImageDetails(image) {
	ShowImageDetails(image);
}