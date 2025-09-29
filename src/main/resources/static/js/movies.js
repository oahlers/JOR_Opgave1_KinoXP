const api = "/api/movies";

async function loadMovies() {
    const res = await fetch(api);
    const movies = await res.json();
    const list = document.getElementById("movieList");
    list.innerHTML = "";
    movies.forEach(m => {
        const li = document.createElement("li");
        li.textContent = `${m.title} (${m.category}, Age: ${m.ageLimit})`;
        list.appendChild(li);
    });
}

document.getElementById("movieForm").addEventListener("submit", async e => {
    e.preventDefault();
    const movie = {
        title: document.getElementById("title").value,
        category: document.getElementById("category").value,
        ageLimit: document.getElementById("ageLimit").value
    };
    await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(movie)
    });
    loadMovies();
});

loadMovies();
