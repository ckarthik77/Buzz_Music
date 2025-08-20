// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Hide loading screen after content is loaded
    const loadingScreen = document.getElementById('loadingScreen');
    
    // Simulate loading time (you can remove this in production)
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        
        // Remove loading screen from DOM after animation completes
        loadingScreen.addEventListener('transitionend', () => {
            loadingScreen.style.display = 'none';
        });
    }, 1500);

    // Music player functionality
    const audio = document.querySelector('audio');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const progressBar = document.getElementById('progressBar');
    const currentTimeEl = document.getElementById('currentTime');
    const durationEl = document.getElementById('duration');

    // Update progress bar as the audio plays
    audio.addEventListener('timeupdate', updateProgress);

    // Update duration display
    audio.addEventListener('loadedmetadata', () => {
        durationEl.textContent = formatTime(audio.duration);
    });

    // Play/Pause functionality
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', togglePlayPause);
    }

    // Click on progress bar to seek
    if (progressBar) {
        progressBar.addEventListener('click', setProgress);
    }

    // Format time in minutes:seconds
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        seconds = Math.floor(seconds % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    // Update progress bar
    function updateProgress() {
        const percent = (audio.currentTime / audio.duration) * 100;
        progressBar.value = percent;
        currentTimeEl.textContent = formatTime(audio.currentTime);
    }

    // Set progress bar on click
    function setProgress(e) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        audio.currentTime = (clickX / width) * duration;
    }

    // Toggle play/pause
    function togglePlayPause() {
        if (audio.paused) {
            audio.play();
            playPauseBtn.textContent = '❚❚';
        } else {
            audio.pause();
            playPauseBtn.textContent = '►';
        }
    }
});

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});
