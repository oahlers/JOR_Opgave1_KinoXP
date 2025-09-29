const api = "/api/roster";

async function loadRoster() {
    const res = await fetch(api);
    const roster = await res.json();
    const list = document.getElementById("rosterList");
    list.innerHTML = "";
    roster.forEach(r => {
        const li = document.createElement("li");
        li.textContent = `${r.staff.name} works ${r.shift} on ${r.workDate}`;
        list.appendChild(li);
    });
}

document.getElementById("rosterForm").addEventListener("submit", async e => {
    e.preventDefault();
    const params = new URLSearchParams({
        staffId: document.getElementById("staffId").value,
        date: document.getElementById("date").value,
        shift: document.getElementById("shift").value
    });
    await fetch(api + "?" + params, { method: "POST" });
    loadRoster();
});

loadRoster();
