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
  episode.querySelector("#summary").innerHTML = summary;
  document.querySelector("#root").appendChild(episode);
}

const allEpisodes = getAllEpisodes();
allEpisodes.map(setup);

//create footer and append to the body
const footer = document.createElement("footer");
footer.innerHTML =
  'Data originally from:<a href="https://www.tvmaze.com/">TVMaze.com</a>';
document.body.append(footer);
