import { ModalManager } from './modal.js';
export class AuthManager {

    // Tjekker login-status og opdaterer UI dynamisk - håndterer både brugere og medarbejdere
    // Skifter mellem login-knapper og velkomst-besked baseret på hvem der er logget ind, vha. queryselector og innerhtml.
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
        if (window.location.pathname.startsWith('/staff')) {
            window.location.href = '/';
        } else {
            location.reload();
        }
    }

    static setupLoginButtons() {
        const customerBtn = document.getElementById("customer-login-btn");
        const staffBtn = document.getElementById("staff-login-btn");

        window.addEventListener('user-login-changed', AuthManager.checkLoginStatus);

        if (customerBtn) {
            customerBtn.addEventListener("click", () => {
                ModalManager.openModal("customer");
            });
        }

        if (staffBtn) {
            staffBtn.addEventListener("click", () => {
                ModalManager.openModal("staff");
            });
        }
    }
}