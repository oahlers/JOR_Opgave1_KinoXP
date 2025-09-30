// Movie management functionality
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

    static async openMovieForm(movie = null) {
        const isEdit = movie !== null;

        const modalHTML = `
            <div class="modal-overlay" id="modal-overlay"></div>
            <div class="modal-box" id="modal-box" style="max-width: 500px;">
                <button class="modal-close" id="modal-close">&times;</button>
                <div id="modal-content">
                    <h2>${isEdit ? 'Rediger Film' : 'Tilføj Ny Film'}</h2>
                    <form id="movie-form">
                        <input type="text" id="movie-title" placeholder="Titel" value="${isEdit ? movie.title : ''}" required>
                        <input type="text" id="movie-category" placeholder="Kategori" value="${isEdit ? movie.category : ''}" required>
                        <input type="number" id="movie-age-limit" placeholder="Aldersgrænse" value="${isEdit ? movie.ageLimit : ''}" required>
                        <input type="number" id="movie-duration" placeholder="Varighed (minutter)" value="${isEdit ? movie.duration : ''}" required>
                        <textarea id="movie-actors" placeholder="Skuespillere" required>${isEdit ? movie.actors : ''}</textarea>
                        <select id="movie-theater" required>
                            <option value="">Vælg teater</option>
                            <option value="1" ${isEdit && movie.theaterId === 1 ? 'selected' : ''}>Small Theater</option>
                            <option value="2" ${isEdit && movie.theaterId === 2 ? 'selected' : ''}>Large Theater</option>
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
                    throw new Error('Fejl ved gemning');
                }
            } catch (error) {
                document.getElementById("movie-form-message").textContent = 'Fejl ved gemning af film';
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