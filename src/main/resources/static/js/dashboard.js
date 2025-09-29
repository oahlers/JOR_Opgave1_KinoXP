document.addEventListener("DOMContentLoaded", () => {
    const customerBtn = document.getElementById("customer-login-btn");
    const staffBtn = document.getElementById("staff-login-btn");

    if (customerBtn) {
        customerBtn.addEventListener("click", () => {
            openModal("customer");
        });
    }

    if (staffBtn) {
        staffBtn.addEventListener("click", () => {
            alert("Medarbejder-login kommer senere.");
        });
    }
});

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

    // Auto-vis login view først
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
            <input type="text" name="username" placeholder="Brugernavn" required>
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
            <input type="text" name="username" placeholder="Brugernavn" required>
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
            username: form.username.value,
            password: form.password.value
        };

        const res = await fetch("/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            const user = await res.json();
            document.getElementById("login-error").textContent = "";
            alert(`Velkommen, ${user.fullName}`);
            closeModal();
        } else {
            document.getElementById("login-error").textContent = "Forkert brugernavn eller adgangskode.";
        }
    });
}

function bindRegisterForm() {
    document.getElementById("register-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const form = e.target;
        const data = {
            fullName: form.fullName.value,
            username: form.username.value,
            password: form.password.value
        };

        const res = await fetch("/api/users/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            document.getElementById("register-msg").textContent = "Bruger oprettet! Du kan nu logge ind.";
            document.getElementById("register-msg").style.color = "green";
            form.reset();
        } else {
            document.getElementById("register-msg").textContent = "Oprettelse fejlede.";
            document.getElementById("register-msg").style.color = "red";
        }
    });
}
