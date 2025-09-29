document.addEventListener("DOMContentLoaded", () => {
    setupLoginButtons();
    setupStaffButtons();
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

function setupStaffButtons() {
    document.getElementById('manage-movies-btn').addEventListener('click', () => {
        toggleSection('movies-section');
        loadMovies();
    });

    document.getElementById('manage-staff-btn').addEventListener('click', () => {
        toggleSection('staff-section');
        loadStaff();
    });

    document.getElementById('manage-schedule-btn').addEventListener('click', () => {
        toggleSection('schedule-section');
        loadSchedule();
    });

    document.getElementById('add-movie-btn').addEventListener('click', () => {
        openMovieForm();
    });

    document.getElementById('add-staff-btn').addEventListener('click', () => {
        openStaffForm();
    });

    document.getElementById('add-shift-btn').addEventListener('click', () => {
        openShiftForm();
    });
}

function toggleSection(sectionId) {
    const moviesSection = document.getElementById('movies-section');
    const staffSection = document.getElementById('staff-section');
    const scheduleSection = document.getElementById('schedule-section');

    moviesSection.style.display = 'none';
    staffSection.style.display = 'none';
    scheduleSection.style.display = 'none';

    document.getElementById(sectionId).style.display = 'block';
}

// Film administration
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
                <button onclick="editMovie(${movie.id})">Rediger</button>
                <button onclick="deleteMovie(${movie.id})" style="background: #dc3545; margin-left: 0.5rem;">Slet</button>
            </div>
        `;
        moviesList.appendChild(movieItem);
    });
}

async function openMovieForm(movie = null) {
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

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    document.getElementById("modal-close").addEventListener("click", closeModal);
    document.getElementById("modal-overlay").addEventListener("click", closeModal);

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
                    closeModal();
                    loadMovies();
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

async function editMovie(movieId) {
    try {
        const response = await fetch(`/api/movies/${movieId}`);
        const movie = await response.json();
        openMovieForm(movie);
    } catch (error) {
        console.error('Error loading movie:', error);
    }
}

async function deleteMovie(movieId) {
    if (confirm('Er du sikker på at du vil slette denne film?')) {
        try {
            const response = await fetch(`/api/movies/${movieId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                loadMovies();
            } else {
                alert('Fejl ved sletning af film');
            }
        } catch (error) {
            console.error('Error deleting movie:', error);
            alert('Fejl ved sletning af film');
        }
    }
}

// Medarbejder administration
async function loadStaff() {
    try {
        const response = await fetch('/api/staff');
        const staff = await response.json();
        displayStaff(staff);
    } catch (error) {
        console.error('Error loading staff:', error);
    }
}

function displayStaff(staff) {
    const staffList = document.getElementById('staff-list');
    staffList.innerHTML = '';

    staff.forEach(staffMember => {
        const staffItem = document.createElement('div');
        staffItem.className = 'card';
        staffItem.style.marginBottom = '1rem';
        staffItem.innerHTML = `
            <h3>${staffMember.fullName}</h3>
            <p><strong>Brugernavn:</strong> ${staffMember.username}</p>
            <p><strong>Stilling:</strong> ${staffMember.position || 'Medarbejder'}</p>
            <p><strong>Samlede timer:</strong> ${staffMember.totalHours || 0} timer</p>
            <div style="margin-top: 1rem;">
                <button onclick="editStaff(${staffMember.id})">Rediger</button>
                <button onclick="deleteStaff(${staffMember.id})" style="background: #dc3545; margin-left: 0.5rem;">Slet</button>
            </div>
        `;
        staffList.appendChild(staffItem);
    });
}

async function openStaffForm(staff = null) {
    const isEdit = staff !== null;

    const modalHTML = `
        <div class="modal-overlay" id="modal-overlay"></div>
        <div class="modal-box" id="modal-box" style="max-width: 500px;">
            <button class="modal-close" id="modal-close">&times;</button>
            <div id="modal-content">
                <h2>${isEdit ? 'Rediger Medarbejder' : 'Tilføj Ny Medarbejder'}</h2>
                <form id="staff-form">
                    <input type="text" id="staff-fullname" placeholder="Fulde navn" value="${isEdit ? staff.fullName : ''}" required>
                    <input type="text" id="staff-username" placeholder="Brugernavn" value="${isEdit ? staff.username : ''}" required>
                    <input type="password" id="staff-password" placeholder="Adgangskode" ${isEdit ? '' : 'required'}>
                    <input type="text" id="staff-position" placeholder="Stilling" value="${isEdit ? staff.position : ''}" required>
                    <button type="submit">${isEdit ? 'Opdater Medarbejder' : 'Tilføj Medarbejder'}</button>
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

        const staffData = {
            fullName: document.getElementById("staff-fullname").value,
            username: document.getElementById("staff-username").value,
            position: document.getElementById("staff-position").value
        };

        // Tilføj kun password hvis det er udfyldt (ved opdatering)
        const password = document.getElementById("staff-password").value;
        if (password) {
            staffData.password = password;
        }

        try {
            const url = isEdit ? `/api/staff/${staff.id}` : '/api/staff';
            const method = isEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(staffData)
            });

            if (response.ok) {
                document.getElementById("staff-form-message").textContent =
                    isEdit ? 'Medarbejder opdateret!' : 'Medarbejder tilføjet!';
                document.getElementById("staff-form-message").style.color = "green";

                setTimeout(() => {
                    closeModal();
                    loadStaff();
                }, 1500);
            } else {
                throw new Error('Fejl ved gemning');
            }
        } catch (error) {
            document.getElementById("staff-form-message").textContent = 'Fejl ved gemning af medarbejder';
            document.getElementById("staff-form-message").style.color = "red";
        }
    });
}

async function editStaff(staffId) {
    try {
        const response = await fetch(`/api/staff/${staffId}`);
        const staff = await response.json();
        openStaffForm(staff);
    } catch (error) {
        console.error('Error loading staff:', error);
    }
}

async function deleteStaff(staffId) {
    if (confirm('Er du sikker på at du vil slette denne medarbejder?')) {
        try {
            const response = await fetch(`/api/staff/${staffId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                loadStaff();
            } else {
                alert('Fejl ved sletning af medarbejder');
            }
        } catch (error) {
            console.error('Error deleting staff:', error);
            alert('Fejl ved sletning af medarbejder');
        }
    }
}

// Vagtplan funktionalitet
let scheduleCurrentDate = new Date();
let shifts = [];
let allStaff = [];

async function loadSchedule() {
    try {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 3);

        // Hent både vagter og medarbejdere
        const [shiftsResponse, staffResponse] = await Promise.all([
            fetch(`/api/shifts/between?start=${startDate.toISOString().split('T')[0]}&end=${endDate.toISOString().split('T')[0]}`),
            fetch('/api/staff')
        ]);

        if (!shiftsResponse.ok || !staffResponse.ok) {
            throw new Error('Kunne ikke hente data');
        }

        shifts = await shiftsResponse.json();
        allStaff = await staffResponse.json();

        displaySchedule();
    } catch (error) {
        console.error('Error loading schedule:', error);
        document.getElementById('schedule-calendar').innerHTML = `
            <p>Fejl ved indlæsning af vagtplan. Prøv igen senere.</p>
            <button onclick="loadSchedule()">Prøv igen</button>
        `;
    }
}

function displaySchedule() {
    const scheduleSection = document.getElementById('schedule-calendar');

    scheduleSection.innerHTML = `
        <div class="calendar-controls">
            <h3>Vagtplan - ${getMonthYearString(scheduleCurrentDate)}</h3>
            <div class="calendar-navigation">
                <button id="schedule-prev-month">← Forrige</button>
                <button id="schedule-today-btn">I dag</button>
                <button id="schedule-next-month">Næste →</button>
            </div>
        </div>
        <div id="schedule-calendar-container"></div>
    `;

    generateScheduleCalendar();
    setupScheduleEvents();
}

function generateScheduleCalendar() {
    const container = document.getElementById('schedule-calendar-container');
    const firstDay = new Date(scheduleCurrentDate.getFullYear(), scheduleCurrentDate.getMonth(), 1);
    const lastDay = new Date(scheduleCurrentDate.getFullYear(), scheduleCurrentDate.getMonth() + 1, 0);
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
        const date = new Date(scheduleCurrentDate.getFullYear(), scheduleCurrentDate.getMonth(), day);
        const dayShifts = getShiftsForDate(date);
        const isToday = isSameDay(date, new Date());

        calendarHTML += `
            <div class="calendar-day ${isToday ? 'today' : ''}">
                <div class="day-number">${day}</div>
                <div class="shows-list">
                    ${generateShiftsHTML(dayShifts)}
                </div>
            </div>
        `;
    }

    calendarHTML += `</div>`;
    container.innerHTML = calendarHTML;
}

function generateShiftsHTML(dayShifts) {
    if (dayShifts.length === 0) {
        return '<div class="no-shows">Ingen vagter</div>';
    }

    let html = '';
    dayShifts.forEach(shift => {
        const staffName = shift.staff ? shift.staff.fullName : 'Ukendt medarbejder';
        const shiftTime = shift.startTime && shift.endTime ?
            `${shift.startTime.substring(0, 5)}-${shift.endTime.substring(0, 5)}` :
            shift.shiftType || 'Vagt';

        html += `
            <div class="show-time" onclick="openShiftDetails(${shift.id})" 
                 title="${staffName} - ${shiftTime}">
                ${staffName} - ${shiftTime}
            </div>
        `;
    });

    return html;
}

function getShiftsForDate(date) {
    const dateString = date.toISOString().split('T')[0];
    return shifts.filter(shift => shift.shiftDate === dateString);
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

function setupScheduleEvents() {
    document.getElementById('schedule-prev-month').addEventListener('click', () => {
        scheduleCurrentDate.setMonth(scheduleCurrentDate.getMonth() - 1);
        displaySchedule();
    });

    document.getElementById('schedule-next-month').addEventListener('click', () => {
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 3);

        if (scheduleCurrentDate.getMonth() < maxDate.getMonth() ||
            scheduleCurrentDate.getFullYear() < maxDate.getFullYear()) {
            scheduleCurrentDate.setMonth(scheduleCurrentDate.getMonth() + 1);
            displaySchedule();
        } else {
            alert('Vagtplanen viser kun 3 måneder frem');
        }
    });

    document.getElementById('schedule-today-btn').addEventListener('click', () => {
        scheduleCurrentDate = new Date();
        displaySchedule();
    });
}

async function openShiftForm(shift = null, date = null) {
    const isEdit = shift !== null;

    const staffOptions = allStaff.map(staff =>
        `<option value="${staff.id}" ${isEdit && shift.staff && shift.staff.id === staff.id ? 'selected' : ''}>
            ${staff.fullName} (${staff.position})
        </option>`
    ).join('');

    const modalHTML = `
        <div class="modal-overlay" id="modal-overlay"></div>
        <div class="modal-box" id="modal-box" style="max-width: 500px;">
            <button class="modal-close" id="modal-close">&times;</button>
            <div id="modal-content">
                <h2>${isEdit ? 'Rediger Vagt' : 'Tilføj Ny Vagt'}</h2>
                <form id="shift-form">
                    <select id="shift-staff" required>
                        <option value="">Vælg medarbejder</option>
                        ${staffOptions}
                    </select>
                    <input type="date" id="shift-date" value="${isEdit ? shift.shiftDate : (date || new Date().toISOString().split('T')[0])}" required>
                    <input type="time" id="shift-start" value="${isEdit ? shift.startTime : '09:00'}" required>
                    <input type="time" id="shift-end" value="${isEdit ? shift.endTime : '17:00'}" required>
                    <select id="shift-type">
                        <option value="Morning" ${isEdit && shift.shiftType === 'Morning' ? 'selected' : ''}>Morgen</option>
                        <option value="Evening" ${isEdit && shift.shiftType === 'Evening' ? 'selected' : ''}>Aften</option>
                        <option value="Night" ${isEdit && shift.shiftType === 'Night' ? 'selected' : ''}>Nat</option>
                    </select>
                    <button type="submit">${isEdit ? 'Opdater Vagt' : 'Tilføj Vagt'}</button>
                </form>
                <div id="shift-form-message" style="margin-top: 1rem;"></div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    document.getElementById("modal-close").addEventListener("click", closeModal);
    document.getElementById("modal-overlay").addEventListener("click", closeModal);

    document.getElementById("shift-form").addEventListener("submit", async (e) => {
        e.preventDefault();

        const startTime = document.getElementById("shift-start").value;
        const endTime = document.getElementById("shift-end").value;

        // Beregn timer
        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);
        const hours = (end - start) / (1000 * 60 * 60);

        const shiftData = {
            staff: { id: parseInt(document.getElementById("shift-staff").value) },
            shiftDate: document.getElementById("shift-date").value,
            startTime: startTime,
            endTime: endTime,
            shiftType: document.getElementById("shift-type").value,
            hours: hours
        };

        try {
            const url = isEdit ? `/api/shifts/${shift.id}` : '/api/shifts';
            const method = isEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(shiftData)
            });

            if (response.ok) {
                document.getElementById("shift-form-message").textContent =
                    isEdit ? 'Vagt opdateret!' : 'Vagt tilføjet!';
                document.getElementById("shift-form-message").style.color = "green";

                setTimeout(() => {
                    closeModal();
                    loadSchedule();
                }, 1500);
            } else {
                throw new Error('Fejl ved gemning');
            }
        } catch (error) {
            document.getElementById("shift-form-message").textContent = 'Fejl ved gemning af vagt';
            document.getElementById("shift-form-message").style.color = "red";
        }
    });
}

async function openShiftDetails(shiftId) {
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift) return;

    const modalHTML = `
        <div class="modal-overlay" id="modal-overlay"></div>
        <div class="modal-box" id="modal-box" style="max-width: 500px;">
            <button class="modal-close" id="modal-close">&times;</button>
            <div id="modal-content">
                <h2>Vagtdetaljer</h2>
                <div class="show-details">
                    <p><strong>Medarbejder:</strong> ${shift.staff ? shift.staff.fullName : 'Ukendt'}</p>
                    <p><strong>Dato:</strong> ${shift.shiftDate}</p>
                    <p><strong>Tid:</strong> ${shift.startTime} - ${shift.endTime}</p>
                    <p><strong>Vagttype:</strong> ${shift.shiftType}</p>
                    <p><strong>Timer:</strong> ${shift.hours} timer</p>
                </div>
                <div style="margin-top: 1rem;">
                    <button onclick="editShift(${shift.id})" style="width: 100%; margin-bottom: 0.5rem;">Rediger vagt</button>
                    <button onclick="deleteShift(${shift.id})" style="width: 100%; background: #dc3545;">Slet vagt</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    document.getElementById("modal-close").addEventListener("click", closeModal);
    document.getElementById("modal-overlay").addEventListener("click", closeModal);
}

async function editShift(shiftId) {
    const shift = shifts.find(s => s.id === shiftId);
    if (shift) {
        closeModal();
        openShiftForm(shift);
    }
}

async function deleteShift(shiftId) {
    if (confirm('Er du sikker på at du vil slette denne vagt?')) {
        try {
            const response = await fetch(`/api/shifts/${shiftId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                closeModal();
                loadSchedule();
            } else {
                alert('Fejl ved sletning af vagt');
            }
        } catch (error) {
            console.error('Error deleting shift:', error);
            alert('Fejl ved sletning af vagt');
        }
    }
}

// Tilføj event listener til kalenderdage for at tilføje vagter
function generateScheduleCalendar() {
    const container = document.getElementById('schedule-calendar-container');
    const firstDay = new Date(scheduleCurrentDate.getFullYear(), scheduleCurrentDate.getMonth(), 1);
    const lastDay = new Date(scheduleCurrentDate.getFullYear(), scheduleCurrentDate.getMonth() + 1, 0);
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
        const date = new Date(scheduleCurrentDate.getFullYear(), scheduleCurrentDate.getMonth(), day);
        const dayShifts = getShiftsForDate(date);
        const isToday = isSameDay(date, new Date());
        const dateString = date.toISOString().split('T')[0];

        calendarHTML += `
            <div class="calendar-day ${isToday ? 'today' : ''}">
                <div class="day-number">${day}</div>
                <button onclick="openShiftForm(null, '${dateString}')" style="background: #28a745; margin-bottom: 0.5rem; font-size: 0.7rem;">Tilføj vagt</button>
                <div class="shows-list">
                    ${generateShiftsHTML(dayShifts)}
                </div>
            </div>
        `;
    }

    calendarHTML += `</div>`;
    container.innerHTML = calendarHTML;
}

// Resten af login/logout funktionalitet (samme som før)
function closeModal() {
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