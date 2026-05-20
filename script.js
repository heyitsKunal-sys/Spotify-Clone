// 1. Core Audio Variables
const audioPlayer = new Audio();
let currentPlayingButton = null; // Tracks the playing icon button inside the left sidebar <li>

// Paths to your exact media icons based on your HTML layout
const PLAY_ICON = "icons/play.png";   // Icon for the list items
const PAUSE_ICON = "icons/pause.png"; // Icon for the list items

const MASTER_PLAY_SVG = "images/play.svg";   // Play SVG for bottom bar
const MASTER_PAUSE_SVG = "images/pause.svg"; // Pause SVG for bottom bar

document.addEventListener("DOMContentLoaded", () => {
    // Left Library elements
    const playButtons = document.querySelectorAll('.song-List ul li .icon');
    const songListItems = document.querySelectorAll('.song-List ul li');

    // Bottom Playbar elements matching your specific HTML layout
    const masterPlay = document.getElementById('play');
    const prevBtn = document.getElementById('previous');
    const nextBtn = document.getElementById('next');
    
    const songInfoDisplay = document.querySelector('.songinfo');
    const songTimeDisplay = document.querySelector('.songtime');
    const seekbar = document.querySelector('.seekbar');
    const seekCircle = document.querySelector('.circle');
    const volumeSlider = document.querySelector('.range input');

 
    function formatTime(seconds) {
        if (isNaN(seconds)) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }


    function playSong(liElement, clickedButton) {
        const songSource = liElement.getAttribute('data-src');
        
        // Extract song title and artist from the list item text contents
        const title = liElement.querySelector('h3').textContent;
        const artist = liElement.querySelector('p').textContent;

        if (currentPlayingButton === clickedButton) {
            if (audioPlayer.paused) {
                audioPlayer.play().then(() => {
                    clickedButton.src = PAUSE_ICON;
                    masterPlay.src = MASTER_PAUSE_SVG;
                });
            } else {
                audioPlayer.pause();
                clickedButton.src = PLAY_ICON;
                masterPlay.src = MASTER_PLAY_SVG;
            }
        } else {
            // Revert old active sidebar button back to static play state
            if (currentPlayingButton) {
                currentPlayingButton.src = PLAY_ICON;
            }

            // Load new song and inject data details down onto the display container
            audioPlayer.src = songSource;
            songInfoDisplay.innerHTML = `<strong>${title}</strong> - ${artist}`;
            
            audioPlayer.play().then(() => {
                clickedButton.src = PAUSE_ICON;
                masterPlay.src = MASTER_PAUSE_SVG;
                currentPlayingButton = clickedButton;
            }).catch(err => console.error("Playback interrupted:", err));
        }
    }

  
    playButtons.forEach(button => {
        button.style.cursor = "pointer";
        button.addEventListener('click', function() {
            const parentLi = this.closest('li');
            playSong(parentLi, this);
        });
    });

  
    masterPlay.style.cursor = "pointer";
    masterPlay.addEventListener('click', () => {
        // Fallback: If no track has been picked yet, run the first library track
        if (!audioPlayer.src && songListItems.length > 0) {
            const firstLi = songListItems[0];
            const firstBtn = firstLi.querySelector('.icon');
            playSong(firstLi, firstBtn);
            return;
        }

        if (audioPlayer.paused) {
            audioPlayer.play();
            masterPlay.src = MASTER_PAUSE_SVG;
            if (currentPlayingButton) currentPlayingButton.src = PAUSE_ICON;
        } else {
            audioPlayer.pause();
            masterPlay.src = MASTER_PLAY_SVG;
            if (currentPlayingButton) currentPlayingButton.src = PLAY_ICON;
        }
    });

  
    function changeTrack(direction) {
        if (!currentPlayingButton) return;

        const currentLi = currentPlayingButton.closest('li');
        let targetLi;

        if (direction === 'next') {
            targetLi = currentLi.nextElementSibling;
            if (!targetLi) targetLi = songListItems[0]; // Wrap back to beginning
        } else if (direction === 'prev') {
            targetLi = currentLi.previousElementSibling;
            if (!targetLi) targetLi = songListItems[songListItems.length - 1]; // Wrap to absolute end
        }

        if (targetLi) {
            const targetBtn = targetLi.querySelector('.icon');
            playSong(targetLi, targetBtn);
        }
    }

    prevBtn.style.cursor = "pointer";
    nextBtn.style.cursor = "pointer";
    prevBtn.addEventListener('click', () => changeTrack('prev'));
    nextBtn.addEventListener('click', () => changeTrack('next'));
    audioPlayer.addEventListener('ended', () => changeTrack('next'));

  
    audioPlayer.addEventListener('timeupdate', () => {
        // Update the textual running time label (e.g., 01:23 / 03:45)
        songTimeDisplay.textContent = `${formatTime(audioPlayer.currentTime)} / ${formatTime(audioPlayer.duration)}`;
        
        // Linearly scale percentage marker calculation
        const progressPercentage = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        if (!isNaN(progressPercentage)) {
            seekCircle.style.left = `${progressPercentage}%`;
        }
    });

    // Let user tap custom track coordinates anywhere on the timeline to hop to that time
    seekbar.style.cursor = "pointer";
    seekbar.addEventListener('click', (e) => {
        // Obtain total visual pixel bounding width profile 
        const seekbarWidth = seekbar.getBoundingClientRect().width;
        const clickPositionOffset = e.offsetX;
        
        // Evaluate the calculated horizontal percentage placement 
        const targetPercentage = clickPositionOffset / seekbarWidth;
        audioPlayer.currentTime = targetPercentage * audioPlayer.duration;
    });

   
    if (volumeSlider) {
        // Force audio engine initialization defaults to match the input slider value
        audioPlayer.volume = volumeSlider.value / 100;

        volumeSlider.addEventListener('input', (e) => {
            audioPlayer.volume = e.target.value / 100;
        });
    }
});
