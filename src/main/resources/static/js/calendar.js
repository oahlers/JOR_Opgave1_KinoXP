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
                this.showAlternativeShows(movieId, showTime, currentTheaterId),
            openMovieDay: (movieId, dateStr) => this.openMovieDay(movieId, dateStr)
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
                        ${this.generateMovieTitlesHTML(dayShows, date)}
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

    generateMovieTitlesHTML(dayShows, dateObj) {
        if (!dayShows || !dayShows.length) return '<div class="no-shows">Ingen film</div>';
        // unique by movieId
        const seen = new Set();
        const dateStr = dateObj.toISOString().split('T')[0];
        const items = [];
        for (const s of dayShows) {
            const mid = s.movieId;
            if (!seen.has(mid)) {
                seen.add(mid);
                const title = s.movie?.title || `Film #${mid}`;
                items.push(`<div class="show-time" onclick="window.calendarHandlers.openMovieDay(${mid}, '${dateStr}')" title="${title}">${title}</div>`);
            }
        }
        return items.join('') || '<div class="no-shows">Ingen film</div>';
    }

    async openMovieDay(movieId, dateStr) {
        try {
            // Fetch occupied seats for this movie on the selected date
            const occRes = await fetch(`/api/bookings/occupied?movieId=${encodeURIComponent(movieId)}&date=${encodeURIComponent(dateStr)}`);
            const occupied = occRes.ok ? await occRes.text() : '0';
            const occNum = parseInt(occupied || '0');

            const movie = this.calendarManager.shows.find(s => s.movieId === movieId)?.movie;
            const title = movie?.title || `Film #${movieId}`;

            const html = `
                <div class="modal-overlay" id="modal-overlay"></div>
                <div class="modal-box" id="modal-box" style="max-width: 520px;">
                    <button class="modal-close" id="modal-close" title="Luk">&times;</button>
                    <div id="modal-content">
                        <h2>Vælg tidspunkt</h2>
                        <p><strong>Film:</strong> ${title}</p>
                        <p><strong>Dato:</strong> ${new Date(dateStr).toLocaleDateString('da-DK')}</p>
                        <p style="margin-top:0.25rem;"><strong>Optagede sæder i dag:</strong> <span id="occupied-count">${isNaN(occNum)?0:occNum}</span></p>
                        <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-top:0.75rem;">
                            <button class="time-btn" data-time="14:00">Kl. 14:00</button>
                            <button class="time-btn" data-time="17:00">Kl. 17:00</button>
                            <button class="time-btn" data-time="20:00">Kl. 20:00</button>
                        </div>
                        <div id="choose-time-msg" style="margin-top:0.75rem; color:#ccc;"></div>
                    </div>
                </div>`;

            ModalManager.showModal(html);

            const onClick = async (e) => {
                const btn = e.target.closest('.time-btn');
                if (!btn) return;
                const hhmm = btn.getAttribute('data-time');
                const found = await this.findShowForTime(movieId, dateStr, hhmm);
                if (!found) {
                    const msg = document.getElementById('choose-time-msg');
                    if (msg) { msg.textContent = `Ingen forestilling fundet kl. ${hhmm} den valgte dag.`; msg.style.color = 'orange'; }
                    return;
                }
                // proceed to booking flow
                ModalManager.closeModal();
                this.bookShow(found.id);
            };
            document.getElementById('modal-content').addEventListener('click', onClick);
        } catch (e) {
            alert('Kunne ikke åbne tidsvalg.');
        }
    }

    async findShowForTime(movieId, dateStr, hhmm) {
        const toHM = (d) => `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
        const sameDate = (d, dStr) => {
            const ds = d.toISOString().split('T')[0];
            return ds === dStr;
        };
        // Try from already loaded shows
        let candidate = this.calendarManager.shows.find(s => {
            if (s.movieId !== movieId) return false;
            if (!s.showTime) return false;
            const dt = new Date(s.showTime);
            return sameDate(dt, dateStr) && toHM(dt) === hhmm;
        });
        if (candidate) return candidate;
        // Fallback: fetch shows by movie and filter
        try {
            const res = await fetch(`/api/shows/movie/${movieId}`);
            if (res.ok) {
                const shows = await res.json();
                candidate = shows.find(s => {
                    if (!s.showTime) return false;
                    const dt = new Date(s.showTime);
                    const t = toHM(dt);
                    return dt.toISOString().split('T')[0] === dateStr && t === hhmm;
                });
                return candidate || null;
            }
        } catch (_) {}
        return null;
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

    async bookShow(showId) {
        if (!localStorage.getItem('loggedInUser')) {
            alert('Du skal være logget ind for at booke billetter');
            ModalManager.closeModal();
            ModalManager.openModal("customer");
            return;
        }

        try {
            // Hent show og kiosk-varer
            const [showRes, sweetsRes] = await Promise.all([
                fetch(`/api/shows/${showId}`),
                fetch('/api/sweets')
            ]);
            const show = await showRes.json();
            const sweets = await sweetsRes.json();

            const ticketPrice = show?.movie?.ticketPrice ?? 0;
            const movieTitle = show?.movie?.title ?? `Film #${show?.movieId ?? ''}`;
            const showTime = show?.showTime ? new Date(show.showTime).toLocaleString('da-DK') : '';

            const sweetsRows = sweets.map(s => `
                <div class="sweet-row" data-id="${s.id}" data-price="${s.price}">
                    <span>${s.name} (${s.price} DKK)</span>
                    <input type="number" min="0" value="0" class="sweet-qty" style="width: 60px; text-align: right;">
                </div>
            `).join('');

            const html = `
                <div class="modal-overlay" id="modal-overlay"></div>
                <div class="modal-box" id="modal-box" style="max-width: 560px;">
                    <button class="modal-close" id="modal-close" title="Luk">&times;</button>
                    <div id="modal-content">
                        <h2>Book billet</h2>
                        <p><strong>Film:</strong> ${movieTitle}</p>
                        <p><strong>Dato/tid:</strong> ${showTime}</p>
                        <p><strong>Billetpris:</strong> <span id="ticket-price">${ticketPrice}</span> DKK</p>
                        <label for="ticket-count">Antal billetter</label>
                        <input type="number" id="ticket-count" min="1" value="1" style="width: 80px;">

                        <h3 style="margin-top:1rem;">Kiosk tilkøb</h3>
                        <div id="sweets-list-booking" style="max-height: 220px; overflow:auto; padding:0.5rem; border:1px solid #444; border-radius:4px;">
                            ${sweetsRows || '<em>Ingen kioskvarer</em>'}
                        </div>

                        <div style="margin-top:1rem; display:flex; align-items:center; gap:0.5rem;">
                            <input type="checkbox" id="pay-cash" />
                            <label for="pay-cash">Betales kontant ved fremmøde</label>
                        </div>
                        <div id="cash-confirm" style="display:none; color:#28a745; margin-top:0.25rem;">Betaling: Kontant ved fremmøde</div>

                        <div style="margin-top:1rem; display:flex; flex-wrap:wrap; gap:0.5rem; align-items:center;">
                            <p style="margin:0;"><strong>Total:</strong> <span id="booking-total">${ticketPrice}</span> DKK</p>
                            <span id="total-note" style="font-size:0.9rem; color:#888;"></span>
                        </div>
                        <div style="margin-top:0.75rem; display:flex; gap:0.5rem;">
                            <button id="confirm-booking">Bekræft booking</button>
                            <button id="close-booking" style="background:#6c757d;">Luk</button>
                        </div>

                        <div id="booking-msg" style="margin-top: 0.75rem;"></div>
                    </div>
                </div>
            `;

            ModalManager.showModal(html);

            const recalc = () => {
                const count = Math.max(1, parseInt(document.getElementById('ticket-count').value || '1'));
                let total = count * Number(ticketPrice || 0);
                document.querySelectorAll('#sweets-list-booking .sweet-row').forEach(row => {
                    const price = Number(row.getAttribute('data-price')) || 0;
                    const qty = Math.max(0, parseInt(row.querySelector('.sweet-qty').value || '0'));
                    total += price * qty;
                });
                document.getElementById('booking-total').textContent = total.toFixed(2);
            };

            // Wire up UI
            document.getElementById('ticket-count').addEventListener('input', recalc);
            document.querySelectorAll('.sweet-qty').forEach(inp => inp.addEventListener('input', recalc));
            const cashCheckbox = document.getElementById('pay-cash');
            const cashConfirm = document.getElementById('cash-confirm');
            const totalNote = document.getElementById('total-note');
            const confirmBtn = document.getElementById('confirm-booking');
            // Require explicit cash confirmation before enabling booking
            if (confirmBtn) confirmBtn.disabled = true;
            if (cashCheckbox) {
                const onCashChange = () => {
                    const checked = !!cashCheckbox.checked;
                    cashConfirm.style.display = checked ? 'block' : 'none';
                    totalNote.textContent = checked ? '(betales kontant ved fremmøde)' : '';
                    if (confirmBtn) confirmBtn.disabled = !checked;
                };
                cashCheckbox.addEventListener('change', onCashChange);
                onCashChange();
            }
            const closeBtn = document.getElementById('close-booking');
            if (closeBtn) closeBtn.addEventListener('click', () => ModalManager.closeModal());
            recalc();

            document.getElementById('confirm-booking').addEventListener('click', async () => {
                const user = JSON.parse(localStorage.getItem('loggedInUser'));
                const seats = Math.max(1, parseInt(document.getElementById('ticket-count').value || '1'));

                try {
                    const res = await fetch('/api/bookings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ showId: showId, customerName: user.fullName, seats })
                    });

                    if (!res.ok) throw new Error('Booking fejlede');

                    document.getElementById('booking-msg').textContent = 'Booking oprettet! Din billet åbnes til print.';
                    document.getElementById('booking-msg').style.color = 'green';

                    // Generer QR-kode og åbn printvindue direkte (ikke i modal)
                    const dataStr = `${window.location.origin}/calendar | ${movieTitle} | ${showTime} | ${user.fullName} | ${seats} billetter`;
                    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(dataStr)}`;

                    const win = window.open('', 'PRINT', 'height=650,width=900');
                    win.document.write(`
                        <html>
                          <head>
                            <title>Billet</title>
                            <meta charset="utf-8" />
                            <style>
                              body{font-family: Arial, sans-serif; background:#fff; color:#000;}
                              .ticket{max-width:480px; margin:20px auto; border:1px solid #000; padding:16px;}
                              .qr{display:block; margin:12px auto;}
                              h2,h3,p{margin:6px 0;}
                            </style>
                          </head>
                          <body>
                            <div class="ticket">
                              <h2>KinoXP Billet</h2>
                              <p><strong>Film:</strong> ${movieTitle}</p>
                              <p><strong>Dato/tid:</strong> ${showTime}</p>
                              <p><strong>Navn:</strong> ${user.fullName}</p>
                              <p><strong>Antal billetter:</strong> ${seats}</p>
                              <img id="qr-img" class="qr" src="${qrUrl}" alt="QR kode" />
                              <p>Vis denne QR kode ved indgangen.</p>
                            </div>
                            <script>(function(){
                              function safePrint(){
                                try{window.print();}catch(e){}
                                window.onfocus=function(){setTimeout(()=>window.close(),300)}
                              }
                              const img=document.getElementById('qr-img');
                              if(img){
                                if(img.complete){ safePrint(); }
                                else { img.addEventListener('load', safePrint); setTimeout(safePrint, 1500); }
                              } else {
                                setTimeout(safePrint, 500);
                              }
                            })();<\/script>
                          </body>
                        </html>
                    `);
                    win.document.close();
                    win.focus();
                    // Luk booking-modal når printvindue er åbnet
                    ModalManager.closeModal();
                } catch (err) {
                    document.getElementById('booking-msg').textContent = 'Kunne ikke oprette booking.';
                    document.getElementById('booking-msg').style.color = 'red';
                }
            }, { once: true });
        } catch (e) {
            alert('Kunne ikke indlæse bookingdata. Prøv igen.');
        }
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