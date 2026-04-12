// You can edit ALL of the code here

function setup() {
  const allEpisodes = getAllEpisodes();
  const rootElem = document.getElementById("root");
  const controls = createControls(allEpisodes);
  const state = {
    searchTerm: "",
    selectedEpisodeCode: "all",
  };

  rootElem.before(controls.container);

  controls.searchInput.addEventListener("input", (event) => {
    state.searchTerm = event.target.value.trim().toLowerCase();
    renderPage(allEpisodes, state, controls.matchCount, rootElem);
  });

  controls.episodeSelect.addEventListener("change", (event) => {
    state.selectedEpisodeCode = event.target.value;
    renderPage(allEpisodes, state, controls.matchCount, rootElem);
  });

  renderPage(allEpisodes, state, controls.matchCount, rootElem);
}

function createControls(allEpisodes) {
  const container = document.createElement("section");
  container.classList.add("controls");

  const searchLabel = createLabel("episode-search", "Search episodes");

  const searchInput = document.createElement("input");
  searchInput.id = "episode-search";
  searchInput.type = "search";
  searchInput.placeholder = "Search by name or summary";

  const selectLabel = createLabel("episode-select", "Jump to episode");

  const episodeSelect = document.createElement("select");
  episodeSelect.id = "episode-select";

  const allEpisodesOption = document.createElement("option");
  allEpisodesOption.value = "all";
  allEpisodesOption.textContent = "All episodes";
  episodeSelect.append(allEpisodesOption);

  for (const episode of allEpisodes) {
    const option = document.createElement("option");
    const episodeCode = getEpisodeCode(episode);
    option.value = episodeCode;
    option.textContent = `${episodeCode} - ${episode.name}`;
    episodeSelect.append(option);
  }

  const matchCount = document.createElement("p");
  matchCount.classList.add("match-count");

  container.append(
    searchLabel,
    searchInput,
    selectLabel,
    episodeSelect,
    matchCount,
  );

  return {
    container,
    searchInput,
    episodeSelect,
    matchCount,
  };
}

function createLabel(forId, text) {
  const label = document.createElement("label");
  label.setAttribute("for", forId);
  label.textContent = text;
  return label;
}

function renderPage(allEpisodes, state, matchCountElem, rootElem) {
  const filteredEpisodes = allEpisodes.filter((episode) => {
    const matchesSearch = episodeMatchesSearch(episode, state.searchTerm);
    const matchesSelect =
      state.selectedEpisodeCode === "all" ||
      getEpisodeCode(episode) === state.selectedEpisodeCode;

    return matchesSearch && matchesSelect;
  });

  rootElem.replaceChildren();
  for (const episode of filteredEpisodes) {
    const episodeCard = createEpisodeCard(episode);
    rootElem.append(episodeCard);
  }

  matchCountElem.textContent = `Displaying ${filteredEpisodes.length}/${allEpisodes.length} episodes`;
}

function episodeMatchesSearch(episode, searchTerm) {
  if (!searchTerm) {
    return true;
  }

  const name = episode.name.toLowerCase();
  const summary = stripHtml(episode.summary).toLowerCase();

  return name.includes(searchTerm) || summary.includes(searchTerm);
}

function stripHtml(value) {
  const tempElem = document.createElement("div");
  tempElem.innerHTML = value;
  return tempElem.textContent || tempElem.innerText || "";
}

function getEpisodeCode(episode) {
  const seasonNumber = `S${episode.season.toString().padStart(2, "0")}`;
  const episodeNumber = `E${episode.number.toString().padStart(2, "0")}`;
  return `${seasonNumber}${episodeNumber}`;
}

function createEpisodeCard(episode) {
  const { name, summary, image } = episode;
  const episodeCode = getEpisodeCode(episode);

  const episodeTitle = document.createElement("h2");
  episodeTitle.textContent = `${name} - ${episodeCode}`;

  const episodeSummary = document.createElement("p");
  episodeSummary.innerHTML = summary;

  const mediumImage = document.createElement("img");
  mediumImage.src = image?.medium || "";
  mediumImage.alt = `${name} - ${episodeCode}`;

  const episodeContainer = document.createElement("article");
  episodeContainer.id = `episode-${episodeCode.toLowerCase()}`;
  episodeContainer.append(episodeTitle, mediumImage, episodeSummary);
  episodeContainer.classList.add("episode-container");

  return episodeContainer;
}

window.onload = setup;
