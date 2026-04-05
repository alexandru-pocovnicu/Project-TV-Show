//You can edit ALL of the code here

function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  for (let episode of episodeList) {
    let episodeCard = createEpisodeCard(episode);
    rootElem.append(episodeCard);
  }
}

function createEpisodeCard(episode) {
  let { name, number, season, summary, image } = episode;

  let seasonNumber = `S${season.toString().padStart(2, "0")}`;
  let episodeNumber = `E${number.toString().padStart(2, "0")}`;
  let episodeCode = seasonNumber + episodeNumber;
  let episodeTitle = document.createElement("h2");
  episodeTitle.textContent = `${name}-${episodeCode}`;

  let episodeSummary=document.createElement("p")
  episodeSummary.innerHTML=summary

  let mediumImage =document.createElement("img")
  mediumImage.src=image.medium;
  mediumImage.alt = `${name}-${episodeCode}`;

  let episodeContainer=document.createElement("div")
  episodeContainer.append(episodeTitle, mediumImage, episodeSummary);

  return episodeContainer
}

window.onload = setup;
