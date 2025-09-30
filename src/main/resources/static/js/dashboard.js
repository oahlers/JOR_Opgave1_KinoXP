import { AuthManager } from './modules/auth.js';
import { ModalManager } from './modules/modal.js';

class DashboardPage {
    constructor(){
        this.movies = [];
        this.filters = { genre: 'Alle', age: 'Alle' };
    }
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
            this.movies = await response.json();
            this.renderFilters();
            this.applyFiltersAndRender();
        } catch (error) {
            console.error('Error loading movies:', error);
        }
    }

    renderFilters() {
        const container = document.getElementById('movies-overview');
        let filters = document.getElementById('movie-filters');
        if (!filters) {
            filters = document.createElement('div');
            filters.id = 'movie-filters';
            filters.style.display = 'flex';
            filters.style.gap = '0.5rem';
            filters.style.flexWrap = 'wrap';
            filters.style.alignItems = 'center';
            filters.style.marginBottom = '1rem';
            container.insertBefore(filters, document.getElementById('movies-list'));
        }
        const genres = Array.from(new Set(this.movies.map(m => m.category).filter(Boolean))).sort();
        const ages = Array.from(new Set(this.movies.map(m => m.ageLimit).filter(a => a !== undefined && a !== null))).sort((a,b)=>a-b);
        filters.innerHTML = `
            <label>Genre:
              <select id="filter-genre">
                <option>Alle</option>
                ${genres.map(g => `<option ${this.filters.genre===g?'selected':''}>${g}</option>`).join('')}
              </select>
            </label>
            <label>Aldersgrænse:
              <select id="filter-age">
                <option>Alle</option>
                ${ages.map(a => `<option ${String(this.filters.age)===String(a)?'selected':''}>${a}</option>`).join('')}
              </select>
            </label>
        `;
        document.getElementById('filter-genre').addEventListener('change', (e)=>{ this.filters.genre = e.target.value; this.applyFiltersAndRender(); });
        document.getElementById('filter-age').addEventListener('change', (e)=>{ this.filters.age = e.target.value; this.applyFiltersAndRender(); });
    }

    applyFiltersAndRender(){
        let filtered = this.movies.slice();
        if (this.filters.genre && this.filters.genre !== 'Alle') {
            filtered = filtered.filter(m => m.category === this.filters.genre);
        }
        if (this.filters.age && this.filters.age !== 'Alle') {
            filtered = filtered.filter(m => String(m.ageLimit) === String(this.filters.age));
        }
        this.displayMovies(filtered);
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

            const imgHtml = movie.imageUrl ? `<img src="${movie.imageUrl}" alt="${movie.title}" class="movie-thumb" onerror="this.style.display='none'">` : '';

            movieCard.innerHTML = `
                ${imgHtml}
                <h3>${movie.title}</h3>
                <p><strong>Kategori:</strong> ${movie.category}</p>
                <p><strong>Aldersgrænse:</strong> ${movie.ageLimit}+</p>
                <p><strong>Varighed:</strong> ${movie.duration} min.</p>
                <p><strong>Skuespillere:</strong> ${movie.actors}</p>
                ${movie.ticketPrice != null ? `<p><strong>Billetpris:</strong> ${movie.ticketPrice} DKK</p>` : ''}
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