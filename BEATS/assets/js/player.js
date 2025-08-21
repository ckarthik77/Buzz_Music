// Import Howler.js for better audio handling
import { Howl, Howler } from 'howler';

// DOM Elements
const elements = {
    audioPlayer: document.getElementById('audioPlayer'),
    playPauseBtn: document.getElementById('playPauseBtn'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    shuffleBtn: document.getElementById('shuffleBtn'),
    repeatBtn: document.getElementById('repeatBtn'),
    muteBtn: document.getElementById('muteBtn'),
    progressBar: document.getElementById('progressBar'),
    currentTimeEl: document.getElementById('currentTime'),
    durationEl: document.getElementById('duration'),
    volumeControl: document.getElementById('volumeControl'),
    songImg: document.getElementById('songImg'),
    backgroundImage: document.getElementById('backgroundImage'),
    songTitle: document.getElementById('songTitle'),
    songArtist: document.getElementById('songArtist'),
    albumName: document.getElementById('albumName'),
    songYear: document.getElementById('songYear'),
    playlistEl: document.getElementById('playlist'),
    playlistCount: document.getElementById('playlistCount'),
    searchInput: document.getElementById('searchInput'),
    addSongsBtn: document.getElementById('addSongsBtn'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    toast: document.getElementById('toast'),
    visualizer: document.getElementById('visualizer'),
};

// Initialize player state
const state = {
    songs: [],
    filteredSongs: [],
    currentSongIndex: 0,
    originalSongIndex: 0, // To track position in original playlist when shuffling
    isPlaying: false,
    isMuted: false,
    isShuffled: false,
    repeatMode: false, // false, 'all', or 'one'
    volume: 0.8,
    lastVolume: 0.8,
    audioContext: null,
    analyser: null,
    dataArray: null,
    animationFrameId: null,
    currentHowl: null,
    shuffledSongs: [], // Store the shuffled playlist
    lastPlaybackPosition: 0, // For resuming playback
};

// Initialize player
async function initPlayer() {
    try {
        showLoading(true, 'Loading your music...');
        
        // Load songs from JSON
        const response = await fetch('../../assets/data/songs.json');
        const data = await response.json();
        
        // Process songs data
        state.songs = data.songs.map((song, index) => ({
            ...song,
            id: song.id || `song-${index + 1}`,
            year: song.year || new Date().getFullYear(),
            duration: 0, // Will be updated when loaded
            howl: null, // Will store Howl instance
        }));
        
        state.filteredSongs = [...state.songs];
        
        // Initialize audio context for visualizer
        initAudioContext();
        
        // Render playlist
        renderPlaylist();
        
        // Load first song if available
        if (state.songs.length > 0) {
            await loadSong(0);
        }
        
        // Set up event listeners
        setupEventListeners();
        
        // Update UI
        updatePlaylistCount();
        showLoading(false);
        
        // Show welcome message
        showToast('Welcome to BEATS Music Player');
        
    } catch (error) {
        console.error('Error initializing player:', error);
        showToast('Failed to initialize player', 'error');
        showLoading(false);
    }
}

// Initialize audio context for visualizer
function initAudioContext() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        state.audioContext = new AudioContext();
        
        // Create analyser node
        state.analyser = state.audioContext.createAnalyser();
        state.analyser.fftSize = 256;
        
        const bufferLength = state.analyser.frequencyBinCount;
        state.dataArray = new Uint8Array(bufferLength);
        
        // Start visualizer
        if (elements.visualizer) {
            drawVisualizer();
        }
    } catch (error) {
        console.warn('Web Audio API not supported in this browser', error);
    }
}

// Draw audio visualizer
function drawVisualizer() {
    if (!state.analyser || !elements.visualizer) {
        state.animationFrameId = requestAnimationFrame(drawVisualizer);
        return;
    }
    
    const canvas = elements.visualizer;
    const ctx = canvas.getContext('2d');
    const WIDTH = canvas.width = canvas.offsetWidth;
    const HEIGHT = canvas.height = canvas.offsetHeight;
    
    state.analyser.getByteFrequencyData(state.dataArray);
    
    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    // Draw bars
    const barWidth = (WIDTH / state.dataArray.length) * 2.5;
    let x = 0;
    
    for (let i = 0; i < state.dataArray.length; i++) {
        const barHeight = (state.dataArray[i] / 255) * HEIGHT * 0.6;
        
        const hue = 120 + (i / state.dataArray.length) * 60;
        ctx.fillStyle = `hsla(${hue}, 80%, 50%, 0.8)`;
        
        const barY = HEIGHT - barHeight;
        ctx.fillRect(x, barY, barWidth - 1, barHeight);
        
        x += barWidth + 1;
    }
    
    state.animationFrameId = requestAnimationFrame(drawVisualizer);
}

// Show loading overlay
function showLoading(show, message = 'Loading...') {
    if (!elements.loadingOverlay) return;
    
    if (show) {
        elements.loadingOverlay.style.display = 'flex';
        elements.loadingOverlay.querySelector('p').textContent = message;
    } else {
        elements.loadingOverlay.style.display = 'none';
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = elements.toast;
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.style.display = 'none';
            toast.style.opacity = '1';
        }, 300);
    }, 3000);
}

// Update playlist count
function updatePlaylistCount() {
    if (!elements.playlistCount) return;
    const count = state.filteredSongs.length;
    elements.playlistCount.textContent = `${count} ${count === 1 ? 'song' : 'songs'}`;
}

// Set up event listeners
function setupEventListeners() {
    const { 
        playPauseBtn, prevBtn, nextBtn, progressBar, 
        volumeControl, searchInput, shuffleBtn, 
        repeatBtn, muteBtn, addSongsBtn 
    } = elements;
    
    // Play/Pause
    playPauseBtn.addEventListener('click', togglePlay);
    
    // Previous/Next
    prevBtn.addEventListener('click', playPrevious);
    nextBtn.addEventListener('click', playNext);
    
    // Progress bar
    progressBar.addEventListener('input', updateProgress);
    progressBar.addEventListener('change', seek);
    
    // Volume control
    volumeControl.addEventListener('input', setVolume);
    
    // Shuffle/Repeat
    if (shuffleBtn) shuffleBtn.addEventListener('click', toggleShuffle);
    if (repeatBtn) repeatBtn.addEventListener('click', toggleRepeat);
    
    // Mute
    if (muteBtn) muteBtn.addEventListener('click', toggleMute);
    
    // Search
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    // Add songs
    if (addSongsBtn) {
        addSongsBtn.addEventListener('click', handleAddSongs);
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyDown);
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
    
    // Handle drag and drop for song files
    setupDragAndDrop();
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle window resize
function handleResize() {
    if (elements.visualizer) {
        const canvas = elements.visualizer;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
}

// Toggle play/pause
function togglePlay() {
    if (state.currentHowl) {
        if (state.currentHowl.playing()) {
            state.currentHowl.pause();
            state.isPlaying = false;
            updatePlayPauseButton();
        } else {
            // Resume audio context if it was suspended
            if (state.audioContext && state.audioContext.state === 'suspended') {
                state.audioContext.resume();
            }
            state.currentHowl.play();
            state.isPlaying = true;
            updatePlayPauseButton();
        }
    } else if (state.songs.length > 0) {
        loadSong(state.currentSongIndex);
    }
}

// Play previous song
function playPrevious() {
    if (state.songs.length === 0) return;
    
    // If we're more than 3 seconds into the song, go to the beginning
    if (state.currentHowl && state.currentHowl.seek() > 3) {
        state.currentHowl.seek(0);
        showToast('Restarted current song');
        return;
    }
    
    let prevIndex;
    let prevSong;
    
    if (state.isShuffled && state.shuffledSongs?.length > 0) {
        // Get previous song in shuffled playlist
        prevIndex = (state.currentSongIndex - 1 + state.shuffledSongs.length) % state.shuffledSongs.length;
        prevSong = state.shuffledSongs[prevIndex];
        const originalIndex = state.songs.findIndex(song => song.id === prevSong.id);
        
        if (originalIndex !== -1) {
            loadSong(originalIndex);
        } else {
            // Fallback to sequential if song not found
            prevIndex = (state.currentSongIndex - 1 + state.songs.length) % state.songs.length;
            loadSong(prevIndex);
        }
    } else {
        // Normal sequential playback
        prevIndex = (state.currentSongIndex - 1 + state.songs.length) % state.songs.length;
        
        // Handle beginning of playlist
        if (prevIndex === state.songs.length - 1 && state.repeatMode !== 'all') {
            // Already at the beginning, just restart the current song
            if (state.currentHowl) {
                state.currentHowl.seek(0);
                showToast('Beginning of playlist');
            }
            return;
        }
        
        loadSong(prevIndex);
    }
    
    // Update the original song index when in shuffle mode
    if (state.isShuffled && prevSong) {
        state.originalSongIndex = state.songs.findIndex(song => song.id === prevSong.id);
    }
}

// Play next song
function playNext(manual = true) {
    if (state.songs.length === 0) return;
    
    // If repeat one is on and this was a manual next, just restart the current song
    if (state.repeatMode === 'one' && manual) {
        if (state.currentHowl) {
            state.currentHowl.seek(0);
            state.currentHowl.play();
            showToast('Repeating current song');
        }
        return;
    }
    
    let nextIndex;
    let nextSong;
    
    if (state.isShuffled && state.shuffledSongs?.length > 0) {
        // Get next song in shuffled playlist
        nextIndex = (state.currentSongIndex + 1) % state.shuffledSongs.length;
        nextSong = state.shuffledSongs[nextIndex];
        const originalIndex = state.songs.findIndex(song => song.id === nextSong.id);
        
        if (originalIndex !== -1) {
            loadSong(originalIndex);
        } else {
            // Fallback to sequential if song not found
            nextIndex = (state.currentSongIndex + 1) % state.songs.length;
            loadSong(nextIndex);
        }
    } else {
        // Normal sequential playback
        nextIndex = (state.currentSongIndex + 1) % state.songs.length;
        
        // Handle end of playlist
        if (nextIndex === 0 && state.repeatMode !== 'all') {
            // End of playlist, stop playing if not repeating all
            if (state.currentHowl) {
                state.currentHowl.stop();
                state.isPlaying = false;
                updatePlayPauseButton();
                showToast('End of playlist');
            }
            return;
        }
        
        loadSong(nextIndex);
    }
    
    // Update the original song index when in shuffle mode
    if (state.isShuffled && nextSong) {
        state.originalSongIndex = state.songs.findIndex(song => song.id === nextSong.id);
    }
}

// Update progress bar
function updateProgress() {
    if (!state.currentHowl) return;
    
    const seek = state.currentHowl.seek() || 0;
    const duration = state.currentHowl.duration() || 1;
    
    // Update progress bar
    const progressPercent = (seek / duration) * 100;
    elements.progressBar.value = progressPercent;
    
    // Update time display
    elements.currentTimeEl.textContent = formatTime(seek);
    elements.durationEl.textContent = formatTime(duration);
    
    // Continue updating if playing
    if (state.isPlaying) {
        requestAnimationFrame(updateProgress);
    }
}

// Seek to position in song
function seek() {
    if (!state.currentHowl) return;
    
    const seekTo = (elements.progressBar.value / 100) * state.currentHowl.duration();
    state.currentHowl.seek(seekTo);
    updateProgress();
}

// Set volume
function setVolume() {
    const volume = parseFloat(elements.volumeControl.value);
    state.volume = volume;
    
    if (state.currentHowl) {
        state.currentHowl.volume(volume);
    }
    
    // Update mute state if volume is 0
    if (volume === 0) {
        state.isMuted = true;
        updateMuteButton();
    } else if (state.isMuted) {
        state.isMuted = false;
        updateMuteButton();
    }
}

// Toggle mute
function toggleMute() {
    state.isMuted = !state.isMuted;
    
    if (state.currentHowl) {
        if (state.isMuted) {
            state.lastVolume = state.currentHowl.volume();
            state.currentHowl.volume(0);
            elements.volumeControl.value = 0;
        } else {
            const volume = state.lastVolume > 0 ? state.lastVolume : 0.8;
            state.currentHowl.volume(volume);
            elements.volumeControl.value = volume;
        }
    }
    
    updateMuteButton();
}

// Toggle shuffle
function toggleShuffle() {
    state.isShuffled = !state.isShuffled;
    const shuffleBtn = elements.shuffleBtn;
    
    if (shuffleBtn) {
        if (state.isShuffled) {
            // Enable shuffle
            shuffleBtn.classList.add('active');
            shuffleBtn.title = 'Shuffle On';
            
            // Create and save shuffled playlist
            state.shuffledSongs = [...state.songs];
            const currentSong = state.songs[state.currentSongIndex];
            
            // Keep current song first in shuffled list
            const currentIndex = state.shuffledSongs.findIndex(song => song.id === currentSong.id);
            if (currentIndex > -1) {
                state.shuffledSongs.splice(currentIndex, 1);
            }
            
            shuffleArray(state.shuffledSongs);
            state.shuffledSongs.unshift(currentSong);
            state.originalSongIndex = state.currentSongIndex;
            state.currentSongIndex = 0;
            
            showToast('Shuffle: On');
        } else {
            // Disable shuffle
            shuffleBtn.classList.remove('active');
            shuffleBtn.title = 'Shuffle Off';
            
            // Restore original position
            if (typeof state.originalSongIndex !== 'undefined') {
                state.currentSongIndex = state.originalSongIndex;
            }
            
            showToast('Shuffle: Off');
        }
        
        updateActiveSong();
    }
}

// Toggle repeat
function toggleRepeat() {
    const repeatBtn = elements.repeatBtn;
    if (!repeatBtn) return;
    
    // Cycle through repeat modes: off → all → one → off
    if (!state.repeatMode) {
        // Turn on repeat all
        state.repeatMode = 'all';
        repeatBtn.classList.add('active');
        repeatBtn.title = 'Repeat All';
        repeatBtn.innerHTML = '<i class="fas fa-redo"></i>';
        showToast('Repeat: All');
    } else if (state.repeatMode === 'all') {
        // Switch to repeat one
        state.repeatMode = 'one';
        repeatBtn.classList.add('active');
        repeatBtn.title = 'Repeat One';
        repeatBtn.innerHTML = '<i class="fas fa-redo" style="font-size: 0.8em; font-weight: bold;">1</i>';
        showToast('Repeat: One');
    } else {
        // Turn off repeat
        state.repeatMode = false;
        repeatBtn.classList.remove('active');
        repeatBtn.title = 'Repeat Off';
        repeatBtn.innerHTML = '<i class="fas fa-redo"></i>';
        showToast('Repeat: Off');
    }
}

// Helper function to shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Format time (seconds to MM:SS)
function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const minutes = Math.floor(Math.abs(seconds) / 60);
    const remainingSeconds = Math.floor(Math.abs(seconds) % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Update play/pause button state
function updatePlayPauseButton() {
    const icon = elements.playPauseBtn.querySelector('i');
    if (state.isPlaying) {
        elements.playPauseBtn.setAttribute('aria-label', 'Pause');
        icon.classList.remove('fa-play');
        icon.classList.add('fa-pause');
    } else {
        elements.playPauseBtn.setAttribute('aria-label', 'Play');
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
    }
}

// Update mute button state
function updateMuteButton() {
    const icon = elements.muteBtn.querySelector('i');
    if (state.isMuted) {
        elements.muteBtn.setAttribute('aria-label', 'Unmute');
        icon.className = 'fas fa-volume-mute';
    } else {
        elements.muteBtn.setAttribute('aria-label', 'Mute');
        icon.className = 'fas fa-volume-up';
    }
}
    
// Load a song
function loadSong(index) {
    if (index < 0 || index >= state.songs.length) return;
    
    const song = state.songs[index];
    state.currentSongIndex = index;
    
    // Update UI
    elements.songImg.src = song.cover;
    songTitle.textContent = song.title;
    songArtist.textContent = song.artist;
    
    // Update audio source
    audioPlayer.src = song.file;
    
    // Update active state in playlist
    updateActiveSong();
    
    // If already playing, play the new song
    if (state.isPlaying) {
        state.currentHowl.play();
    }
    
    // Update UI
    updateSongInfo(song);
    updateActiveSong();
}

// Update song info in the UI
function updateSongInfo(song) {
    elements.songTitle.textContent = song.title || 'Unknown Title';
    elements.songArtist.textContent = song.artist || 'Unknown Artist';
    elements.songAlbum.textContent = song.album || 'Unknown Album';
    
    // Update year and genre
    elements.songYear.textContent = song.year ? `Released: ${song.year}` : 'Unknown Year';
    elements.songGenre.textContent = song.genre || 'Unknown Genre';
    
    // Update duration
    if (song.duration) {
        const minutes = Math.floor(song.duration / 60);
        const seconds = song.duration % 60;
        elements.songDuration.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
        elements.songDuration.textContent = '0:00';
    }
    
    // Update album art and background
    if (song.cover) {
        elements.songImg.src = song.cover;
        elements.backgroundImage.src = song.cover;
        elements.songImg.alt = `${song.title} - Album Art`;
    } else {
        // Set default cover if none provided
        elements.songImg.src = '../../assets/img/album-covers/default.jpg';
        elements.backgroundImage.src = '../../assets/img/default-bg.jpg';
        elements.songImg.alt = 'Default Album Art';
    }
}

// Update active song in playlist
function updateActiveSong() {
    const items = elements.playlistEl?.querySelectorAll('.playlist-item');
    if (!items) return;
    
    items.forEach((item, index) => {
        if (index === state.currentSongIndex) {
            item.classList.add('active');
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            item.classList.remove('active');
        }
    });
}

// Handle search
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    
    if (!query) {
        state.filteredSongs = [...state.songs];
    } else {
        state.filteredSongs = state.songs.filter(song => 
            song.title.toLowerCase().includes(query) ||
            song.artist.toLowerCase().includes(query) ||
            (song.album && song.album.toLowerCase().includes(query))
        );
    }
    
    // Reset current index if it's out of bounds
    if (state.currentSongIndex >= state.filteredSongs.length) {
        state.currentSongIndex = Math.max(0, state.filteredSongs.length - 1);
    }
    
    renderPlaylist();
}

// Initialize the player when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set up theme toggle
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle?.querySelector('i');
    
    // Function to update theme icon based on current theme
    const updateThemeIcon = (theme) => {
        if (!themeIcon) return;
        if (theme === 'dark') {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            themeToggle.setAttribute('aria-label', 'Switch to light theme');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            themeToggle.setAttribute('aria-label', 'Switch to dark theme');
        }
    };

    // Toggle theme function
    const toggleTheme = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Update theme
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update icon and aria-label
        updateThemeIcon(newTheme);
        
        // Dispatch custom event for any other components that need to know about theme changes
        document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme } }));
    };

    // Set up theme toggle button
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Load saved theme or use preferred color scheme
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('theme') || 
        (prefersDarkScheme.matches ? 'dark' : 'light');
    
    // Apply saved theme
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // Listen for system theme changes
    prefersDarkScheme.addListener((e) => {
        if (!localStorage.getItem('theme')) { // Only if user hasn't set a preference
            const newTheme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            updateThemeIcon(newTheme);
        }
    });

    // Initialize the player
    initPlayer();

    // Set up service worker for PWA support
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('ServiceWorker registration successful');
            }).catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }

    // Add keyboard navigation for player controls
    document.addEventListener('keydown', (e) => {
        // Prevent default behavior for space key when focused on player controls
        if (e.code === 'Space' && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            togglePlay();
        }
    });
});

// Show loading state
function showLoading(show, message = 'Loading...') {
    const loadingEl = document.getElementById('loadingOverlay');
    if (!loadingEl) return;
    
    if (show) {
        loadingEl.style.display = 'flex';
        loadingEl.querySelector('p').textContent = message;
    } else {
        loadingEl.style.display = 'none';
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const toastEl = document.getElementById('toast');
    if (!toastEl) return;
    
    toastEl.textContent = message;
    toastEl.className = `toast ${type}`;
    toastEl.style.display = 'block';
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        toastEl.style.opacity = '0';
        setTimeout(() => {
            toastEl.style.display = 'none';
            toastEl.style.opacity = '1';
        }, 300);
    }, 3000);
}
