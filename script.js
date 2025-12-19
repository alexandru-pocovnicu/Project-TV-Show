function setup(card) {
  const { name, season, number, summary, image } = card;
  const mediumSizedImage = image?.medium ?? "";
  const paddedSeason = String(season).padStart(2, "0");
  const paddedNumber = String(number).padStart(2, "0");
  const episodeCode = `S${paddedSeason}E${paddedNumber}`;

  const episode = document.getElementById("episode").content.cloneNode(true);

  const section = episode.querySelector("#each-episode");
  section.id = `episode-${episodeCode}`;

  episode.querySelector("#name").textContent = name;
  episode.querySelector("#episode-code").textContent = episodeCode;
  const img = episode.querySelector("#image");
  img.alt = `Image for ${episodeCode}`;

  if (mediumSizedImage) {
    img.src = mediumSizedImage;
  } else {
    img.remove();
  }

  episode.querySelector("#summary").innerHTML = summary ?? "";

  return episode;
}

function loadShows() {
  fetchJsonOnce(SHOWS_URL)
    .then((shows) => {
      state.shows = shows.slice().sort(compareShowNames);
      populateShowSelect();

      const showSelect = document.getElementById("show-select");
      showSelect.value = state.selectedShowId;
      loadEpisodes(state.selectedShowId);
    })
    .catch(() => {
      const showSelect = document.getElementById("show-select");
      showSelect.textContent = "";

      const option = document.createElement("option");
      option.value = "";
      option.textContent = "Failed to load shows";
      showSelect.appendChild(option);
    });
}

const fetchCache = {};

function fetchJsonOnce(url) {
  if (fetchCache[url]) return fetchCache[url];

  fetchCache[url] = fetch(url).then((response) => {
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return response.json();
  });

  return fetchCache[url];
}

// State
const state = {
  shows: [],
  selectedShowId: "82",

  episodes: [],
  searchTerm: "",
  selectedEpisodeId: "",

  loading: true,
  error: null,
};

const SHOWS_URL = "https://api.tvmaze.com/shows";

function loadEpisodes(showId) {
  const episodesUrl = `https://api.tvmaze.com/shows/${showId}/episodes`;

  state.loading = true;
  state.error = null;
  render();

  fetchJsonOnce(episodesUrl)
    .then((episodes) => {
      state.episodes = episodes;
      state.loading = false;

      render();
      populateEpisodeSelect();
    })
    .catch(() => {
      state.loading = false;
      state.error = "Failed to load episodes. Please try again later.";
      render();
    });
}

function formatEpisodeCode(ep) {
  const paddedSeason = String(ep.season).padStart(2, "0");
  const paddedNumber = String(ep.number).padStart(2, "0");
  return `S${paddedSeason}E${paddedNumber}`;
}

function compareShowNames(a, b) {
  return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
}

function populateShowSelect() {
  const showSelect = document.getElementById("show-select");
  showSelect.textContent = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select a show...";
  showSelect.appendChild(placeholder);

  state.shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = String(show.id);
    option.textContent = show.name;
    showSelect.appendChild(option);
  });
}

function populateEpisodeSelect() {
  const select = document.getElementById("episode-select");
  select.textContent = "";

  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "All episodes";
  select.appendChild(allOption);

  state.episodes.forEach((ep) => {
    const option = document.createElement("option");
    const code = formatEpisodeCode(ep);

    option.value = `episode-${code}`;
    option.textContent = `${code} - ${ep.name}`;
    select.appendChild(option);
  });
}

function render() {
  const rootElem = document.querySelector("#root");
  const counterElem = document.querySelector("#counter");
  rootElem.textContent = "";

  if (state.error) {
    rootElem.textContent = state.error;
    if (counterElem) counterElem.textContent = "";
    return;
  }

  if (state.loading) {
    rootElem.textContent = "Loading episodes...";
    if (counterElem) counterElem.textContent = "";
    return;
  }

  // Start from all episodes
  let visibleEpisodes = state.episodes;

  // If an episode is selected, show ONLY that one
  if (state.selectedEpisodeId !== "") {
    visibleEpisodes = visibleEpisodes.filter((ep) => {
      const code = formatEpisodeCode(ep);
      return `episode-${code}` === state.selectedEpisodeId;
    });
  } else {
    // Otherwise apply search filter (name OR summary)
    visibleEpisodes = visibleEpisodes.filter((ep) => {
      const name = ep.name.toLowerCase();
      const summary = (ep.summary ?? "").toLowerCase();
      return (
        name.includes(state.searchTerm) || summary.includes(state.searchTerm)
      );
    });
  }

  if (visibleEpisodes.length === 0) {
    rootElem.textContent = "No episodes found";
    if (counterElem) counterElem.textContent = "";
    return;
  }

  // Update counter
  if (counterElem) {
    counterElem.textContent = `Displaying ${visibleEpisodes.length} episode(s)`;
  }

  // Render cards
  const cards = visibleEpisodes.map(setup);
  rootElem.append(...cards);
}

loadShows();

const searchInput = document.getElementById("search");
searchInput.addEventListener("input", handleSearchInput);

const episodeSelect = document.getElementById("episode-select");
episodeSelect.addEventListener("change", handleEpisodeSelect);

const showSelect = document.getElementById("show-select");
showSelect.addEventListener("change", handleShowSelect);

const showAllBtn = document.getElementById("show-all");
showAllBtn.addEventListener("click", handleShowAll);

function handleShowAll() {
  state.selectedEpisodeId = "";
  state.searchTerm = "";
  episodeSelect.value = ""; // reset dropdown visually
  searchInput.value = ""; // reset search box visually
  render();
}
function handleShowSelect(event) {
  const newShowId = event.target.value;

  if (newShowId === "") return;

  state.selectedShowId = newShowId;

  state.searchTerm = "";
  state.selectedEpisodeId = "";
  searchInput.value = "";
  episodeSelect.value = "";

  loadEpisodes(newShowId);
}

function handleEpisodeSelect(event) {
  state.selectedEpisodeId = event.target.value;

  // Clear search when selecting one episode
  if (state.selectedEpisodeId !== "") {
    state.searchTerm = "";
    searchInput.value = "";
  }

  render();
}

function handleSearchInput(event) {
  state.searchTerm = event.target.value.toLowerCase();

  // If user starts searching, switch back to "all episodes" mode
  state.selectedEpisodeId = "";
  episodeSelect.value = "";

  render();
}

//create footer and append to the body
const footer = document.createElement("footer");
footer.innerHTML =
  'Data originally from:<a href="https://www.tvmaze.com/">TVMaze.com</a>';
document.body.append(footer);
