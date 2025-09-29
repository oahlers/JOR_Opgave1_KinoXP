const api = "/api/shows";

async function loadShows() {
    const res = await fetch(api);
    const shows = await res.json();
    const list = document.getElementById("showList");
    list.innerHTML = "";
    shows.forEach(s => {
        const li = document.createElement("li");
        li.textContent = `Show ${s.id}: Movie ${s.movie.title} in Theater ${s.theater.name} at ${s.dateTime}`;
        list.appendChild(li);
    });
}

document.getElementById("showForm").addEventListener("submit", async e => {
    e.preventDefault();
    const params = new URLSearchParams({
        movieId: document.getElementById("movieId").value,
        theaterId: document.getElementById("theaterId").value,
        dateTime: document.getElementById("dateTime").value
    });
    await fetch(api + "?" + params, { method: "POST" });
    loadShows();
});

loadShows();
