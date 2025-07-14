// script.js
import playlist from './playlist.js';

let currentTrack = 0;
let isPlaying = false;

const audio = document.getElementById("player");
const title = document.getElementById("track-title");
const artist = document.getElementById("artist-name");
const startButton = document.getElementById("start-button");
const backgroundBlur = document.getElementById("background-blur");
const albumCover = document.getElementById("album-cover");
const container = document.getElementById("container");

function shufflePlaylist(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function loadTrack(index) {
  if (index >= playlist.length) {
    title.textContent = "No more tracks.";
    backgroundBlur.src = "";
    albumCover.src = "";
    return;
  }

  const track = playlist[index];
  audio.src = track.url;
  title.textContent = track.title;
  artist.textContent = track.artist;
  backgroundBlur.src = track.cover;
  albumCover.src = track.cover;

  audio.load();
  audio.play().then(() => {
    isPlaying = true;
  }).catch(err => console.warn("Autoplay blocked:", err));
}

function checkNearEnd() {
  if (audio.duration - audio.currentTime < 5) {
    audio.removeEventListener("timeupdate", checkNearEnd);
    audio.addEventListener("ended", handleTrackEnd, { once: true });
  }
}

function handleTrackEnd() {
  currentTrack++;
  if (currentTrack < playlist.length) {
    loadTrack(currentTrack);
    audio.addEventListener("timeupdate", checkNearEnd);
  } else {
    title.textContent = "All tracks finished.";
    backgroundBlur.src = "";
    albumCover.src = "";
    isPlaying = false;
  }
}

albumCover.addEventListener("click", () => {
  if (!audio.src) return;
  if (audio.paused) {
    audio.play();
    isPlaying = true;
  } else {
    audio.pause();
    isPlaying = false;
  }
});

startButton.addEventListener("click", () => {
  startButton.style.display = "none";
  container.style.display = "flex";
  backgroundBlur.style.display = "block";

  shufflePlaylist(playlist);
  loadTrack(currentTrack);
  audio.addEventListener("timeupdate", checkNearEnd);
});

const elapsedEl = document.getElementById("elapsed");
const durationEl = document.getElementById("duration");

function formatTime(seconds) {
  const min = Math.floor(seconds / 60) || 0;
  const sec = Math.floor(seconds % 60) || 0;
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

audio.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
  elapsedEl.textContent = formatTime(audio.currentTime);
});
