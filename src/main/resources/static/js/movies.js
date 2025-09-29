const moviesList = document.getElementById('movies-list');

// Hent film fra backend
fetch('/api/movies')
    .then(response => response.json())
    .then(movies => {
        movies.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `<h3>${movie.title}</h3><p>${movie.category}</p>`;
            card.addEventListener('click', () => openModal(movie));
            moviesList.appendChild(card);
        });
    })
    .catch(error => console.error('Error fetching movies:', error));

// Modal logik
const modal = document.getElementById('movie-modal');
const closeModalBtn = document.getElementById('close-modal');

closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', e => {
    if (e.target === modal) modal.style.display = 'none';
});

function openModal(movie) {
    document.getElementById('modal-title').textContent = movie.title;
    document.getElementById('modal-category').textContent = movie.category;
    document.getElementById('modal-age').textContent = movie.ageLimit;
    document.getElementById('modal-duration').textContent = movie.duration;
    document.getElementById('modal-actors').textContent = movie.actors;

    // Sæt booking dato: nuværende måned + 2 måneder
    const bookingDate = document.getElementById('booking-date');
    const today = new Date();
    const maxDate = new Date(today.getFullYear(), today.getMonth() + 2, today.getDate());
    bookingDate.min = today.toISOString().split('T')[0];
    bookingDate.max = maxDate.toISOString().split('T')[0];

    modal.style.display = 'block';
}

// Booking form
const bookingForm = document.getElementById('booking-form');
bookingForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const date = document.getElementById('booking-date').value;
    const seats = document.getElementById('num-seats').value;
    document.getElementById('booking-message').textContent = `Du har booket ${seats} plads(er) til ${date}.`;
});
