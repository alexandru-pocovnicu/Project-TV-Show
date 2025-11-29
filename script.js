//You can edit ALL of the code here
// function setup() {
//   const allEpisodes = getAllEpisodes();
//   makePageForEpisodes(allEpisodes);
// }

function makePageForEpisodes(episodeList) {
   const rootElem = document.getElementById("root");
   rootElem.textContent = `Got ${episodeList.length} episode(s)`;
}

window.onload = setup;

function setup(card){
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
episode.querySelector("#summary").textContent = summary;
document.querySelector("body").appendChild(episode)
console.log(summary);

}
const allEpisodes=getAllEpisodes()
allEpisodes.map(setup)
