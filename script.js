let currentsong=new Audio();
let songs=[];
let currfolder;
async function getsongs(folder) {
    currfolder=folder;
    let a = await fetch(`http://127.0.0.1:3000/spotify/${folder}/`)
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
     songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3"))
            songs.push(element.href.split(`/${folder}/`)[1])
    }
    // console.log(songs);
    let songul=document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songul.innerHTML=" ";
    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + `<li> 
        
                <img src="./svgs/music.svg" alt="music" width="15px" height="15px">
                <div class="info">
                  <div class="songname"> ${song.replaceAll('-', " ")}</div>
                  <div class="songartist">Girish </div>
                </div>
                <img class="invert" src="./svgs/playsong.svg" alt="play">
               

        </li>`;
       
    }
    playmusic(songs[0].replaceAll('-', " "),true)
   
    //attach an event listner to each song
   Array.from (document.querySelector(".songlist").getElementsByTagName("li")).forEach(element => {
    element.addEventListener("click",e=>{

        // console.log(element.getElementsByClassName("songname")[0].innerHTML)    
        playmusic(element.getElementsByClassName("songname")[0].innerHTML.trim().replaceAll(" ","-"))
    })
   });
   
   
}
function playmusic(track,pause=false){
    currentsong.src=(`/spotify/${currfolder}/`+track).replaceAll(" ","-");
    // console.log(currentsong);
    // let audio=new Audio("/spotify/music/"+track);
    if(!pause){

        currentsong.play();
        play.src="svgs/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML=track
    document.querySelector(".songtime").innerHTML="00:00"

}
function convertToMinutesAndSeconds(totalSeconds) {
    if (isNaN(totalSeconds)) {
        return "00:00"; // Return "00:00" if totalSeconds is NaN
    }
    const minutes = Math.floor(totalSeconds / 60); // Calculate minutes
    const seconds = Math.floor(totalSeconds % 60); // Calculate remaining seconds

    // Format minutes and seconds to always have two digits
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`; // Return formatted time
}

async function displayablums() {
    let a = await fetch(`http://127.0.0.1:3000/spotify/songs`)
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors=div.getElementsByTagName("a")
    let cardConatiner= document.querySelector(".cardConatiner")
    Array.from(anchors).forEach(async(e) => {
        // console.log(e.href)
        if (e.href.includes("/songs/")) {
            let folder=e.href.split("/").slice(-2)[0];
            //get meta data of the folder
           
            let a = await fetch(`http://127.0.0.1:3000/spotify/songs/${folder}/info.json`)
            let response = await a.json();
          console.log(response)
          cardConatiner.innerHTML=cardConatiner.innerHTML+`<div data-folder="cs"  class="card">
                        <img class="play" src="./svgs/play.svg" width="30px" height="30px" alt="play">
                        <img src="./songs/${folder}/cover.jpg" alt="HappyHits">
                        <h2>${response.titel}</h2>
                        <p>${response.discription}</p>
                    </div>`
        }
    });
    
    // console.log(anchors);

}

async function main() {
    displayablums()
     await getsongs("songs/cs");
     playmusic(songs[0].replaceAll('-', " "),true)
     const play=document.getElementById("play");
     //attach event lister to play next and previous
     play.addEventListener("click",()=>{
         if(currentsong.paused){
             currentsong.play();
             play.src="svgs/pause.svg";
         }
         else{
             play.src="svgs/playsong.svg"
             currentsong.pause();
         }
     })
    //listen for the timeupdate event
    currentsong.addEventListener("timeupdate",()=>{
        // console.log(currentsong.currentTime,currentsong.duration)
        document.querySelector(".songtime").innerHTML=(`${convertToMinutesAndSeconds(currentsong.currentTime)} / ${convertToMinutesAndSeconds(currentsong.duration)}`)
        document.querySelector(".circle").style.left=(currentsong.currentTime/currentsong.duration)*100+"%";
    })
    //add eventlistener to seek bar
    document.querySelector(".seekbar").addEventListener("click",(e)=>{
        let percent=(Math.floor((e.offsetX / e.target.getBoundingClientRect().width)*100));
        document.querySelector(".circle").style.left=percent+"%";
        currentsong.currentTime=((currentsong.duration)*percent)/100;
    })
    //add event lsitener to display left in mobile
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left="0";
    })
    //add event lsiter to close the left 
    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left="-110%";
    })
    //add and event lister to previous and next
    previous.addEventListener("click",()=>{
        // console.log("prevsious clicked")
        let index=songs.indexOf(currentsong.src.split("/").slice(-1)[0]);

        if((index-1)>=0){
            playmusic(songs[index-1])
        }
    })
    next.addEventListener("click",()=>{
        currentsong.pause();
        // console.log("nectclicked")
        let index=songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        
     let len=songs.length
        // if((index+1)>length){
        //     playmusic(songs[index+1])
        // }
        if((index+1)<=len-1){
            playmusic(songs[index+1])
        }
    })
    //add an event to voulme
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        // console.log(e.target,e.target.value);
        currentsong.volume=parseInt(e.target.value)/100;
    })
    //play button trasiotn
    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("mouseover", () => {
            card.querySelector(".play").style.bottom = "120px"; // Move .play element up when hovered
        });
    
        card.addEventListener("mouseout", () => {
            card.querySelector(".play").style.bottom = "0px"; // Reset .play element when hover ends
        });
    });
    //load the playlist when the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async (item) => {
            const songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
            // Handle the songs data
        });
    });
    
}
main();