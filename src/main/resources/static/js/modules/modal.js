// Modal management module
export class ModalManager {
    static showModal(html) {
        document.body.insertAdjacentHTML("beforeend", html);
        this.setupModalEvents();
    }

    static closeModal() {
        const overlay = document.getElementById("modal-overlay");
        const modal = document.getElementById("modal-box");
        if (overlay) overlay.remove();
        if (modal) modal.remove();
    }

    static setupModalEvents() {
        const closeBtn = document.getElementById("modal-close");
        const overlay = document.getElementById("modal-overlay");

        if (closeBtn) closeBtn.addEventListener("click", this.closeModal);
        if (overlay) overlay.addEventListener("click", this.closeModal);
    }

    static openModal(type) {
        const modalHTML = `
            <div class="modal-overlay" id="modal-overlay"></div>
            <div class="modal-box" id="modal-box">
                <button class="modal-close" id="modal-close">&times;</button>
                <div id="modal-content">
                    ${this.getAuthUI()}
                </div>
            </div>
        `;

        this.showModal(modalHTML);
        this.setupAuthModal();
    }

    static getAuthUI() {
        return `
            <h2 style="text-align: center;">Kunde Login</h2>
            <div style="text-align: center; margin-bottom: 1rem;">
                <button id="login-view-btn">Login</button>
                <button id="register-view-btn">Opret Bruger</button>
            </div>
            <div id="form-container"></div>
        `;
    }

    static setupAuthModal() {
        document.getElementById("login-view-btn").addEventListener("click", () => {
            document.getElementById("form-container").innerHTML = this.getLoginForm();
            this.bindLoginForm();
        });

        document.getElementById("register-view-btn").addEventListener("click", () => {
            document.getElementById("form-container").innerHTML = this.getRegisterForm();
            this.bindRegisterForm();
        });

        document.getElementById("login-view-btn").click();
    }

    static getLoginForm() {
        return `
            <form id="login-form">
                <input type="text" name="phonenumber" placeholder="Telefonnummer" required>
                <input type="password" name="password" placeholder="Adgangskode" required>
                <button type="submit">Login</button>
            </form>
            <div id="login-error" style="color: red; margin-top: 1rem;"></div>
        `;
    }

    static getRegisterForm() {
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

    static bindLoginForm() {
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
                    this.closeModal();
                    AuthManager.checkLoginStatus();
                } else {
                    document.getElementById("login-error").textContent = "Forkert telefonnummer eller adgangskode.";
                }
            } catch (error) {
                console.error('Login error:', error);
                document.getElementById("login-error").textContent = "Fejl ved login. Prøv igen senere.";
            }
        });
    }

    static bindRegisterForm() {
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
}