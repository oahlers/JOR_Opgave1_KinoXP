const api = "/api/bookings";

async function loadBookings() {
    const res = await fetch(api);
    const bookings = await res.json();
    const list = document.getElementById("bookingList");
    list.innerHTML = "";
    bookings.forEach(b => {
        const li = document.createElement("li");
        li.textContent = `${b.customerName} booked ${b.numberOfSeats} seats for show ${b.show.id}`;
        list.appendChild(li);
    });
}

document.getElementById("bookingForm").addEventListener("submit", async e => {
    e.preventDefault();
    const params = new URLSearchParams({
        showId: document.getElementById("showId").value,
        customerName: document.getElementById("customerName").value,
        seats: document.getElementById("seats").value
    });
    await fetch(api + "?" + params, { method: "POST" });
    loadBookings();
});

loadBookings();
