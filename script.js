// script.js
import playlist from './playlist.js';

let currentTrack = 0;
let isPlaying = false;

const audio = document.getElementById("player");
const title = document.getElementById("track-title");
const artist = document.getElementById("artist-name");
// const startButton = document.getElementById("start-button");
const moodSelector = document.getElementById("mood-selector");
const backgroundBlur = document.getElementById("background-blur");
const albumCover = document.getElementById("album-cover");
const container = document.getElementById("container");

function generatePlaylistOrder(playlist) {
  const relatedMoods = {
    Chill: ["melancholic", "bluesy"],
    Melancholic: ["chill", "bluesy"],
    Bluesy: ["melancholic", "upbeat"],
    Heavy: ["upbeat"],
    Upbeat: ["heavy", "bluesy"]
  };

  // Calculate similarity score between two tracks
  function similarityScore(trackA, trackB) {
    let score = 0;

    // Same moods (each mood match +3 points)
    for (const moodA of trackA.moods) {
      if (trackB.moods.includes(moodA)) score += 5;
      else if (relatedMoods[moodA] && relatedMoods[moodA].some(rm => trackB.moods.includes(rm))) {
        // Related mood +1 point
        score += 3;
      }
    }

    // Same artist +2 points
    if (trackA.artist === trackB.artist) score += 2;

    // Same album +3 points
    if (trackA.album === trackB.album) score += 3;

    // Same year +1 point
    if (trackA.year === trackB.year) score += 1;

    return score;
  }

  // Pick random start
  const remainingIndices = [...playlist.keys()];
  const order = [];
  const startIndex = remainingIndices.splice(Math.floor(Math.random() * remainingIndices.length), 1)[0];
  order.push(startIndex);

  while (remainingIndices.length > 0) {
    const currentIndex = order[order.length - 1];
    const currentTrack = playlist[currentIndex];

    // Find next track with highest similarity score
    let bestIndex = null;
    let bestScore = -1;
    for (const idx of remainingIndices) {
      const score = similarityScore(currentTrack, playlist[idx]);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = idx;
      }
    }

    // Remove bestIndex from remaining and add to order
    order.push(bestIndex);
    remainingIndices.splice(remainingIndices.indexOf(bestIndex), 1);
  }
  return order;
}

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

function skipTrack() {
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

let clickTimeout = null;

albumCover.addEventListener("click", () => {
  if (clickTimeout) {
    // Double-click detected
    clearTimeout(clickTimeout);
    clickTimeout = null;
    skipTrack();
  } else {
    // Wait to see if it's a double click
    clickTimeout = setTimeout(() => {
      if (!audio.src) return;
      if (audio.paused) {
        audio.play();
        isPlaying = true;
      } else {
        audio.pause();
        isPlaying = false;
      }
      clickTimeout = null;
    }, 250); // double-click window
  }
});

moodSelector.addEventListener("click", (e) => {
  const moodColumn = e.target.closest(".mood-column");
  if (!moodColumn) return;
  const selectedMood = moodColumn.classList[1];
  
  // Filter playlist by the selected mood
  const filteredPlaylist = playlist.filter(track => track.moods.includes(selectedMood));
  
  if (filteredPlaylist.length === 0) {
    alert(`No tracks found for mood: ${selectedMood}`);
    return;
  }

  // Replace playlist with filtered and ordered by similarity
  const order = generatePlaylistOrder(filteredPlaylist);
  const reorderedPlaylist = order.map(i => filteredPlaylist[i]);

  playlist.length = 0;
  playlist.push(...reorderedPlaylist);

  // Hide mood selector and show player container
  moodSelector.style.display = "none";
  container.style.display = "flex";
  backgroundBlur.style.display = "block";

  currentTrack = 0;
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
