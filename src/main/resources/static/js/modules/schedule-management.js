import { ModalManager } from './modal.js';
export class ScheduleManager {
    constructor() {
        this.currentDate = new Date();
        this.shifts = [];
        this.allStaff = [];
    }

    async loadSchedule() {
        try {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 3);

            const [shiftsResponse, staffResponse] = await Promise.all([
                fetch(`/api/shifts/between?start=${startDate.toISOString().split('T')[0]}&end=${endDate.toISOString().split('T')[0]}`),
                fetch('/api/staff')
            ]);

            if (!shiftsResponse.ok || !staffResponse.ok) {
                throw new Error('Kunne ikke hente data');
            }

            this.shifts = await shiftsResponse.json();
            this.allStaff = await staffResponse.json();

            this.displaySchedule();
        } catch (error) {
            console.error('Error loading schedule:', error);
            this.showError();
        }
    }

    displaySchedule() {
        const scheduleSection = document.getElementById('schedule-calendar');
        scheduleSection.innerHTML = this.getScheduleHTML();
        this.generateScheduleCalendar();
        this.setupScheduleEvents();
    }

    getScheduleHTML() {
        return `
            <div class="calendar-controls">
                <h3>Vagtplan - ${this.getMonthYearString(this.currentDate)}</h3>
                <div class="calendar-navigation">
                    <button id="schedule-prev-month">← Forrige</button>
                    <button id="schedule-today-btn">I dag</button>
                    <button id="schedule-next-month">Næste →</button>
                </div>
            </div>
            <div id="schedule-calendar-container"></div>
        `;
    }

    generateScheduleCalendar() {
        const container = document.getElementById('schedule-calendar-container');
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
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
            const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
            const dayShifts = this.getShiftsForDate(date);
            const isToday = this.isSameDay(date, new Date());
            const dateString = date.toISOString().split('T')[0];

            calendarHTML += `
                <div class="calendar-day ${isToday ? 'today' : ''}">
                    <div class="day-number">${day}</div>
                    <button onclick="scheduleManager.openShiftForm(null, '${dateString}')" style="background: #28a745; margin-bottom: 0.5rem; font-size: 0.7rem;">Tilføj vagt</button>
                    <div class="shows-list">
                        ${this.generateShiftsHTML(dayShifts)}
                    </div>
                </div>
            `;
        }

        calendarHTML += `</div>`;
        container.innerHTML = calendarHTML;
    }

    generateShiftsHTML(dayShifts) {
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
                <div class="show-time" onclick="scheduleManager.openShiftDetails(${shift.id})" 
                     title="${staffName} - ${shiftTime}">
                    ${staffName} - ${shiftTime}
                </div>
            `;
        });

        return html;
    }

    getShiftsForDate(date) {
        const dateString = date.toISOString().split('T')[0];
        return this.shifts.filter(shift => shift.shiftDate === dateString);
    }

    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
    }

    getMonthYearString(date) {
        const months = [
            'Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni',
            'Juli', 'August', 'September', 'Oktober', 'November', 'December'
        ];
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
    }

    setupScheduleEvents() {
        document.getElementById('schedule-prev-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.displaySchedule();
        });

        document.getElementById('schedule-next-month').addEventListener('click', () => {
            const maxDate = new Date();
            maxDate.setMonth(maxDate.getMonth() + 3);

            if (this.currentDate.getMonth() < maxDate.getMonth() ||
                this.currentDate.getFullYear() < maxDate.getFullYear()) {
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                this.displaySchedule();
            } else {
                alert('Vagtplanen viser kun 3 måneder frem');
            }
        });

        document.getElementById('schedule-today-btn').addEventListener('click', () => {
            this.currentDate = new Date();
            this.displaySchedule();
        });
    }

    async openShiftForm(shift = null, date = null) {
        const isEdit = shift !== null;

        const staffOptions = this.allStaff.map(staff =>
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
                        <label for="shift-type">Vagttype</label>
                        <select id="shift-type" required>
                            <option value="13-23">13-23 (10 timer)</option>
                            <option value="13-18">13-18 (5 timer)</option>
                            <option value="18-23">18-23 (5 timer)</option>
                        </select>
                        <button type="submit">${isEdit ? 'Opdater Vagt' : 'Tilføj Vagt'}</button>
                    </form>
                    <div id="shift-form-message" style="margin-top: 1rem;"></div>
                </div>
            </div>
        `;

        ModalManager.showModal(modalHTML);

        if (isEdit && shift.startTime && shift.endTime) {
            const pair = `${shift.startTime.substring(0,5)}-${shift.endTime.substring(0,5)}`;
            const sel = document.getElementById("shift-type");
            if (sel) sel.value = pair;
        }

        document.getElementById("shift-form").addEventListener("submit", async (e) => {
            e.preventDefault();

            const type = document.getElementById("shift-type").value;
            let startTime = '13:00';
            let endTime = '23:00';
            let hours = 10;
            let typeName = 'Day';
            if (type === '13-18') { endTime = '18:00'; hours = 5; typeName = 'Half Day'; }
            if (type === '18-23') { startTime = '18:00'; endTime = '23:00'; hours = 5; typeName = 'Evening'; }

            const shiftData = {
                staff: { id: parseInt(document.getElementById("shift-staff").value) },
                shiftDate: document.getElementById("shift-date").value,
                startTime: startTime,
                endTime: endTime,
                shiftType: typeName,
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
                        ModalManager.closeModal();
                        this.loadSchedule();
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

    openShiftDetails(shiftId) {
        const shift = this.shifts.find(s => s.id === shiftId);
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
                        <button onclick="scheduleManager.editShift(${shift.id})" style="width: 100%; margin-bottom: 0.5rem;">Rediger vagt</button>
                        <button onclick="scheduleManager.deleteShift(${shift.id})" style="width: 100%; background: #dc3545;">Slet vagt</button>
                    </div>
                </div>
            </div>
        `;

        ModalManager.showModal(modalHTML);
    }

    async editShift(shiftId) {
        const shift = this.shifts.find(s => s.id === shiftId);
        if (shift) {
            ModalManager.closeModal();
            this.openShiftForm(shift);
        }
    }

    async deleteShift(shiftId) {
        if (confirm('Er du sikker på at du vil slette denne vagt?')) {
            try {
                const response = await fetch(`/api/shifts/${shiftId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    ModalManager.closeModal();
                    this.loadSchedule();
                } else {
                    alert('Fejl ved sletning af vagt');
                }
            } catch (error) {
                console.error('Error deleting shift:', error);
                alert('Fejl ved sletning af vagt');
            }
        }
    }

    showError() {
        document.getElementById('schedule-calendar').innerHTML = `
            <p>Fejl ved indlæsning af vagtplan. Prøv igen senere.</p>
            <button onclick="scheduleManager.loadSchedule()">Prøv igen</button>
        `;
    }
}