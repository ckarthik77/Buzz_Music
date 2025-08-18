// DOM Elements
const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const volumeControl = document.getElementById('volumeControl');
const songImg = document.getElementById('songImg');
const songTitle = document.getElementById('songTitle');
const songArtist = document.getElementById('songArtist');
const playlistEl = document.getElementById('playlist');
const searchInput = document.getElementById('searchInput');

// Player state
let songs = [];
let currentSongIndex = 0;
let isPlaying = false;

// Initialize player
async function initPlayer() {
    try {
        // Load songs from JSON
        const response = await fetch('../../assets/data/songs.json');
        const data = await response.json();
        songs = data.songs;
        
        // Render playlist
        renderPlaylist(songs);
        
        // Load first song
        if (songs.length > 0) {
            loadSong(0);
        }
        
        // Set up event listeners
        setupEventListeners();
    } catch (error) {
        console.error('Error initializing player:', error);
    }
}

// Set up event listeners
function setupEventListeners() {
    // Play/Pause
    playPauseBtn.addEventListener('click', togglePlay);
    
    // Previous/Next
    prevBtn.addEventListener('click', playPrevious);
    nextBtn.addEventListener('click', playNext);
    
    // Progress bar
    audioPlayer.addEventListener('timeupdate', updateProgress);
    progressBar.addEventListener('input', setProgress);
    
    // Volume control
    volumeControl.addEventListener('input', setVolume);
    
    // Song ended
    audioPlayer.addEventListener('ended', playNext);
    
    // Search
    searchInput.addEventListener('input', handleSearch);
}

// Load a song
function loadSong(index) {
    if (index < 0 || index >= songs.length) return;
    
    const song = songs[index];
    currentSongIndex = index;
    
    // Update UI
    songImg.src = song.cover;
    songTitle.textContent = song.title;
    songArtist.textContent = song.artist;
    
    // Update audio source
    audioPlayer.src = song.file;
    
    // Update active state in playlist
    updateActiveSong();
    
    // If already playing, play the new song
    if (isPlaying) {
        audioPlayer.play()
            .catch(error => console.error('Error playing song:', error));
    }
}

// Toggle play/pause
function togglePlay() {
    if (audioPlayer.paused) {
        audioPlayer.play()
            .then(() => {
                isPlaying = true;
                playPauseBtn.textContent = '⏸';
            })
            .catch(error => console.error('Error playing song:', error));
    } else {
        audioPlayer.pause();
        isPlaying = false;
        playPauseBtn.textContent = '▶';
    }
}

// Play previous song
function playPrevious() {
    loadSong((currentSongIndex - 1 + songs.length) % songs.length);
    if (isPlaying) audioPlayer.play();
}

// Play next song
function playNext() {
    loadSong((currentSongIndex + 1) % songs.length);
    if (isPlaying) audioPlayer.play();
}

// Update progress bar
function updateProgress() {
    const { currentTime, duration } = audioPlayer;
    const progressPercent = (currentTime / duration) * 100;
    progressBar.value = isNaN(progressPercent) ? 0 : progressPercent;
    
    // Update time display
    currentTimeEl.textContent = formatTime(currentTime);
    durationEl.textContent = formatTime(duration);
}

// Set progress
function setProgress() {
    const progress = (progressBar.value / 100) * audioPlayer.duration;
    audioPlayer.currentTime = progress;
}

// Set volume
function setVolume() {
    audioPlayer.volume = volumeControl.value;
}

// Format time (seconds to MM:SS)
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Render playlist
function renderPlaylist(songsToRender) {
    playlistEl.innerHTML = '';
    
    songsToRender.forEach((song, index) => {
        const songEl = document.createElement('div');
        songEl.className = 'playlist-item';
        songEl.innerHTML = `
            <img src="${song.cover}" alt="${song.title}">
            <div class="song-details">
                <h3>${song.title}</h3>
                <p>${song.artist}</p>
            </div>
        `;
        
        songEl.addEventListener('click', () => {
            loadSong(index);
            if (!isPlaying) togglePlay();
        });
        
        playlistEl.appendChild(songEl);
    });
}

// Update active song in playlist
function updateActiveSong() {
    const playlistItems = document.querySelectorAll('.playlist-item');
    playlistItems.forEach((item, index) => {
        if (index === currentSongIndex) {
            item.classList.add('playing');
        } else {
            item.classList.remove('playing');
        }
    });
    
    // Scroll to active song
    const activeItem = document.querySelector('.playlist-item.playing');
    if (activeItem) {
        activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Handle search
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filteredSongs = songs.filter(song => 
        song.title.toLowerCase().includes(searchTerm) || 
        song.artist.toLowerCase().includes(searchTerm)
    );
    
    renderPlaylist(filteredSongs);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
    } else if (e.code === 'ArrowRight') {
        audioPlayer.currentTime = Math.min(audioPlayer.currentTime + 5, audioPlayer.duration);
    } else if (e.code === 'ArrowLeft') {
        audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 5);
    } else if (e.code === 'ArrowUp') {
        volumeControl.value = Math.min(1, parseFloat(volumeControl.value) + 0.1);
        setVolume();
    } else if (e.code === 'ArrowDown') {
        volumeControl.value = Math.max(0, parseFloat(volumeControl.value) - 0.1);
        setVolume();
    }
});

// Initialize the player when the DOM is loaded
document.addEventListener('DOMContentLoaded', initPlayer);
