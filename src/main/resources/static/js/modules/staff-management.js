// Staff management functionality
export class StaffManager {
    static async loadStaff() {
        try {
            const response = await fetch('/api/staff');
            const staff = await response.json();
            this.displayStaff(staff);
        } catch (error) {
            console.error('Error loading staff:', error);
        }
    }

    static displayStaff(staff) {
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
                    <button onclick="StaffManager.editStaff(${staffMember.id})">Rediger</button>
                    <button onclick="StaffManager.deleteStaff(${staffMember.id})" style="background: #dc3545; margin-left: 0.5rem;">Slet</button>
                </div>
            `;
            staffList.appendChild(staffItem);
        });
    }

    static async openStaffForm(staff = null) {
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

        ModalManager.showModal(modalHTML);

        document.getElementById("staff-form").addEventListener("submit", async (e) => {
            e.preventDefault();

            const staffData = {
                fullName: document.getElementById("staff-fullname").value,
                username: document.getElementById("staff-username").value,
                position: document.getElementById("staff-position").value
            };

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
                        ModalManager.closeModal();
                        this.loadStaff();
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

    static async editStaff(staffId) {
        try {
            const response = await fetch(`/api/staff/${staffId}`);
            const staff = await response.json();
            this.openStaffForm(staff);
        } catch (error) {
            console.error('Error loading staff:', error);
        }
    }

    static async deleteStaff(staffId) {
        if (confirm('Er du sikker på at du vil slette denne medarbejder?')) {
            try {
                const response = await fetch(`/api/staff/${staffId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    this.loadStaff();
                } else {
                    alert('Fejl ved sletning af medarbejder');
                }
            } catch (error) {
                console.error('Error deleting staff:', error);
                alert('Fejl ved sletning af medarbejder');
            }
        }
    }
}