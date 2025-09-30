import { AuthManager } from './modules/auth.js';
import { ModalManager } from './modules/modal.js';
import { CalendarManager } from './modules/calendar-core.js';

class CalendarPage {
    constructor() {
        this.calendarManager = new CalendarManager();
        this.setupGlobalHandlers();
    }

    setupGlobalHandlers() {
        window.calendarHandlers = {
            openShowDetails: (showId) => this.openShowDetails(showId),
            bookShow: (showId) => this.bookShow(showId),
            showAlternativeShows: (movieId, showTime, currentTheaterId) =>
                this.showAlternativeShows(movieId, showTime, currentTheaterId)
        };
    }

    async init() {
        document.addEventListener("DOMContentLoaded", async () => {
            await this.loadCalendar();
            AuthManager.setupLoginButtons();
            AuthManager.checkLoginStatus();
        });
    }

    async loadCalendar() {
        try {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 3);

            await this.calendarManager.loadShows(startDate, endDate);
            this.displayCalendar();
        } catch (error) {
            console.error('Error loading shows:', error);
            this.showError();
        }
    }

    displayCalendar() {
        const calendarSection = document.querySelector('.card');
        calendarSection.innerHTML = this.getCalendarHTML();
        this.generateCalendar();
        this.setupCalendarEvents();
    }

    getCalendarHTML() {
        return `
            <div class="calendar-controls">
                <h2>Kalender - ${this.calendarManager.getMonthYearString(this.calendarManager.currentDate)}</h2>
                <div class="calendar-navigation">
                    <button id="prev-month">← Forrige</button>
                    <button id="today-btn">I dag</button>
                    <button id="next-month">Næste →</button>
                </div>
            </div>
            <div id="calendar-container"></div>
        `;
    }

    generateCalendar() {
        const container = document.getElementById('calendar-container');
        const firstDay = new Date(this.calendarManager.currentDate.getFullYear(), this.calendarManager.currentDate.getMonth(), 1);
        const lastDay = new Date(this.calendarManager.currentDate.getFullYear(), this.calendarManager.currentDate.getMonth() + 1, 0);
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
            const date = new Date(this.calendarManager.currentDate.getFullYear(), this.calendarManager.currentDate.getMonth(), day);
            const dayShows = this.calendarManager.getShowsForDate(date);
            const isToday = this.calendarManager.isSameDay(date, new Date());

            calendarHTML += `
                <div class="calendar-day ${isToday ? 'today' : ''}">
                    <div class="day-number">${day}</div>
                    <div class="shows-list">
                        ${this.calendarManager.generateShowsHTML(dayShows)}
                    </div>
                </div>
            `;
        }

        calendarHTML += `</div>`;
        container.innerHTML = calendarHTML;
    }

    setupCalendarEvents() {
        document.getElementById('prev-month').addEventListener('click', () => {
            this.calendarManager.currentDate.setMonth(this.calendarManager.currentDate.getMonth() - 1);
            this.displayCalendar();
        });

        document.getElementById('next-month').addEventListener('click', () => {
            const maxDate = new Date();
            maxDate.setMonth(maxDate.getMonth() + 3);

            if (this.calendarManager.currentDate.getMonth() < maxDate.getMonth() ||
                this.calendarManager.currentDate.getFullYear() < maxDate.getFullYear()) {
                this.calendarManager.currentDate.setMonth(this.calendarManager.currentDate.getMonth() + 1);
                this.displayCalendar();
            } else {
                alert('Kalenderen viser kun 3 måneder frem');
            }
        });

        document.getElementById('today-btn').addEventListener('click', () => {
            this.calendarManager.currentDate = new Date();
            this.displayCalendar();
        });
    }

    openShowDetails(showId) {
        const show = this.calendarManager.shows.find(s => s.id === showId);
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
                        <button onclick="window.calendarHandlers.bookShow(${show.id})" style="width: 100%; margin-bottom: 0.5rem;">Book billetter til denne forestilling</button>
                        <button onclick="window.calendarHandlers.showAlternativeShows(${show.movieId}, '${new Date(show.showTime).toISOString()}', ${show.theaterId})" 
                                style="width: 100%; background: #333;">
                            Se alternative forestillinger
                        </button>
                    </div>
                </div>
            </div>
        `;

        ModalManager.showModal(modalHTML);
    }

    showAlternativeShows(movieId, showTime, currentTheaterId) {
        const currentDateTime = new Date(showTime);
        const currentDate = new Date(currentDateTime.getFullYear(), currentDateTime.getMonth(), currentDateTime.getDate());

        const alternativeShows = this.calendarManager.shows.filter(show => {
            const showDate = new Date(show.showTime);
            const isSameDate = showDate.getFullYear() === currentDate.getFullYear() &&
                showDate.getMonth() === currentDate.getMonth() &&
                showDate.getDate() === currentDate.getDate();

            return show.movieId === movieId && isSameDate && show.theaterId !== currentTheaterId;
        });

        ModalManager.closeModal();

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
                                <button onclick="window.calendarHandlers.bookShow(${show.id})" style="width: 100%; margin-top: 0.5rem;">
                                    Book til ${new Date(show.showTime).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })} - ${show.theater ? show.theater.name : 'Ukendt teater'}
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        ModalManager.showModal(modalHTML);
    }

    bookShow(showId) {
        if (!localStorage.getItem('loggedInUser')) {
            alert('Du skal være logget ind for at booke billetter');
            ModalManager.closeModal();
            ModalManager.openModal("customer");
            return;
        }

        alert(`Booking funktionalitet for show ${showId} vil blive implementeret her`);
        ModalManager.closeModal();
    }

    showError() {
        document.querySelector('.card').innerHTML = `
            <h2>Kommende Forestillinger</h2>
            <p>Fejl ved indlæsning af kalender. Prøv igen senere.</p>
            <button onclick="calendarPage.loadCalendar()">Prøv igen</button>
        `;
    }
}

// Initialize the calendar page
const calendarPage = new CalendarPage();
calendarPage.init();