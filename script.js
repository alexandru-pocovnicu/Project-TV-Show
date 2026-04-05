//You can edit ALL of the code here



function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
  
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  for(let episode of episodeList){
    let {name,number,season,summary,image}=episode
    let seasonNumber=`S${season.toString().padStart(2,"0")}`
    let episodeNumber=`E${number.toString().padStart(2,"0")}`
    let episodeCode=seasonNumber+episodeNumber
    let mediumImage=image.medium
    console.log(episodeCode);
    
  }
}

window.onload = setup;
