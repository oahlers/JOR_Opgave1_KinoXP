// Sweets (kiosk) management functionality
import { ModalManager } from './modal.js';

export class SweetsManager {
    static async loadSweets() {
        try {
            const response = await fetch('/api/sweets');
            const sweets = await response.json();
            this.displaySweets(sweets);
        } catch (error) {
            console.error('Error loading sweets:', error);
        }
    }

    static displaySweets(sweets) {
        const list = document.getElementById('sweets-list');
        list.innerHTML = '';

        sweets.forEach(sweet => {
            const item = document.createElement('div');
            item.className = 'card';
            item.style.marginBottom = '1rem';
            item.innerHTML = `
                <h3>${sweet.name}</h3>
                <p><strong>Pris:</strong> ${this.formatPrice(sweet.price)}</p>
                <div style="margin-top: 1rem;">
                    <button onclick="SweetsManager.editSweet(${sweet.id})">Rediger</button>
                    <button onclick="SweetsManager.deleteSweet(${sweet.id})" style="background: #dc3545; margin-left: 0.5rem;">Slet</button>
                </div>
            `;
            list.appendChild(item);
        });
    }

    static formatPrice(price) {
        try {
            const val = typeof price === 'string' ? price : (price?.toString?.() ?? '');
            return `${val} DKK`;
        } catch (e) {
            return `${price} DKK`;
        }
    }

    static async openSweetForm(sweet = null) {
        const isEdit = sweet !== null;

        const modalHTML = `
            <div class="modal-overlay" id="modal-overlay"></div>
            <div class="modal-box" id="modal-box" style="max-width: 420px;">
                <button class="modal-close" id="modal-close">&times;</button>
                <div id="modal-content">
                    <h2>${isEdit ? 'Rediger Vare' : 'Tilføj Ny Vare'}</h2>
                    <form id="sweet-form">
                        <input type="text" id="sweet-name" placeholder="Navn" value="${isEdit ? sweet.name : ''}" required>
                        <input type="number" id="sweet-price" placeholder="Pris (DKK)" step="0.01" value="${isEdit ? sweet.price : ''}" required>
                        <button type="submit">${isEdit ? 'Opdater' : 'Tilføj'}</button>
                    </form>
                    <div id="sweet-form-message" style="margin-top: 1rem;"></div>
                </div>
            </div>
        `;

        ModalManager.showModal(modalHTML);

        document.getElementById('sweet-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            const sweetData = {
                name: document.getElementById('sweet-name').value,
                price: parseFloat(document.getElementById('sweet-price').value)
            };

            try {
                const url = isEdit ? `/api/sweets/${sweet.id}` : '/api/sweets';
                const method = isEdit ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(sweetData)
                });

                if (response.ok) {
                    document.getElementById('sweet-form-message').textContent = isEdit ? 'Vare opdateret!' : 'Vare tilføjet!';
                    document.getElementById('sweet-form-message').style.color = 'green';
                    setTimeout(() => {
                        ModalManager.closeModal();
                        this.loadSweets();
                    }, 1000);
                } else {
                    throw new Error('Fejl ved gemning');
                }
            } catch (error) {
                document.getElementById('sweet-form-message').textContent = 'Fejl ved gemning af vare';
                document.getElementById('sweet-form-message').style.color = 'red';
            }
        });
    }

    static async editSweet(id) {
        try {
            const response = await fetch(`/api/sweets/${id}`);
            const sweet = await response.json();
            this.openSweetForm(sweet);
        } catch (error) {
            console.error('Error loading sweet:', error);
        }
    }

    static async deleteSweet(id) {
        if (!confirm('Er du sikker på at du vil slette denne vare?')) return;
        try {
            const response = await fetch(`/api/sweets/${id}`, { method: 'DELETE' });
            if (response.ok) {
                this.loadSweets();
            } else {
                alert('Fejl ved sletning af vare');
            }
        } catch (error) {
            console.error('Error deleting sweet:', error);
            alert('Fejl ved sletning af vare');
        }
    }
}
