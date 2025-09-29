const api = "/api/staff";

async function loadStaff() {
    const res = await fetch(api);
    const staff = await res.json();
    const list = document.getElementById("staffList");
    list.innerHTML = "";
    staff.forEach(s => {
        const li = document.createElement("li");
        li.textContent = `${s.name} (${s.role})`;
        list.appendChild(li);
    });
}

document.getElementById("staffForm").addEventListener("submit", async e => {
    e.preventDefault();
    const staff = {
        name: document.getElementById("name").value,
        role: document.getElementById("role").value
    };
    await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(staff)
    });
    loadStaff();
});

loadStaff();
