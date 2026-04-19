// You can edit ALL of the code here

const SHOWS_URL = "https://api.tvmaze.com/shows";
const API_CACHE = new Map();

async function setup() {
  let allEpisodes = [];
  let showChangeRequestId = 0;
  const rootElem = document.getElementById("root");
  const controls = createControls();
  const state = {
    searchTerm: "",
    selectedEpisodeCode: "all",
  };

  rootElem.before(controls.container);
  controls.matchCount.textContent = "Loading shows...";
  setEpisodeControlsLoading(controls, true);

  controls.searchInput.addEventListener("input", (event) => {
    state.searchTerm = event.target.value.trim().toLowerCase();
    renderPage(allEpisodes, state, controls.matchCount, rootElem);
  });

  controls.episodeSelect.addEventListener("change", (event) => {
    state.selectedEpisodeCode = event.target.value;
    renderPage(allEpisodes, state, controls.matchCount, rootElem);
  });

  controls.showSelect.addEventListener("change", async (event) => {
    const showId = event.target.value;
    if (!showId) {
      return;
    }

    const currentRequestId = ++showChangeRequestId;

    controls.matchCount.textContent = "Loading episodes...";
    rootElem.replaceChildren();
    setEpisodeControlsLoading(controls, true);

    try {
      const episodes = await fetchEpisodesByShowId(showId);
      if (currentRequestId !== showChangeRequestId) {
        return;
      }

      allEpisodes = episodes;
      state.searchTerm = "";
      controls.searchInput.value = "";
      state.selectedEpisodeCode = "all";
      controls.episodeSelect.value = "all";
      updateEpisodeSelectOptions(controls.episodeSelect, allEpisodes);
      renderPage(allEpisodes, state, controls.matchCount, rootElem);
    } catch (error) {
      console.error("Could not load episodes for selected show", error);
      controls.matchCount.textContent =
        "Could not load episodes for the selected show.";
    } finally {
      setEpisodeControlsLoading(controls, false);
    }
  });

  const initialShowId = await initialiseShows(controls.showSelect);
  if (initialShowId) {
    try {
      allEpisodes = await fetchEpisodesByShowId(initialShowId);
      updateEpisodeSelectOptions(controls.episodeSelect, allEpisodes);
      setEpisodeControlsLoading(controls, false);
    } catch (error) {
      controls.matchCount.textContent =
        "Could not load episodes for the selected show.";
      console.error("Could not load episodes for initial show", error);
      setEpisodeControlsLoading(controls, false);
      return;
    }
  } else {
    controls.matchCount.textContent = "No shows available right now.";
    setEpisodeControlsLoading(controls, false);
    return;
  }

  renderPage(allEpisodes, state, controls.matchCount, rootElem);
}

async function fetchJsonCached(url) {
  if (API_CACHE.has(url)) {
    return API_CACHE.get(url);
  }

  const requestPromise = fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Request failed: ${response.status} ${response.statusText}`,
        );
      }

      return response.json();
    })
    .catch((error) => {
      API_CACHE.delete(url);
      throw error;
    });

  API_CACHE.set(url, requestPromise);
  return requestPromise;
}

async function fetchShows() {
  return fetchJsonCached(SHOWS_URL);
}

async function fetchEpisodesByShowId(showId) {
  return fetchJsonCached(`https://api.tvmaze.com/shows/${showId}/episodes`);
}

async function initialiseShows(showSelect) {
  try {
    const shows = await fetchShows();
    const sortedShows = [...shows].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );

    populateShowSelect(showSelect, sortedShows);
    if (sortedShows.length === 0) {
      return "";
    }

    const firstShowId = String(sortedShows[0].id);
    showSelect.value = firstShowId;
    return firstShowId;
  } catch (error) {
    console.error("Could not load shows", error);
    return "";
  }
}

function populateShowSelect(showSelect, shows) {
  showSelect.replaceChildren();

  for (const show of shows) {
    const option = document.createElement("option");
    option.value = String(show.id);
    option.textContent = show.name;
    showSelect.append(option);
  }
}

function updateEpisodeSelectOptions(episodeSelect, episodes) {
  episodeSelect.replaceChildren();

  const allEpisodesOption = document.createElement("option");
  allEpisodesOption.value = "all";
  allEpisodesOption.textContent = "All episodes";
  episodeSelect.append(allEpisodesOption);

  for (const episode of episodes) {
    const option = document.createElement("option");
    const episodeCode = getEpisodeCode(episode);
    option.value = episodeCode;
    option.textContent = `${episodeCode} - ${episode.name}`;
    episodeSelect.append(option);
  }
}

function setEpisodeControlsLoading(controls, isLoading) {
  controls.searchInput.disabled = isLoading;
  controls.episodeSelect.disabled = isLoading;
}

function createControls() {
  const container = document.createElement("section");
  container.classList.add("controls");

  const showLabel = document.createElement("label");
  showLabel.setAttribute("for", "show-select");
  showLabel.textContent = "Choose show";

  const showSelect = document.createElement("select");
  showSelect.id = "show-select";

  const searchLabel = document.createElement("label");
  searchLabel.setAttribute("for", "episode-search");
  searchLabel.textContent = "Search episodes";

  const searchInput = document.createElement("input");
  searchInput.id = "episode-search";
  searchInput.type = "search";
  searchInput.placeholder = "Search by name or summary";

  const selectLabel = document.createElement("label");
  selectLabel.setAttribute("for", "episode-select");
  selectLabel.textContent = "Jump to episode";

  const episodeSelect = document.createElement("select");
  episodeSelect.id = "episode-select";

  const allEpisodesOption = document.createElement("option");
  allEpisodesOption.value = "all";
  allEpisodesOption.textContent = "All episodes";
  episodeSelect.append(allEpisodesOption);

  const matchCount = document.createElement("p");
  matchCount.classList.add("match-count");

  container.append(
    showLabel,
    showSelect,
    searchLabel,
    searchInput,
    selectLabel,
    episodeSelect,
    matchCount,
  );

  return {
    container,
    showSelect,
    searchInput,
    episodeSelect,
    matchCount,
  };
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
