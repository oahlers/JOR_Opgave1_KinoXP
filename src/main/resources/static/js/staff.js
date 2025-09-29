document.addEventListener("DOMContentLoaded", () => {
    // Log ud funktionalitet
    document.getElementById('staff-logout-btn').addEventListener('click', () => {
        window.location.href = '/';
    });

    // Administration knapper
    document.getElementById('manage-movies-btn').addEventListener('click', () => {
        showSection('movies-section');
        loadMovies();
    });

    document.getElementById('manage-staff-btn').addEventListener('click', () => {
        showSection('staff-section');
        loadStaff();
    });

    // Tilføj nye knapper
    document.getElementById('add-movie-btn').addEventListener('click', () => {
        openMovieModal();
    });

    document.getElementById('add-staff-btn').addEventListener('click', () => {
        openStaffModal();
    });
});

function showSection(sectionId) {
    // Skjul alle sektioner
    document.getElementById('movies-section').style.display = 'none';
    document.getElementById('staff-section').style.display = 'none';

    // Vis valgt sektion
    document.getElementById(sectionId).style.display = 'block';
}

// === FILM ADMINISTRATION ===
async function loadMovies() {
    try {
        const response = await fetch('/api/movies');
        const movies = await response.json();
        displayMovies(movies);
    } catch (error) {
        console.error('Error loading movies:', error);
    }
}

function displayMovies(movies) {
    const moviesList = document.getElementById('movies-list');
    moviesList.innerHTML = '';

    if (movies.length === 0) {
        moviesList.innerHTML = '<p>Ingen film fundet.</p>';
        return;
    }

    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'card';
        movieCard.style.marginBottom = '1rem';

        let showInfo = '';
        if (movie.firstShowDate && movie.showDays) {
            const firstShow = new Date(movie.firstShowDate).toLocaleDateString('da-DK');
            showInfo = `
                <p><strong>Visningsperiode:</strong> ${firstShow} i ${movie.showDays} dage</p>
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
                <button onclick="editMovie(${movie.id})" style="margin-right: 0.5rem;">Rediger</button>
                <button onclick="deleteMovie(${movie.id})" style="background: #dc3545;">Slet</button>
            </div>
        `;
        moviesList.appendChild(movieCard);
    });
}

function openMovieModal(movie = null) {
    const isEdit = movie !== null;

    // Format date for input field
    let firstShowDate = '';
    if (isEdit && movie.firstShowDate) {
        firstShowDate = movie.firstShowDate;
    }

    const modalHTML = `
        <div class="modal-overlay" id="modal-overlay"></div>
        <div class="modal-box" id="modal-box" style="max-width: 500px;">
            <button class="modal-close" id="modal-close">&times;</button>
            <div id="modal-content">
                <h2 style="text-align: center;">${isEdit ? 'Rediger Film' : 'Tilføj Ny Film'}</h2>
                <form id="movie-form">
                    <input type="text" name="title" placeholder="Titel" value="${isEdit ? movie.title : ''}" required>
                    <input type="text" name="category" placeholder="Kategori" value="${isEdit ? movie.category : ''}" required>
                    <input type="number" name="ageLimit" placeholder="Aldersgrænse" value="${isEdit ? movie.ageLimit : ''}" required>
                    <input type="number" name="duration" placeholder="Varighed (minutter)" value="${isEdit ? movie.duration : ''}" required>
                    <textarea name="actors" placeholder="Skuespillere" rows="3" required>${isEdit ? movie.actors : ''}</textarea>
                    
                    <!-- Teater valg -->
                    <div>
                        <label><strong>Vælg Teater:</strong></label>
                        <select name="theaterId" required>
                            <option value="">Vælg teater...</option>
                            <option value="1" ${isEdit && movie.theaterId == 1 ? 'selected' : ''}>Small Theater (20 rækker, 12 sæder pr. række)</option>
                            <option value="2" ${isEdit && movie.theaterId == 2 ? 'selected' : ''}>Large Theater (25 rækker, 16 sæder pr. række)</option>
                        </select>
                    </div>
                    
                    <!-- Første show dato -->
                    <div>
                        <label><strong>Første show dato:</strong></label>
                        <input type="date" name="firstShowDate" value="${firstShowDate}" required>
                    </div>
                    
                    <!-- Antal dage filmen skal vises -->
                    <div>
                        <label><strong>Antal dage filmen skal vises:</strong></label>
                        <input type="number" name="showDays" placeholder="Antal dage" value="${isEdit ? movie.showDays : ''}" min="1" max="90" required>
                    </div>
                    
                    <button type="submit">${isEdit ? 'Opdater Film' : 'Opret Film'}</button>
                </form>
                <div id="movie-form-message" style="margin-top: 1rem;"></div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    document.getElementById("modal-close").addEventListener("click", closeModal);
    document.getElementById("modal-overlay").addEventListener("click", closeModal);

    document.getElementById("movie-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        await saveMovie(e.target, isEdit ? movie.id : null);
    });
}

async function saveMovie(form, movieId = null) {
    const formData = new FormData(form);
    const movieData = {
        title: formData.get('title'),
        category: formData.get('category'),
        ageLimit: parseInt(formData.get('ageLimit')),
        duration: parseInt(formData.get('duration')),
        actors: formData.get('actors'),
        theaterId: parseInt(formData.get('theaterId')),
        firstShowDate: formData.get('firstShowDate'),
        showDays: parseInt(formData.get('showDays'))
    };

    try {
        const url = movieId ? `/api/movies/${movieId}` : '/api/movies';
        const method = movieId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(movieData)
        });

        if (response.ok) {
            document.getElementById("movie-form-message").textContent =
                movieId ? 'Film opdateret og shows regenereret!' : 'Film oprettet og shows genereret!';
            document.getElementById("movie-form-message").style.color = "green";

            setTimeout(() => {
                closeModal();
                loadMovies();
            }, 1500);
        } else {
            throw new Error('Fejl ved gemning');
        }
    } catch (error) {
        document.getElementById("movie-form-message").textContent =
            'Fejl: ' + error.message;
        document.getElementById("movie-form-message").style.color = "red";
    }
}

async function saveMovie(form, movieId = null) {
    const formData = new FormData(form);
    const movieData = {
        title: formData.get('title'),
        category: formData.get('category'),
        ageLimit: parseInt(formData.get('ageLimit')),
        duration: parseInt(formData.get('duration')),
        actors: formData.get('actors'),
        theaterId: parseInt(formData.get('theater'))
    };

    try {
        const url = movieId ? `/api/movies/${movieId}` : '/api/movies';
        const method = movieId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(movieData)
        });

        if (response.ok) {
            document.getElementById("movie-form-message").textContent =
                movieId ? 'Film opdateret!' : 'Film oprettet!';
            document.getElementById("movie-form-message").style.color = "green";

            setTimeout(() => {
                closeModal();
                loadMovies();
            }, 1000);
        } else {
            throw new Error('Fejl ved gemning');
        }
    } catch (error) {
        document.getElementById("movie-form-message").textContent =
            'Fejl: ' + error.message;
        document.getElementById("movie-form-message").style.color = "red";
    }
}

function editMovie(movieId) {
    fetch(`/api/movies/${movieId}`)
        .then(response => response.json())
        .then(movie => {
            openMovieModal(movie);
        })
        .catch(error => {
            console.error('Error loading movie:', error);
            alert('Fejl ved indlæsning af film');
        });
}

async function deleteMovie(movieId) {
    if (!confirm('Er du sikker på at du vil slette denne film?')) {
        return;
    }

    try {
        const response = await fetch(`/api/movies/${movieId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadMovies();
        } else {
            throw new Error('Fejl ved sletning');
        }
    } catch (error) {
        alert('Fejl ved sletning af film: ' + error.message);
    }
}

// === MEDARBEJDER ADMINISTRATION ===
async function loadStaff() {
    try {
        const response = await fetch('/api/staff');
        const staff = await response.json();
        displayStaff(staff);
    } catch (error) {
        console.error('Error loading staff:', error);
    }
}

function displayStaff(staffList) {
    const staffContainer = document.getElementById('staff-list');
    staffContainer.innerHTML = '';

    if (staffList.length === 0) {
        staffContainer.innerHTML = '<p>Ingen medarbejdere fundet.</p>';
        return;
    }

    staffList.forEach(staff => {
        const staffCard = document.createElement('div');
        staffCard.className = 'card';
        staffCard.style.marginBottom = '1rem';
        staffCard.innerHTML = `
            <h3>${staff.name}</h3>
            <p><strong>Brugernavn:</strong> ${staff.username}</p>
            <p><strong>Rolle:</strong> ${staff.role}</p>
            <div style="margin-top: 1rem;">
                <button onclick="editStaff(${staff.id})" style="margin-right: 0.5rem;">Rediger</button>
                <button onclick="deleteStaff(${staff.id})" style="background: #dc3545;">Slet</button>
            </div>
        `;
        staffContainer.appendChild(staffCard);
    });
}

function openStaffModal(staff = null) {
    const isEdit = staff !== null;
    const modalHTML = `
        <div class="modal-overlay" id="modal-overlay"></div>
        <div class="modal-box" id="modal-box" style="max-width: 500px;">
            <button class="modal-close" id="modal-close">&times;</button>
            <div id="modal-content">
                <h2 style="text-align: center;">${isEdit ? 'Rediger Medarbejder' : 'Tilføj Ny Medarbejder'}</h2>
                <form id="staff-form">
                    <input type="text" name="name" placeholder="Fulde navn" value="${isEdit ? staff.name : ''}" required>
                    <input type="text" name="username" placeholder="Brugernavn" value="${isEdit ? staff.username : ''}" required>
                    <input type="password" name="password" placeholder="Adgangskode" ${isEdit ? '' : 'required'}>
                    <input type="text" name="role" placeholder="Rolle" value="${isEdit ? staff.role : ''}" required>
                    <button type="submit">${isEdit ? 'Opdater Medarbejder' : 'Opret Medarbejder'}</button>
                </form>
                <div id="staff-form-message" style="margin-top: 1rem;"></div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    document.getElementById("modal-close").addEventListener("click", closeModal);
    document.getElementById("modal-overlay").addEventListener("click", closeModal);

    document.getElementById("staff-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        await saveStaff(e.target, isEdit ? staff.id : null);
    });
}

async function saveStaff(form, staffId = null) {
    const formData = new FormData(form);
    const staffData = {
        name: formData.get('name'),
        username: formData.get('username'),
        role: formData.get('role')
    };

    // Tilføj password kun hvis det er udfyldt (ved oprettelse eller ændring)
    const password = formData.get('password');
    if (password) {
        staffData.password = password;
    }

    try {
        const url = staffId ? `/api/staff/${staffId}` : '/api/staff';
        const method = staffId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(staffData)
        });

        if (response.ok) {
            document.getElementById("staff-form-message").textContent =
                staffId ? 'Medarbejder opdateret!' : 'Medarbejder oprettet!';
            document.getElementById("staff-form-message").style.color = "green";

            setTimeout(() => {
                closeModal();
                loadStaff();
            }, 1000);
        } else {
            throw new Error('Fejl ved gemning');
        }
    } catch (error) {
        document.getElementById("staff-form-message").textContent =
            'Fejl: ' + error.message;
        document.getElementById("staff-form-message").style.color = "red";
    }
}

function editStaff(staffId) {
    fetch(`/api/staff/${staffId}`)
        .then(response => response.json())
        .then(staff => {
            openStaffModal(staff);
        })
        .catch(error => {
            console.error('Error loading staff:', error);
            alert('Fejl ved indlæsning af medarbejder');
        });
}

async function deleteStaff(staffId) {
    if (!confirm('Er du sikker på at du vil slette denne medarbejder?')) {
        return;
    }

    try {
        const response = await fetch(`/api/staff/${staffId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadStaff();
        } else {
            throw new Error('Fejl ved sletning');
        }
    } catch (error) {
        alert('Fejl ved sletning af medarbejder: ' + error.message);
    }
}

// === GENEREL MODAL FUNKTIONALITET ===
function closeModal() {
    const overlay = document.getElementById("modal-overlay");
    const modal = document.getElementById("modal-box");
    if (overlay) overlay.remove();
    if (modal) modal.remove();
}