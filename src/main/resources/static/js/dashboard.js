import { AuthManager } from './modules/auth.js';
import { ModalManager } from './modules/modal.js';

class DashboardPage {
    constructor(){
        this.movies = [];
        this.filters = { genre: 'Alle', age: 'Alle' };
        this.nextShowByMovie = new Map();
        this.setupGlobalHandlers();
    }
    setupGlobalHandlers(){
        window.dashboardHandlers = {
            openMovieInfo: (id) => this.openMovieInfo(id),
            goToShows: () => { window.location.href = '/calendar'; }
        };
    }

    async loadUpcomingShows(){
        try {
            const start = new Date();
            const end = new Date();
            end.setMonth(end.getMonth() + 3);
            const qs = `?start=${encodeURIComponent(start.toISOString())}&end=${encodeURIComponent(end.toISOString())}`;
            const res = await fetch(`/api/shows/between${qs}`);
            if (!res.ok) return;
            const shows = await res.json();
            const now = new Date();
            this.nextShowByMovie.clear();
            for (const s of shows) {
                if (!s || !s.movieId || !s.showTime) continue;
                const st = new Date(s.showTime);
                if (st < now) continue;
                const existing = this.nextShowByMovie.get(s.movieId);
                if (!existing || st < existing) {
                    this.nextShowByMovie.set(s.movieId, st);
                }
            }
        } catch (e) {
            console.warn('Could not load upcoming shows', e);
        }
    }

    '    // renderFeatured funktionen tjekker først om der eksisterer nogle film i databasen
    // Hvis der gør, sortere den filmene efter data, vha. sort af hver film.
    // Hver entry der har været i sort funktionen får hentet deres billede og tilføjet styling
    // Der bliver derefter tilføjet en click funktionen når man trykker på billedet, som henter openMovieInfo funktionen
    // Så hvis en af de 5 billeder trykkes, kan informationer om filmen ses, og man kan gå videre til kalenderen for at booke en billet
    renderFeatured(){
        const container = document.getElementById('featured-movies');
        if (!container) return;
        container.innerHTML = '';
        if (!this.movies || this.movies.length === 0) return;

        const moviesWithSortKey = this.movies.map(m => ({
            movie: m,
            next: this.nextShowByMovie.get(m.id) || null
        })).sort((a,b) => {
            if (a.next && b.next) return a.next - b.next;
            if (a.next && !b.next) return -1;
            if (!a.next && b.next) return 1;
            return 0;
        });

        const topFive = moviesWithSortKey.slice(0,5);
        for (const entry of topFive) {
            const m = entry.movie;
            const img = document.createElement('img');
            img.className = 'movie-thumb';
            img.alt = m.title || 'Film';
            img.style.cursor = 'pointer';
            if (m.imageUrl) {
                img.src = m.imageUrl;
                img.onerror = function(){ this.style.display = 'none'; };
            }
            img.addEventListener('click', () => this.openMovieInfo(m.id));
            const wrap = document.createElement('div');
            wrap.style.textAlign = 'center';
            wrap.appendChild(img);
            const title = document.createElement('div');
            title.textContent = m.title;
            title.style.marginTop = '0.25rem';
            wrap.appendChild(title);
            container.appendChild(wrap);
        }
    }
    async init() {
        document.addEventListener("DOMContentLoaded", () => {
            AuthManager.setupLoginButtons();
            AuthManager.checkLoginStatus();
            this.loadMovies();
        });
    }

    async loadMovies() {
        try {
            const response = await fetch('/api/movies');
            this.movies = await response.json();
            await this.loadUpcomingShows();
            this.renderFeatured();
            this.renderFilters();
            this.applyFiltersAndRender();
        } catch (error) {
            console.error('Error loading movies:', error);
        }
    }'

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
            movieCard.className = 'content-card';

            const imgHtml = movie.imageUrl
                ? `<img src="${movie.imageUrl}" alt="${movie.title}" class="movie-thumb" onerror="this.style.display='none'" onclick="window.dashboardHandlers.openMovieInfo(${movie.id})" style="cursor:pointer;">`
                : '';

            movieCard.innerHTML = `
                ${imgHtml}
                <h3>${movie.title}</h3>
                <div style="margin-top: 0.75rem; display:flex; gap:0.5rem; justify-content:center; flex-wrap:wrap;">
                    <button onclick="window.dashboardHandlers.openMovieInfo(${movie.id})">Vis mere information</button>
                    <button onclick="window.dashboardHandlers.goToShows()" style="background:#333;">Se forestillinger</button>
                </div>
            `;
            moviesList.appendChild(movieCard);
        });
    }

    openMovieInfo(id){
        const movie = this.movies.find(m => String(m.id) === String(id));
        if (!movie) return;
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
        const price = movie.ticketPrice != null ? `<p><strong>Billetpris:</strong> ${movie.ticketPrice} DKK</p>` : '';
        const imgHtml = movie.imageUrl ? `<img src="${movie.imageUrl}" alt="${movie.title}" class="movie-thumb" onerror="this.style.display='none'">` : '';
        const html = `
            <div class="modal-overlay" id="modal-overlay"></div>
            <div class="modal-box" id="modal-box" style="max-width:560px;">
                <button class="modal-close" id="modal-close" title="Luk">&times;</button>
                <div id="modal-content">
                    ${imgHtml}
                    <h2 style="text-align:center;">${movie.title}</h2>
                    <p><strong>Kategori:</strong> ${movie.category}</p>
                    <p><strong>Aldersgrænse:</strong> ${movie.ageLimit}+</p>
                    <p><strong>Varighed:</strong> ${movie.duration} min.</p>
                    <p><strong>Skuespillere:</strong> ${movie.actors}</p>
                    ${price}
                    ${showInfo}
                    <div style="margin-top:0.75rem; display:flex; gap:0.5rem; flex-wrap:wrap; justify-content:center;">
                        <button onclick="window.dashboardHandlers.goToShows()">Se forestillinger</button>
                        <button id="close-info" style="background:#6c757d;">Luk</button>
                    </div>
                </div>
            </div>`;
        ModalManager.showModal(html);
        const btn = document.getElementById('close-info');
        if (btn) btn.addEventListener('click', () => ModalManager.closeModal());
    }
}

const dashboardPage = new DashboardPage();
dashboardPage.init();