document.addEventListener("DOMContentLoaded", () => {
    const customerBtn = document.getElementById("customer-login-btn");
    const staffBtn = document.getElementById("staff-login-btn");

    checkLoginStatus();
    loadMovies();

    if (customerBtn) {
        customerBtn.addEventListener("click", () => {
            openModal("customer");
        });
    }

    if (staffBtn) {
        staffBtn.addEventListener("click", () => {
            openStaffModal();
        });
    }
});

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

function checkLoginStatus() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    const loginButtons = document.getElementById('login-buttons');

    if (loggedInUser) {
        const user = JSON.parse(loggedInUser);
        const nav = document.querySelector('nav');
        if (nav) {
            const existingWelcome = document.getElementById('user-welcome');
            if (existingWelcome) {
                existingWelcome.remove();
            }

            const welcomeElement = document.createElement('div');
            welcomeElement.id = 'user-welcome';
            welcomeElement.innerHTML = `
                <span>Velkommen ${user.fullName}</span>
                <button id="logout-btn">Log ud</button>
            `;

            nav.appendChild(welcomeElement);
            document.getElementById('logout-btn').addEventListener('click', logout);
        }

        if (loginButtons) {
            loginButtons.style.display = 'none';
        }
    } else {
        if (loginButtons) {
            loginButtons.style.display = 'block';
        }

        const existingWelcome = document.getElementById('user-welcome');
        if (existingWelcome) {
            existingWelcome.remove();
        }
    }
}

function logout() {
    localStorage.removeItem('loggedInUser');
    location.reload();
}

function openStaffModal() {
    const modalHTML = `
        <div class="modal-overlay" id="modal-overlay"></div>
        <div class="modal-box" id="modal-box">
            <button class="modal-close" id="modal-close">&times;</button>
            <div id="modal-content">
                <h2 style="text-align: center;">Medarbejder Login</h2>
                <form id="staff-login-form">
                    <input type="text" name="username" placeholder="Brugernavn" required>
                    <input type="password" name="password" placeholder="Adgangskode" required>
                    <button type="submit">Login som medarbejder</button>
                </form>
                <div id="staff-login-error" style="color: red; margin-top: 1rem;"></div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    document.getElementById("modal-close").addEventListener("click", closeModal);
    document.getElementById("modal-overlay").addEventListener("click", closeModal);

    document.getElementById("staff-login-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const form = e.target;
        const data = {
            username: form.username.value,
            password: form.password.value
        };

        try {
            const res = await fetch("/api/staff/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                const staff = await res.json();
                document.getElementById("staff-login-error").textContent = "";
                closeModal();
                window.location.href = "/staff";
            } else {
                document.getElementById("staff-login-error").textContent = "Forkert brugernavn eller adgangskode.";
            }
        } catch (error) {
            console.error('Login error:', error);
            document.getElementById("staff-login-error").textContent = "Fejl ved login. Prøv igen senere.";
        }
    });
}

function openModal(type) {
    const modalHTML = `
        <div class="modal-overlay" id="modal-overlay"></div>
        <div class="modal-box" id="modal-box">
            <button class="modal-close" id="modal-close">&times;</button>
            <div id="modal-content">
                ${getAuthUI()}
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    document.getElementById("modal-close").addEventListener("click", closeModal);
    document.getElementById("modal-overlay").addEventListener("click", closeModal);

    document.getElementById("login-view-btn").addEventListener("click", () => {
        document.getElementById("form-container").innerHTML = getLoginForm();
        bindLoginForm();
    });

    document.getElementById("register-view-btn").addEventListener("click", () => {
        document.getElementById("form-container").innerHTML = getRegisterForm();
        bindRegisterForm();
    });

    document.getElementById("login-view-btn").click();
}

function closeModal() {
    const overlay = document.getElementById("modal-overlay");
    const modal = document.getElementById("modal-box");
    if (overlay) overlay.remove();
    if (modal) modal.remove();
}

function getAuthUI() {
    return `
        <h2 style="text-align: center;">Kunde Login</h2>
        <div style="text-align: center; margin-bottom: 1rem;">
            <button id="login-view-btn">Login</button>
            <button id="register-view-btn">Opret Bruger</button>
        </div>
        <div id="form-container"></div>
    `;
}

function getLoginForm() {
    return `
        <form id="login-form">
            <input type="text" name="phonenumber" placeholder="Telefonnummer" required>
            <input type="password" name="password" placeholder="Adgangskode" required>
            <button type="submit">Login</button>
        </form>
        <div id="login-error" style="color: red; margin-top: 1rem;"></div>
    `;
}

function getRegisterForm() {
    return `
        <form id="register-form">
            <input type="text" name="fullName" placeholder="Fulde navn" required>
            <input type="text" name="phonenumber" placeholder="Telefonnummer" required>
            <input type="password" name="password" placeholder="Adgangskode" required>
            <button type="submit">Opret Bruger</button>
        </form>
        <div id="register-msg" style="margin-top: 1rem;"></div>
    `;
}

function bindLoginForm() {
    document.getElementById("login-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const form = e.target;
        const data = {
            phonenumber: form.phonenumber.value,
            password: form.password.value
        };

        try {
            const res = await fetch("/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                const user = await res.json();
                document.getElementById("login-error").textContent = "";
                localStorage.setItem('loggedInUser', JSON.stringify(user));
                closeModal();
                checkLoginStatus();
            } else {
                document.getElementById("login-error").textContent = "Forkert telefonnummer eller adgangskode.";
            }
        } catch (error) {
            console.error('Login error:', error);
            document.getElementById("login-error").textContent = "Fejl ved login. Prøv igen senere.";
        }
    });
}

function bindRegisterForm() {
    document.getElementById("register-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const form = e.target;
        const data = {
            fullName: form.fullName.value,
            phonenumber: form.phonenumber.value,
            password: form.password.value
        };

        try {
            const res = await fetch("/api/users/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                document.getElementById("register-msg").textContent = "Bruger oprettet! Du kan nu logge ind.";
                document.getElementById("register-msg").style.color = "green";
                form.reset();
                setTimeout(() => {
                    document.getElementById("login-view-btn").click();
                }, 1500);
            } else {
                document.getElementById("register-msg").textContent = "Oprettelse fejlede. Telefonnummer er måske allerede i brug.";
                document.getElementById("register-msg").style.color = "red";
            }
        } catch (error) {
            console.error('Registration error:', error);
            document.getElementById("register-msg").textContent = "Fejl ved oprettelse. Prøv igen senere.";
            document.getElementById("register-msg").style.color = "red";
        }
    });
}