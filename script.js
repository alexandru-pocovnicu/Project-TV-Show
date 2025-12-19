function setup(card) {
  //extracts the variables name, season, number, summary, image from episodes.js
  const { name, season, number, summary, image } = card;
  const mediumSizedImage = image.medium;
  const paddedSeason = String(season).padStart(2, "0");
  const paddedNumber = String(number).padStart(2, "0");
  const episodeCode = `S${paddedSeason}E${paddedNumber}`;

  //cloned the html template, update template content and updates it to the DOM
  const episode = document.getElementById("episode").content.cloneNode(true);

  const section = episode.querySelector("#each-episode");
  section.id = `episode-${episodeCode}`;

  episode.querySelector("#name").textContent = name;
  episode.querySelector("#episode-code").textContent = episodeCode;
  episode.querySelector("#image").src = mediumSizedImage;
  episode.querySelector("#image").alt = `Image for ${episodeCode}`;
  episode.querySelector("#summary").innerHTML = summary;

  return episode;
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
  selectedShowId: "",

  episodes: [],
  searchTerm: "",
  selectedEpisodeId: "",

  loading: true,
  error: null,
};

fetch("https://api.tvmaze.com/shows/82/episodes")
  .then((response) => {
    if (!response.ok) throw new Error("Error");
    return response.json();
  })
  .then((data) => {
    state.episodes = data;
    state.loading = false;
    render();
    populateEpisodeSelect();
  })
  .catch((err) => {
    state.loading = false;
    state.error = "Failed to load episodes. Please try again later.";
    render();
  });

function formatEpisodeCode(ep) {
  const paddedSeason = String(ep.season).padStart(2, "0");
  const paddedNumber = String(ep.number).padStart(2, "0");
  return `S${paddedSeason}E${paddedNumber}`;
}

function populateEpisodeSelect() {
  const select = document.getElementById("episode-select");

  // Clear existing options
  select.textContent = "";

  // First option = reset
  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "All episodes";
  select.appendChild(allOption);

  // Add one option per episode
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
      const summary = ep.summary.toLowerCase();
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

// First render when the page loads
render();

// Populate episode select dropdown
populateEpisodeSelect();

// Get search input and listen to input event
const searchInput = document.getElementById("search");
searchInput.addEventListener("input", handleSearchInput);

const episodeSelect = document.getElementById("episode-select");
episodeSelect.addEventListener("change", handleEpisodeSelect);

const showAllBtn = document.getElementById("show-all");
showAllBtn.addEventListener("click", handleShowAll);

function handleShowAll() {
  state.selectedEpisodeId = "";
  state.searchTerm = "";
  episodeSelect.value = ""; // reset dropdown visually
  searchInput.value = ""; // reset search box visually
  render();
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
