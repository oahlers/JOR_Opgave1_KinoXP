import { ModalManager } from './modal.js';
export class MovieManager {
    static async loadMovies() {
        try {
            const response = await fetch('/api/movies');
            const movies = await response.json();
            this.displayMovies(movies);
        } catch (error) {
            console.error('Error loading movies:', error);
        }
    }

    static displayMovies(movies) {
        const moviesList = document.getElementById('movies-list');
        moviesList.innerHTML = '';

        movies.forEach(movie => {
            const movieItem = document.createElement('div');
            movieItem.className = 'card';
            movieItem.style.marginBottom = '1rem';
            movieItem.innerHTML = `
                <h3>${movie.title}</h3>
                <p><strong>Kategori:</strong> ${movie.category}</p>
                <p><strong>Aldersgrænse:</strong> ${movie.ageLimit}+</p>
                <p><strong>Varighed:</strong> ${movie.duration} min</p>
                <p><strong>Skuespillere:</strong> ${movie.actors}</p>
                <div style="margin-top: 1rem;">
                    <button onclick="MovieManager.editMovie(${movie.id})">Rediger</button>
                    <button onclick="MovieManager.deleteMovie(${movie.id})" style="background: #dc3545; margin-left: 0.5rem;">Slet</button>
                </div>
            `;
            moviesList.appendChild(movieItem);
        });
    }

    // Når vi opretter en film, bruger vi først innerhtml til at oprette en tom formular
    // Når formularen er udfyldt bruges movieData til at holde på de værdier der er blevet indskrevet
    // moviedata bliver omdannet til JSON vha. stringify, så backend kan parse det tilbage til et objekt
    // på den måde kan en backend klasserne bruges til at gemme den nyoprettede film i databasen
    static async openMovieForm(movie = null) {
        const isEdit = movie !== null;

        const modalHTML = `
            <div class="modal-overlay" id="modal-overlay"></div>
            <div class="modal-box" id="modal-box" style="max-width: 560px;">
                <button class="modal-close" id="modal-close">&times;</button>
                <div id="modal-content">
                    <h2>${isEdit ? 'Rediger Film' : 'Tilføj Ny Film'}</h2>
                    <form id="movie-form">
                        <input type="text" id="movie-title" placeholder="Titel" value="${isEdit ? movie.title : ''}" required>
                        <select id="movie-category" required>
                            <option value="">Vælg genre</option>
                            ${['Action','Adventure','Animation','Comedy','Crime','Drama','Fantasy','Horror','Mystery','Romance','Sci-Fi','Thriller','Documentary'].map(g => `<option value="${g}" ${isEdit && movie.category === g ? 'selected' : ''}>${g}</option>`).join('')}
                        </select>
                        <select id="movie-age-limit" required>
                            ${[0,7,11,12,15,18].map(a => `<option value="${a}" ${isEdit && Number(movie.ageLimit)===a ? 'selected' : ''}>Aldersgrænse: ${a}+</option>`).join('')}
                        </select>
                        <input type="number" id="movie-duration" placeholder="Varighed (minutter)" value="${isEdit ? movie.duration : ''}" required>
                        <textarea id="movie-actors" placeholder="Skuespillere" required>${isEdit ? movie.actors : ''}</textarea>
                        <label for="movie-first-date">Første visningsdato</label>
                        <input type="date" id="movie-first-date" value="${isEdit && movie.firstShowDate ? movie.firstShowDate : ''}" required>
                        <label for="movie-show-days">Antal dage filmen vises</label>
                        <input type="number" id="movie-show-days" min="1" max="90" value="${isEdit ? movie.showDays : 7}" required>
                        <label for="movie-ticket-price">Billetpris (DKK)</label>
                        <input type="number" id="movie-ticket-price" step="0.5" min="0" value="${isEdit && movie.ticketPrice != null ? movie.ticketPrice : ''}" required>
                        <label for="movie-image-url">Billede URL</label>
                        <input type="url" id="movie-image-url" placeholder="https://..." value="${isEdit && movie.imageUrl ? movie.imageUrl : ''}">
                        <select id="movie-theater" required>
                            <option value="">Vælg sal</option>
                            <option value="1" ${isEdit && Number(movie.theaterId) === 1 ? 'selected' : ''}>Lille sal</option>
                            <option value="2" ${isEdit && Number(movie.theaterId) === 2 ? 'selected' : ''}>Store sal</option>
                        </select>
                        <button type="submit">${isEdit ? 'Opdater Film' : 'Tilføj Film'}</button>
                    </form>
                    <div id="movie-form-message" style="margin-top: 1rem;"></div>
                </div>
            </div>
        `;

        ModalManager.showModal(modalHTML);

        document.getElementById("movie-form").addEventListener("submit", async (e) => {
            e.preventDefault();

            const movieData = {
                title: document.getElementById("movie-title").value,
                category: document.getElementById("movie-category").value,
                ageLimit: parseInt(document.getElementById("movie-age-limit").value),
                duration: parseInt(document.getElementById("movie-duration").value),
                actors: document.getElementById("movie-actors").value,
                firstShowDate: document.getElementById("movie-first-date").value,
                showDays: parseInt(document.getElementById("movie-show-days").value),
                ticketPrice: parseFloat(document.getElementById("movie-ticket-price").value),
                imageUrl: document.getElementById("movie-image-url").value || null,
                theaterId: parseInt(document.getElementById("movie-theater").value)
            };

            try {
                const url = isEdit ? `/api/movies/${movie.id}` : '/api/movies';
                const method = isEdit ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method: method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(movieData)
                });

                if (response.ok) {
                    document.getElementById("movie-form-message").textContent =
                        isEdit ? 'Film opdateret!' : 'Film tilføjet!';
                    document.getElementById("movie-form-message").style.color = "green";

                    setTimeout(() => {
                        ModalManager.closeModal();
                        this.loadMovies();
                    }, 1500);
                } else {
                    let serverMsg = '';
                    try { serverMsg = await response.text(); } catch (_) {}
                    const trimmed = (serverMsg || '').trim();
                    const msg = trimmed.length > 0 ? trimmed : 'Fejl ved gemning af film';
                    throw new Error(msg);
                }
            } catch (error) {
                document.getElementById("movie-form-message").textContent = error?.message || 'Fejl ved gemning af film';
                document.getElementById("movie-form-message").style.color = "red";
            }
        });
    }

    static async editMovie(movieId) {
        try {
            const response = await fetch(`/api/movies/${movieId}`);
            const movie = await response.json();
            this.openMovieForm(movie);
        } catch (error) {
            console.error('Error loading movie:', error);
        }
    }

    static async deleteMovie(movieId) {
        if (confirm('Er du sikker på at du vil slette denne film?')) {
            try {
                const response = await fetch(`/api/movies/${movieId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    this.loadMovies();
                } else {
                    alert('Fejl ved sletning af film');
                }
            } catch (error) {
                console.error('Error deleting movie:', error);
                alert('Fejl ved sletning af film');
            }
        }
    }
}