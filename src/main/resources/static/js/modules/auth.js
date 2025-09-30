// Authentication module - genanvendelig login/logout funktionalitet
import { ModalManager } from './modal.js';
export class AuthManager {
    static checkLoginStatus() {
        const loggedInUser = localStorage.getItem('loggedInUser');
        const loggedInStaff = localStorage.getItem('loggedInStaff');
        const loginButtons = document.getElementById('login-buttons');

        const nav = document.querySelector('nav');
        const existingWelcome = document.getElementById('user-welcome');
        if (existingWelcome) existingWelcome.remove();

        if (loggedInUser) {
            const user = JSON.parse(loggedInUser);
            if (nav) {
                const welcomeElement = document.createElement('div');
                welcomeElement.id = 'user-welcome';
                welcomeElement.style.display = 'flex';
                welcomeElement.style.alignItems = 'center';
                welcomeElement.style.gap = '0.5rem';
                welcomeElement.innerHTML = `
                    <span>Velkommen ${user.fullName}</span>
                    <a href="/my-bookings" id="my-bookings-link" class="button-link">Mine bookinger</a>
                    <button id="logout-btn">Log ud</button>
                `;
                nav.appendChild(welcomeElement);
                document.getElementById('logout-btn').addEventListener('click', AuthManager.logout);
            }
            if (loginButtons) loginButtons.style.display = 'none';
            return;
        }

        if (loggedInStaff) {
            const staff = JSON.parse(loggedInStaff);
            if (nav) {
                const welcomeElement = document.createElement('div');
                welcomeElement.id = 'user-welcome';
                welcomeElement.style.display = 'flex';
                welcomeElement.style.alignItems = 'center';
                welcomeElement.style.gap = '0.5rem';
                welcomeElement.innerHTML = `
                    <span>Velkommen ${staff.fullName || staff.username}</span>
                    <a href="/staff" class="button-link">Staff</a>
                    <button id="logout-staff-btn">Log ud</button>
                `;
                nav.appendChild(welcomeElement);
                document.getElementById('logout-staff-btn').addEventListener('click', AuthManager.logoutStaff);
            }
            if (loginButtons) loginButtons.style.display = 'none';
            return;
        }

        if (loginButtons) loginButtons.style.display = 'block';
    }

    static logout() {
        localStorage.removeItem('loggedInUser');
        location.reload();
    }

    static logoutStaff() {
        localStorage.removeItem('loggedInStaff');
        // If on staff page, go home; otherwise simple reload
        if (window.location.pathname.startsWith('/staff')) {
            window.location.href = '/';
        } else {
            location.reload();
        }
    }

    static setupLoginButtons() {
        const customerBtn = document.getElementById("customer-login-btn");
        const staffBtn = document.getElementById("staff-login-btn");

        // React to login state changes dispatched by ModalManager
        window.addEventListener('user-login-changed', AuthManager.checkLoginStatus);

        if (customerBtn) {
            customerBtn.addEventListener("click", () => {
                ModalManager.openModal("customer");
            });
        }

        if (staffBtn) {
            staffBtn.addEventListener("click", () => {
                AuthManager.openStaffModal();
            });
        }
    }

    static async openStaffModal() {
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

        ModalManager.showModal(modalHTML);

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
                    try { localStorage.setItem('loggedInStaff', JSON.stringify(staff)); } catch(e) {}
                    ModalManager.closeModal();
                    window.dispatchEvent(new Event('user-login-changed'));
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
}