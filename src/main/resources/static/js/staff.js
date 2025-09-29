const apiBase = "http://localhost:8080/api";

// -------- Hjælpefunktioner --------
async function fetchData(endpoint) {
    const res = await fetch(`${apiBase}/${endpoint}`);
    return res.json();
}

async function sendData(endpoint, method, data) {
    return fetch(`${apiBase}/${endpoint}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
}

function openModal(content) {
    const modal = document.getElementById("modal");
    modal.innerHTML = content;
    modal.classList.remove("hidden");
}

function closeModal() {
    const modal = document.getElementById("modal");
    modal.classList.add("hidden");
    modal.innerHTML = "";
}

// -------- Film --------
async function loadMovies() {
    const movies = await fetchData("movies");
    const movieList = document.getElementById("movie-list");
    movieList.innerHTML = movies.map(m => `
        <div class="card">
            <h3>${m.title}</h3>
            <p>Instruktør: ${m.director}</p>
            <p>Varighed: ${m.duration} min</p>
            <button onclick="openMovieForm(${m.id}, '${m.title}', '${m.director}', ${m.duration})">✏️ Rediger</button>
            <button onclick="deleteMovie(${m.id})">🗑️ Slet</button>
        </div>
    `).join("");
}

function openMovieForm(id = null, title = "", director = "", duration = "") {
    openModal(`
        <div class="modal-content">
            <h2>${id ? "Rediger film" : "Tilføj film"}</h2>
            <form id="movie-form">
                <label>Titel: <input type="text" id="movie-title" value="${title}" required></label>
                <label>Instruktør: <input type="text" id="movie-director" value="${director}" required></label>
                <label>Varighed: <input type="number" id="movie-duration" value="${duration}" required></label>
                <button type="submit">Gem</button>
                <button type="button" onclick="closeModal()">Annuller</button>
            </form>
        </div>
    `);

    document.getElementById("movie-form").onsubmit = async (e) => {
        e.preventDefault();
        const newMovie = {
            title: document.getElementById("movie-title").value,
            director: document.getElementById("movie-director").value,
            duration: document.getElementById("movie-duration").value
        };
        if (id) {
            await sendData(`movies/${id}`, "PUT", newMovie);
        } else {
            await sendData("movies", "POST", newMovie);
        }
        closeModal();
        loadMovies();
    };
}

async function deleteMovie(id) {
    if (confirm("Slet filmen?")) {
        await fetch(`${apiBase}/movies/${id}`, { method: "DELETE" });
        loadMovies();
    }
}

// -------- Medarbejdere --------
async function loadStaff() {
    const staff = await fetchData("staff");
    const staffList = document.getElementById("staff-list");
    staffList.innerHTML = staff.map(s => `
        <div class="card">
            <h3>${s.name}</h3>
            <p>Rolle: ${s.role}</p>
            <p>Timer: ${s.hoursWorked || 0}</p>
            <button onclick="openStaffForm(${s.id}, '${s.name}', '${s.role}')">✏️ Rediger</button>
            <button onclick="deleteStaff(${s.id})">🗑️ Slet</button>
        </div>
    `).join("");
}

function openStaffForm(id = null, name = "", role = "") {
    openModal(`
        <div class="modal-content">
            <h2>${id ? "Rediger medarbejder" : "Tilføj medarbejder"}</h2>
            <form id="staff-form">
                <label>Navn: <input type="text" id="staff-name" value="${name}" required></label>
                <label>Rolle: 
                    <select id="staff-role" required>
                        <option value="Manager" ${role === "Manager" ? "selected" : ""}>Manager</option>
                        <option value="Staff" ${role === "Staff" ? "selected" : ""}>Staff</option>
                    </select>
                </label>
                <button type="submit">Gem</button>
                <button type="button" onclick="closeModal()">Annuller</button>
            </form>
        </div>
    `);

    document.getElementById("staff-form").onsubmit = async (e) => {
        e.preventDefault();
        const newStaff = {
            name: document.getElementById("staff-name").value,
            role: document.getElementById("staff-role").value
        };
        if (id) {
            await sendData(`staff/${id}`, "PUT", newStaff);
        } else {
            await sendData("staff", "POST", newStaff);
        }
        closeModal();
        loadStaff();
    };
}

async function deleteStaff(id) {
    if (confirm("Slet medarbejder?")) {
        await fetch(`${apiBase}/staff/${id}`, { method: "DELETE" });
        loadStaff();
    }
}

// -------- Vagtplan --------
async function loadSchedule() {
    const shifts = await fetchData("shifts");
    generateScheduleCalendar(shifts);
}

function generateScheduleCalendar(shifts) {
    const calendar = document.getElementById("schedule-calendar");
    calendar.innerHTML = "";
    shifts.forEach(shift => {
        const div = document.createElement("div");
        div.classList.add("shift");
        div.innerHTML = `
            <h3>${shift.staff ? shift.staff.name : "Ukendt"}</h3>
            <p>${shift.date} ${shift.startTime} - ${shift.endTime}</p>
            <p>${shift.shiftType}</p>
            <button onclick="openShiftForm(${shift.id})">✏️ Rediger</button>
            <button onclick="deleteShift(${shift.id})">🗑️ Slet</button>
        `;
        calendar.appendChild(div);
    });

    const addBtn = document.createElement("button");
    addBtn.textContent = "➕ Tilføj vagt";
    addBtn.onclick = () => openShiftForm();
    calendar.appendChild(addBtn);
}

const defaultTimes = {
    Morning: { start: "08:00", end: "16:00" },
    Evening: { start: "16:00", end: "00:00" },
    Night: { start: "00:00", end: "08:00" }
};

async function openShiftForm(shiftId = null) {
    const allStaff = await fetchData("staff");
    let shift = null;
    if (shiftId) {
        shift = await fetchData(`shifts/${shiftId}`);
    }

    const staffOptions = allStaff.map(staff => `
        <option value="${staff.id}" ${(shift && shift.staff && shift.staff.id === staff.id) ? "selected" : ""}>${staff.name}</option>
    `).join("");

    const isEdit = !!shift;
    const shiftType = isEdit ? shift.shiftType : "Morning";
    const startVal = isEdit ? shift.startTime : defaultTimes[shiftType].start;
    const endVal = isEdit ? shift.endTime : defaultTimes[shiftType].end;

    openModal(`
        <div class="modal-content">
            <h2>${isEdit ? "Rediger vagt" : "Tilføj vagt"}</h2>
            <form id="shift-form">
                <label>Medarbejder:
                    <select id="shift-staff" required>
                        <option value="">Vælg medarbejder</option>
                        ${staffOptions}
                    </select>
                </label>
                <label>Dato: <input type="date" id="shift-date" value="${isEdit ? shift.date : ""}" required></label>
                <label>Starttid: <input type="time" id="shift-start" value="${startVal}" required></label>
                <label>Sluttid: <input type="time" id="shift-end" value="${endVal}" required></label>
                <label>Vagttype:
                    <select id="shift-type" required>
                        <option value="Morning" ${shiftType === "Morning" ? "selected" : ""}>Morgen</option>
                        <option value="Evening" ${shiftType === "Evening" ? "selected" : ""}>Aften</option>
                        <option value="Night" ${shiftType === "Night" ? "selected" : ""}>Nat</option>
                    </select>
                </label>
                <div id="error-msg" class="error hidden"></div>
                <button type="submit">Gem</button>
                <button type="button" onclick="closeModal()">Annuller</button>
            </form>
        </div>
    `);

    document.getElementById("shift-form").onsubmit = async (e) => {
        e.preventDefault();

        const staffId = document.getElementById("shift-staff").value;
        const date = document.getElementById("shift-date").value;
        const startTime = document.getElementById("shift-start").value;
        const endTime = document.getElementById("shift-end").value;
        const shiftType = document.getElementById("shift-type").value;

        let start = new Date(`2000-01-01T${startTime}`);
        let end = new Date(`2000-01-01T${endTime}`);
        let hours = (end - start) / (1000 * 60 * 60);

        if (hours < 0) {
            hours += 24; // nattevagt
        }

        if (hours <= 0) {
            document.getElementById("error-msg").textContent = "Sluttid skal være efter starttid.";
            document.getElementById("error-msg").classList.remove("hidden");
            return;
        }

        const newShift = { staffId, date, startTime, endTime, shiftType, hours };

        if (isEdit) {
            await sendData(`shifts/${shiftId}`, "PUT", newShift);
        } else {
            await sendData("shifts", "POST", newShift);
        }

        closeModal();
        loadSchedule();
    };
}

async function deleteShift(id) {
    if (confirm("Slet vagt?")) {
        await fetch(`${apiBase}/shifts/${id}`, { method: "DELETE" });
        loadSchedule();
    }
}

// -------- Init --------
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("movie-list")) {
        loadMovies();
        document.getElementById("add-movie-btn").onclick = () => openMovieForm();
    }
    if (document.getElementById("staff-list")) {
        loadStaff();
        document.getElementById("add-staff-btn").onclick = () => openStaffForm();
    }
    if (document.getElementById("schedule-calendar")) {
        loadSchedule();
    }
});
