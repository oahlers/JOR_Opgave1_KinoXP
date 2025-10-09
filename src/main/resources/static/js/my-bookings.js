import { AuthManager } from './modules/auth.js';
import { ModalManager } from './modules/modal.js';

function getLoggedInUser() {
    const u = localStorage.getItem('loggedInUser');
    return u ? JSON.parse(u) : null;
}

async function fetchMyBookingsByUser(userId) {
    const res = await fetch(`/api/bookings/by-user?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error('Kunne ikke hente bookinger');
    return await res.json();
}

function formatDateTime(dtStr) {
    try {
        const dt = new Date(dtStr);
        return dt.toLocaleString('da-DK');
    } catch (e) {
        return dtStr;
    }
}

// Når en film skal renderes på "mine bookings" siden" tjekkes der først om listen er tom
// Hvis ikke oprettes en foreach metode der med en innerhtml viser hver bestilte billets filmnavn, dato og antal pladser
// Der laves en oneclick funktion der virker ved at man for opstillet tre muligheder ved tryk af en specifik film
// Ved tryk af en af funktionerne, såsom aktionen reschedule, som ville være "ændre dato" på siden
// Hentes funktionen openRescheduleModal der viser andre tider for samme film, så man kan vælge en ny dato
// På den måde har alle ens bookede film de samme funktionaliteter på "mine bookings" siden
function renderBookings(bookings) {
    const list = document.getElementById('bookings-list');
    const empty = document.getElementById('empty-state');
    list.innerHTML = '';

    if (!bookings || bookings.length === 0) {
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';

    bookings.forEach(b => {
        const movieTitle = b.show?.movie?.title ?? `Film #${b.show?.movieId ?? ''}`;
        const dateStr = b.show?.showTime ? formatDateTime(b.show.showTime) : '';
        const theaterName = b.show?.theater?.name ?? 'Ukendt teater';
        const item = document.createElement('div');
        item.className = 'content-card';
        const imgHtml = b.show?.movie?.imageUrl ? `<img src="${b.show.movie.imageUrl}" alt="${movieTitle}" class="movie-thumb" onerror="this.style.display='none'">` : '';
        item.innerHTML = `
            ${imgHtml}
            <h3>${movieTitle}</h3>
            <p><strong>Teatersal:</strong> ${theaterName}</p>
            <p><strong>Dato og tid:</strong> ${dateStr}</p>
            <p><strong>Pladser:</strong> ${b.seats}</p>
            <div style="margin-top: 0.5rem; display:flex; gap:0.5rem; flex-wrap: wrap;">
                <button data-action="ticket" data-id="${b.id}">Vis billet</button>
                <button data-action="reschedule" data-id="${b.id}">Ændr dato</button>
                <button data-action="cancel" data-id="${b.id}" style="background:#dc3545;">Aflys</button>
            </div>
        `;
        list.appendChild(item);
    });

    list.onclick = async (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const id = btn.getAttribute('data-id');
        const action = btn.getAttribute('data-action');
        if (action === 'cancel') {
            if (!confirm('Er du sikker på at du vil aflyse denne booking?')) return;
            const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
            if (res.ok) {
                loadAndRender();
            } else {
                alert('Kunne ikke aflyse booking');
            }
        } else if (action === 'reschedule') {
            const booking = currentBookings.find(x => String(x.id) === String(id));
            if (booking) {
                openRescheduleModal(booking);
            }
        } else if (action === 'ticket') {
            const booking = currentBookings.find(x => String(x.id) === String(id));
            if (booking) {
                openTicketPrint(booking);
            }
        }
    };

function openTicketPrint(booking) {
    const user = getLoggedInUser();
    const movieTitle = booking.show?.movie?.title ?? `Film #${booking.show?.movieId ?? ''}`;
    const showTime = booking.show?.showTime ? formatDateTime(booking.show.showTime) : '';
    const seats = booking.seats || 1;
    const fullName = (booking.user && booking.user.fullName) ? booking.user.fullName : (user?.fullName || '');

    const dataStr = `${window.location.origin}/calendar | ${movieTitle} | ${showTime} | ${fullName} | ${seats} billetter`;
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
              <p><strong>Navn:</strong> ${fullName}</p>
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
}
}

function setupSearch() {
    const input = document.getElementById('search-input');
    input.addEventListener('input', () => {
        const q = input.value.toLowerCase();
        const filtered = currentBookings.filter(b => {
            const title = b.show?.movie?.title?.toLowerCase?.() || '';
            const dt = b.show?.showTime || '';
            return title.includes(q) || dt.toLowerCase().includes(q);
        });
        renderBookings(filtered);
    });
}

async function openRescheduleModal(booking) {
    const movieId = booking.show?.movieId;
    if (!movieId) {
        alert('Kan ikke ændre dato for denne booking.');
        return;
    }
    let shows = [];
    try {
        const res = await fetch(`/api/shows/movie/${movieId}`);
        shows = await res.json();
    } catch (e) {}

    const options = shows.map(s => {
        const time = s.showTime ? formatDateTime(s.showTime) : s.id;
        const selected = s.id === booking.show.id ? 'selected' : '';
        return `<option value="${s.id}" ${selected}>${time}</option>`;
    }).join('');

    const html = `
        <div class="modal-overlay" id="modal-overlay"></div>
        <div class="modal-box" id="modal-box" style="max-width:460px;">
            <button class="modal-close" id="modal-close">&times;</button>
            <div id="modal-content">
                <h2>Vælg ny dato/tid</h2>
                <p>${booking.show?.movie?.title ?? ''}</p>
                <label for="new-show">Forestillinger:</label>
                <select id="new-show">${options}</select>
                <div style="margin-top:1rem;">
                    <button id="confirm-reschedule">Gem</button>
                </div>
                <div id="reschedule-msg" style="margin-top:0.5rem;"></div>
            </div>
        </div>`;

    ModalManager.showModal(html);

    document.getElementById('confirm-reschedule').addEventListener('click', async () => {
        const newShowId = document.getElementById('new-show').value;
        try {
            const res = await fetch(`/api/bookings/${booking.id}/reschedule?newShowId=${encodeURIComponent(newShowId)}`, { method: 'PUT' });
            if (res.ok) {
                document.getElementById('reschedule-msg').textContent = 'Booking opdateret!';
                document.getElementById('reschedule-msg').style.color = 'green';
                setTimeout(() => {
                    ModalManager.closeModal();
                    loadAndRender();
                }, 800);
            } else {
                throw new Error('Fejl');
            }
        } catch (e) {
            document.getElementById('reschedule-msg').textContent = 'Kunne ikke opdatere booking.';
            document.getElementById('reschedule-msg').style.color = 'red';
        }
    });
}

let currentBookings = [];

async function loadAndRender() {
    const user = getLoggedInUser();
    if (!user) {
        window.location.href = '/';
        return;
    }
    const bookings = await fetchMyBookingsByUser(user.id);
    currentBookings = bookings;
    const q = document.getElementById('search-input').value.toLowerCase();
    const filtered = q ? bookings.filter(b => {
        const title = b.show?.movie?.title?.toLowerCase?.() || '';
        const dt = b.show?.showTime || '';
        return title.includes(q) || dt.toLowerCase().includes(q);
    }) : bookings;
    renderBookings(filtered);
}

function init() {
    AuthManager.setupLoginButtons();
    AuthManager.checkLoginStatus();

    const user = getLoggedInUser();
    if (!user) {
    }

    setupSearch();
    document.getElementById('refresh-btn').addEventListener('click', loadAndRender);
    loadAndRender();
}

window.addEventListener('DOMContentLoaded', init);
