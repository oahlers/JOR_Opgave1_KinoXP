document.addEventListener("DOMContentLoaded", () => {
    loadCalendar();
    setupLoginButtons();
});

function setupLoginButtons() {
    const customerBtn = document.getElementById("customer-login-btn");
    const staffBtn = document.getElementById("staff-login-btn");

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
    checkLoginStatus();
}

let currentDate = new Date();
let shows = [];

async function loadCalendar() {
    try {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 3);

        const response = await fetch(`/api/shows/between?start=${startDate.toISOString()}&end=${endDate.toISOString()}`);
        if (!response.ok) {
            throw new Error('Kunne ikke hente forestillinger');
        }
        shows = await response.json();

        displayCalendar();
    } catch (error) {
        console.error('Error loading shows:', error);
        document.querySelector('.card').innerHTML = `
            <h2>Kommende Forestillinger</h2>
            <p>Fejl ved indlæsning af kalender. Prøv igen senere.</p>
            <button onclick="loadCalendar()">Prøv igen</button>
        `;
    }
}

function displayCalendar() {
    const calendarSection = document.querySelector('.card');

    calendarSection.innerHTML = `
        <div class="calendar-controls">
            <h2>Kalender - ${getMonthYearString(currentDate)}</h2>
            <div class="calendar-navigation">
                <button id="prev-month">← Forrige</button>
                <button id="today-btn">I dag</button>
                <button id="next-month">Næste →</button>
            </div>
        </div>
        <div id="calendar-container"></div>
    `;

    generateCalendar();
    setupCalendarEvents();
}

function generateCalendar() {
    const container = document.getElementById('calendar-container');
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startingDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const danishStartingDay = startingDay === 0 ? 6 : startingDay - 1;

    let calendarHTML = `
        <div class="calendar-grid">
            <div class="calendar-header">Man</div>
            <div class="calendar-header">Tir</div>
            <div class="calendar-header">Ons</div>
            <div class="calendar-header">Tor</div>
            <div class="calendar-header">Fre</div>
            <div class="calendar-header">Lør</div>
            <div class="calendar-header">Søn</div>
    `;

    for (let i = 0; i < danishStartingDay; i++) {
        calendarHTML += `<div class="calendar-day empty"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dayShows = getShowsForDate(date);
        const isToday = isSameDay(date, new Date());

        calendarHTML += `
            <div class="calendar-day ${isToday ? 'today' : ''}">
                <div class="day-number">${day}</div>
                <div class="shows-list">
                    ${generateShowsHTML(dayShows)}
                </div>
            </div>
        `;
    }

    calendarHTML += `</div>`;
    container.innerHTML = calendarHTML;
}

function generateShowsHTML(dayShows) {
    if (dayShows.length === 0) {
        return '<div class="no-shows">Ingen forestillinger</div>';
    }

    const showsByMovieAndTheater = {};
    dayShows.forEach(show => {
        const movieTitle = show.movie ? show.movie.title : 'Ukendt film';
        const theaterName = show.theater ? show.theater.name : 'Ukendt teater';
        const key = `${movieTitle}-${theaterName}`;

        if (!showsByMovieAndTheater[key]) {
            showsByMovieAndTheater[key] = {
                movieTitle: movieTitle,
                theaterName: theaterName,
                shows: []
            };
        }
        showsByMovieAndTheater[key].shows.push(show);
    });

    let html = '';
    Object.values(showsByMovieAndTheater).forEach(({ movieTitle, theaterName, shows }) => {
        html += `<div class="movie-day">`;
        html += `<div class="movie-title" title="${movieTitle}">${movieTitle}</div>`;
        html += `<div class="theater-name">${theaterName}</div>`;

        const showsByTime = {};
        shows.forEach(show => {
            const time = new Date(show.showTime).toLocaleTimeString('da-DK', {
                hour: '2-digit',
                minute: '2-digit'
            });
            if (!showsByTime[time]) {
                showsByTime[time] = [];
            }
            showsByTime[time].push(show);
        });

        Object.keys(showsByTime).forEach(time => {
            const showsAtTime = showsByTime[time];
            const show = showsAtTime[0];

            html += `
                <div class="show-time" onclick="openShowDetails(${show.id})" 
                     title="${movieTitle} - ${time} - ${theaterName}">
                    ${time}
                </div>
            `;
        });

        html += `</div>`;
    });

    return html;
}

function getShowsForDate(date) {
    return shows.filter(show => {
        const showDate = new Date(show.showTime);
        return isSameDay(showDate, date);
    });
}

function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();
}

function getMonthYearString(date) {
    const months = [
        'Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni',
        'Juli', 'August', 'September', 'Oktober', 'November', 'December'
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

function setupCalendarEvents() {
    document.getElementById('prev-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        displayCalendar();
    });

    document.getElementById('next-month').addEventListener('click', () => {
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 3);

        if (currentDate.getMonth() < maxDate.getMonth() ||
            currentDate.getFullYear() < maxDate.getFullYear()) {
            currentDate.setMonth(currentDate.getMonth() + 1);
            displayCalendar();
        } else {
            alert('Kalenderen viser kun 3 måneder frem');
        }
    });

    document.getElementById('today-btn').addEventListener('click', () => {
        currentDate = new Date();
        displayCalendar();
    });
}

function openShowDetails(showId) {
    const show = shows.find(s => s.id === showId);
    if (!show) return;

    const modalHTML = `
        <div class="modal-overlay" id="modal-overlay"></div>
        <div class="modal-box" id="modal-box" style="max-width: 500px;">
            <button class="modal-close" id="modal-close">&times;</button>
            <div id="modal-content">
                <h2 style="text-align: center;">Forestillingsdetaljer</h2>
                <div class="show-details">
                    <h3>${show.movie ? show.movie.title : 'Ukendt film'}</h3>
                    <p><strong>Tid:</strong> ${new Date(show.showTime).toLocaleString('da-DK')}</p>
                    <p><strong>Teater:</strong> ${show.theater ? show.theater.name : 'Ukendt teater'}</p>
                    <p><strong>Sædekonfiguration:</strong> ${show.theater ? `${show.theater.numRows} rækker × ${show.theater.seatsPerRow} sæder` : 'Ukendt'}</p>
                    <p><strong>Varighed:</strong> ${show.movie ? show.movie.duration + ' min.' : 'Ukendt'}</p>
                    <p><strong>Aldersgrænse:</strong> ${show.movie ? show.movie.ageLimit + '+' : 'Ukendt'}</p>
                    <p><strong>Skuespillere:</strong> ${show.movie ? show.movie.actors : 'Ukendt'}</p>
                </div>
                <div style="margin-top: 1rem;">
                    <button onclick="bookShow(${show.id})" style="width: 100%; margin-bottom: 0.5rem;">Book billetter til denne forestilling</button>
                    <button onclick="showAlternativeShows(${show.movieId}, '${new Date(show.showTime).toISOString()}', ${show.theaterId})" 
                            style="width: 100%; background: #333;">
                        Se alternative forestillinger
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    document.getElementById("modal-close").addEventListener("click", closeCalendarModal);
    document.getElementById("modal-overlay").addEventListener("click", closeCalendarModal);
}

function showAlternativeShows(movieId, showTime, currentTheaterId) {
    const currentDateTime = new Date(showTime);
    const currentDate = new Date(currentDateTime.getFullYear(), currentDateTime.getMonth(), currentDateTime.getDate());

    const alternativeShows = shows.filter(show => {
        const showDate = new Date(show.showTime);
        const isSameDate = showDate.getFullYear() === currentDate.getFullYear() &&
            showDate.getMonth() === currentDate.getMonth() &&
            showDate.getDate() === currentDate.getDate();

        return show.movieId === movieId && isSameDate && show.theaterId !== currentTheaterId;
    });

    closeCalendarModal();

    if (alternativeShows.length === 0) {
        alert('Ingen alternative forestillinger fundet for denne film i dag.');
        return;
    }

    const modalHTML = `
        <div class="modal-overlay" id="modal-overlay"></div>
        <div class="modal-box" id="modal-box" style="max-width: 500px;">
            <button class="modal-close" id="modal-close">&times;</button>
            <div id="modal-content">
                <h2 style="text-align: center;">Alternative Forestillinger</h2>
                <p>Andre forestillinger for "${alternativeShows[0].movie ? alternativeShows[0].movie.title : 'Ukendt film'}" i dag:</p>
                <div class="alternative-shows">
                    ${alternativeShows.map(show => `
                        <div class="alternative-show" style="background: #2a2a2a; padding: 1rem; margin-bottom: 0.5rem; border-radius: 4px;">
                            <p><strong>Tid:</strong> ${new Date(show.showTime).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })}</p>
                            <p><strong>Teater:</strong> ${show.theater ? show.theater.name : 'Ukendt teater'}</p>
                            <button onclick="bookShow(${show.id})" style="width: 100%; margin-top: 0.5rem;">
                                Book til ${new Date(show.showTime).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })} - ${show.theater ? show.theater.name : 'Ukendt teater'}
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    document.getElementById("modal-close").addEventListener("click", closeCalendarModal);
    document.getElementById("modal-overlay").addEventListener("click", closeCalendarModal);
}

function bookShow(showId) {
    if (!localStorage.getItem('loggedInUser')) {
        alert('Du skal være logget ind for at booke billetter');
        closeCalendarModal();
        openModal("customer");
        return;
    }

    alert(`Booking funktionalitet for show ${showId} vil blive implementeret her`);
    closeCalendarModal();
}

function closeCalendarModal() {
    const overlay = document.getElementById("modal-overlay");
    const modal = document.getElementById("modal-box");
    if (overlay) overlay.remove();
    if (modal) modal.remove();
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