const api = "/api/sweets";

async function loadSweets() {
    const res = await fetch(api);
    const sweets = await res.json();
    const list = document.getElementById("sweetList");
    list.innerHTML = "";
    sweets.forEach(s => {
        const li = document.createElement("li");
        li.textContent = `${s.name} - $${s.price}`;
        list.appendChild(li);
    });
}

document.getElementById("sweetForm").addEventListener("submit", async e => {
    e.preventDefault();
    const sweet = {
        name: document.getElementById("name").value,
        price: document.getElementById("price").value
    };
    await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sweet)
    });
    loadSweets();
});

loadSweets();
