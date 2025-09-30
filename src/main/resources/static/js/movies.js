import { ModalManager } from './modules/modal.js';

class MoviesPage {
    init() {
        document.addEventListener("DOMContentLoaded", () => {
            this.loadMovies();
        });
    }

    async loadMovies() {
        try {
            const response = await fetch('/api/movies');
            const movies = await response.json();
            this.displayMovies(movies);
        } catch (error) {
            console.error('Error loading movies:', error);
        }
    }

    displayMovies(movies) {
        const moviesList = document.getElementById('movies-list');
        moviesList.innerHTML = '';

        if (!movies.length) {
            moviesList.innerHTML = '<p>Ingen film fundet.</p>';
            return;
        }

        movies.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.className = 'card';
            movieCard.style.marginBottom = '1rem';

            let showInfo = '';
            if (movie.firstShowDate && movie.showDays) {
                const firstShow = new Date(movie.firstShowDate);
                const lastShow = new Date(firstShow);
                lastShow.setDate(firstShow.getDate() + Math.min(movie.showDays, 90));
                showInfo = `
                    <p><strong>Første visning:</strong> ${firstShow.toLocaleDateString('da-DK')} kl. ${firstShow.toLocaleTimeString('da-DK', {hour: '2-digit', minute:'2-digit'})}</p>
                    <p><strong>Vises til:</strong> ${lastShow.toLocaleDateString('da-DK')}</p>
                    <p><strong>Teater:</strong> ${movie.theaterId === 1 ? 'Small Theater' : 'Large Theater'}</p>
                `;
            }

            movieCard.innerHTML = `
                <h3>${movie.title}</h3>
                <p><strong>Kategori:</strong> ${movie.category}</p>
                <p><strong>Aldersgrænse:</strong> ${movie.ageLimit}+</p>
                <p><strong>Varighed:</strong> ${movie.duration} min.</p>
                <p><strong>Skuespillere:</strong> ${movie.actors}</p>
                ${showInfo}
                <div style="margin-top: 1rem;">
                    <button onclick="moviesPage.openMovieModal(${movie.id})">Se detaljer / Book</button>
                </div>
            `;
            moviesList.appendChild(movieCard);
        });
    }

    async openMovieModal(movieId) {
        try {
            const response = await fetch(`/api/movies/${movieId}`);
            const movie = await response.json();

            const today = new Date();
            const maxBookingDate = new Date(today.getFullYear(), today.getMonth() + 2, today.getDate());

            const modalHTML = `
                <div class="modal-overlay" id="modal-overlay"></div>
                <div class="modal-box" id="modal-box" style="max-width: 500px;">
                    <button class="modal-close" id="modal-close">&times;</button>
                    <div id="modal-content">
                        <h2>${movie.title}</h2>
                        <p><strong>Kategori:</strong> ${movie.category}</p>
                        <p><strong>Aldersgrænse:</strong> ${movie.ageLimit}+</p>
                        <p><strong>Varighed:</strong> ${movie.duration} min.</p>
                        <p><strong>Skuespillere:</strong> ${movie.actors}</p>
                        <p><strong>Teater:</strong> ${movie.theaterId === 1 ? 'Small Theater' : 'Large Theater'}</p>
                        <p><strong>Første visning:</strong> ${new Date(movie.firstShowDate).toLocaleDateString('da-DK')} kl. ${new Date(movie.firstShowDate).toLocaleTimeString('da-DK', {hour:'2-digit', minute:'2-digit'})}</p>
                        <form id="booking-form">
                            <label for="booking-date">Vælg dato:</label>
                            <input type="date" id="booking-date" name="booking-date" min="${today.toISOString().split('T')[0]}" max="${maxBookingDate.toISOString().split('T')[0]}" required>
                            <label for="num-seats">Antal pladser:</label>
                            <input type="number" id="num-seats" name="num-seats" min="1" max="10" required>
                            <button type="submit">Book</button>
                        </form>
                        <p id="booking-message"></p>
                    </div>
                </div>
            `;

            ModalManager.showModal(modalHTML);

            document.getElementById("booking-form").addEventListener("submit", (e) => {
                e.preventDefault();
                const date = document.getElementById("booking-date").value;
                const seats = document.getElementById("num-seats").value;
                document.getElementById("booking-message").textContent = `Du har booket ${seats} plads(er) til ${date}.`;
            });

        } catch (error) {
            console.error('Fejl ved åbning af modal:', error);
        }
    }
}

// Initialize the movies page
const moviesPage = new MoviesPage();
moviesPage.init();