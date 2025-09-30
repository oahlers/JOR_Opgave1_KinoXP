import { AuthManager } from './modules/auth.js';
import { ModalManager } from './modules/modal.js';

class DashboardPage {
    async init() {
        document.addEventListener("DOMContentLoaded", () => {
            AuthManager.checkLoginStatus();
            this.loadMovies();
            AuthManager.setupLoginButtons();
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
                    <p><strong>Første visning:</strong> ${firstShow.toLocaleDateString('da-DK')}</p>
                    <p><strong>Vises til:</strong> ${lastShow.toLocaleDateString('da-DK')}</p>
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
                    <button onclick="window.location.href='/calendar'">Se forestillinger</button>
                </div>
            `;
            moviesList.appendChild(movieCard);
        });
    }
}

// Initialize the dashboard page
const dashboardPage = new DashboardPage();
dashboardPage.init();