//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.textContent = `Got ${episodeList.length} episode(s)`;
}

window.onload = setup;

const {name,season,number,summary,image}=getOneEpisode()
const mediumSizedImage=image.medium
const paddedSeason=String(season).padStart(2,"0")
const paddedNumber=String(number).padStart(2,"0")
const episodeCode=`S${paddedSeason}E${paddedNumber}`

const episode=document.getElementById("episode").content.cloneNode(true)
episode.querySelector("#name").textContent=name
episode.querySelector("#episode-code").textContent = episodeCode;
episode.querySelector("#image").src = mediumSizedImage;
episode.querySelector("#summary").textContent = summary;
console.log(episode);
