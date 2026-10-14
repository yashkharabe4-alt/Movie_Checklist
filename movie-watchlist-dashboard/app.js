const storageKey = "movie-watch-list";
const sampleMovies = [
  { id: 1, title: "Interstellar", year: "2014", genre: "Sci-fi", status: "watched" },
  { id: 2, title: "The Dark Knight", year: "2008", genre: "Action", status: "to-watch" },
  { id: 3, title: "Spirited Away", year: "2001", genre: "Animation", status: "to-watch" },
  { id: 4, title: "The Shawshank Redemption", year: "1994", genre: "Drama", status: "watched" }
];

let movies = JSON.parse(localStorage.getItem(storageKey)) || sampleMovies;
const list = document.querySelector("#movie-list");
const emptyState = document.querySelector("#empty-state");
const dialog = document.querySelector("#movie-dialog");
const form = document.querySelector("#movie-form");

function saveMovies() { localStorage.setItem(storageKey, JSON.stringify(movies)); }
function safeText(value) { return String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]); }

function render() {
  const query = document.querySelector("#search").value.trim().toLowerCase();
  const filter = document.querySelector("#filter-status").value;
  const visibleMovies = movies.filter(movie => (filter === "all" || movie.status === filter) && `${movie.title} ${movie.genre} ${movie.year}`.toLowerCase().includes(query));
  const watched = movies.filter(movie => movie.status === "watched").length;
  document.querySelector("#total-count").textContent = movies.length;
  document.querySelector("#watchlist-count").textContent = movies.length - watched;
  document.querySelector("#watched-count").textContent = watched;
  document.querySelector("#completion-rate").textContent = movies.length ? `${Math.round((watched / movies.length) * 100)}%` : "0%";
  document.querySelector("#result-count").textContent = `${visibleMovies.length} ${visibleMovies.length === 1 ? "movie" : "movies"}`;
  list.innerHTML = visibleMovies.map(movie => `
    <article class="movie-card">
      <span class="tag ${movie.status}">${movie.status === "watched" ? "Watched" : "To watch"}</span>
      <button class="delete-button" data-action="delete" data-id="${movie.id}" aria-label="Delete ${safeText(movie.title)}">×</button>
      <h3>${safeText(movie.title)}</h3><p>${safeText(movie.genre || "No genre")} · ${safeText(movie.year || "Year unknown")}</p>
      <div class="card-actions"><span></span><button class="toggle-button" data-action="toggle" data-id="${movie.id}">${movie.status === "watched" ? "Mark unwatched" : "Mark watched"}</button></div>
    </article>`).join("");
  emptyState.hidden = visibleMovies.length !== 0;
}

document.querySelector("#show-form").addEventListener("click", () => dialog.showModal());
document.querySelector("#close-form").addEventListener("click", () => dialog.close());
document.querySelector("#cancel-form").addEventListener("click", () => dialog.close());
document.querySelector("#search").addEventListener("input", render);
document.querySelector("#filter-status").addEventListener("change", render);
document.querySelector("#clear-filters").addEventListener("click", () => { document.querySelector("#search").value = ""; document.querySelector("#filter-status").value = "all"; render(); });
form.addEventListener("submit", event => { event.preventDefault(); const values = Object.fromEntries(new FormData(form)); movies.unshift({ id: Date.now(), ...values }); saveMovies(); form.reset(); dialog.close(); render(); });
list.addEventListener("click", event => { const button = event.target.closest("button[data-action]"); if (!button) return; const id = Number(button.dataset.id); if (button.dataset.action === "delete") movies = movies.filter(movie => movie.id !== id); else movies = movies.map(movie => movie.id === id ? { ...movie, status: movie.status === "watched" ? "to-watch" : "watched" } : movie); saveMovies(); render(); });
render();
