function setup(card) {
  //extracts the variables name, season, number, summary, image from episodes.js
  const { name, season, number, summary, image } = card;
  const mediumSizedImage = image.medium;
  const paddedSeason = String(season).padStart(2, "0");
  const paddedNumber = String(number).padStart(2, "0");
  const episodeCode = `S${paddedSeason}E${paddedNumber}`;

  //cloned the html template, update template content and updates it to the DOM
  const episode = document.getElementById("episode").content.cloneNode(true);
  episode.querySelector("#name").textContent = name;
  episode.querySelector("#episode-code").textContent = episodeCode;
  episode.querySelector("#image").src = mediumSizedImage;
  episode.querySelector("#image").alt = `Image for ${episodeCode}`;
  episode.querySelector("#summary").innerHTML = summary;

  return episode;
}

// State
const state = {
  episodes: getAllEpisodes(),
  searchTerm: "",
};

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

    option.value = ep.id;
    option.textContent = `${code} - ${ep.name}`;

    select.appendChild(option);
  });
}

function render() {
  const rootElem = document.querySelector("#root");
  rootElem.textContent = "";
  const counterElem = document.querySelector("#counter");

  // Filter episodes based on state.searchTerm
  const filtered = state.episodes.filter((ep) => {
    const name = ep.name.toLowerCase();
    const summary = ep.summary.toLowerCase();
    return (
      name.includes(state.searchTerm) || summary.includes(state.searchTerm)
    );
  });

  // Update counter
  if (counterElem) {
    counterElem.textContent = `Displaying ${filtered.length} episode(s)`;
  }

  // Create cards only from filtered episodes
  const cards = filtered.map(setup);
  rootElem.append(...cards);
}

// First render when the page loads
render();

// Populate episode select dropdown
populateEpisodeSelect();

// Get search input and listen to input event
const searchInput = document.getElementById("search");

searchInput.addEventListener("input", handleSearchInput);

function handleSearchInput(event) {
  state.searchTerm = event.target.value.toLowerCase();
  render();
}

//create footer and append to the body
const footer = document.createElement("footer");
footer.innerHTML =
  'Data originally from:<a href="https://www.tvmaze.com/">TVMaze.com</a>';
document.body.append(footer);

//TEST - delete later
console.log("Total episodes:", state.episodes.length);
