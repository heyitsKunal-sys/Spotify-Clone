// setting up the shared memory (variable)
// When building a music player, the browser needs to remember things globally across your whole script. For example, if you click "Pause" at the bottom bar, JavaScript needs to talk to the same audio player that started the song from the sidebar list.To do this, we create our global state at the very top of our script.js file.

// Create the virtual music player machine
const audioPlayer = new Audio()
// Create an empty box to remember which sidebar button is currently playing
let currentPlayingButton = null;


document.addEventListener("DOMContentLoaded", () => {
    const playButtons = document.querySelectorAll('.song-List ul li .icon');
    const songListItems = document.querySelectorAll('.song-List ul li');
    const masterPlay = document.getElementById('play');
    const prevBtn = document.getElementById('previous');
    const nextBtn = document.getElementById('next');
    const songInfoDisplay = document.querySelector('.songinfo');
    const songTimeDisplay = document.querySelector('.songtime');
    const volumeSlider = document.querySelector('.range input');
    
    const seekbar = document.querySelector('.seekbar');
    const seekCircle = document.querySelector('.circle');

    // Utility: convert seconds to 00:00 format
    function formatTime(seconds) {
        if (isNaN(seconds)) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    }
    function playSong(liElement, clickedButton) {
        const songSource = liElement.getAttribute('data-src');
        const title = liElement.querySelector('h3').textContent;
        const artist = liElement.querySelector('p').textContent;
        if (currentPlayingButton === clickedButton) {
            if (audioPlayer.paused) {
                audioPlayer.play().then(() => {
                    clickedButton.src = "icons/pause.png";
                    masterPlay.src = "images/pause.svg";
                });
            } else {
                audioPlayer.pause();
                clickedButton.src = "icons/play.png";
                masterPlay.src = "images/play.svg";
            }

        }
        else {
            // If another song was playing before, change its small icon back to play
            if (currentPlayingButton) {
                currentPlayingButton.src = "icons/play.png";
            }

            // Load the new track file into our music machine
            audioPlayer.src = songSource;

            // Update the text box at the bottom bar to show what is playing
            songInfoDisplay.innerHTML = `<strong>${title}</strong> - ${artist}`;

            // Play the audio and sync both the small button and bottom bar button
            audioPlayer.play().then(() => {
                clickedButton.src = "icons/pause.png";
                masterPlay.src = "images/pause.svg";

                // Update our global tracker box to remember this active button!
                currentPlayingButton = clickedButton;
            }).catch(err => console.error("Error starting playback:", err));
        }
    }
    playButtons.forEach(button => {

        button.style.cursor = "pointer";


        button.addEventListener('click', function () {

            const parentLi = this.closest('li');


            playSong(parentLi, this);
        });
    });
    masterPlay.style.cursor = "pointer";
    masterPlay.addEventListener('click', () => {
        if (!audioPlayer.src && songListItems.length > 0) {
            const firstLi = songListItems[0];
            const firstBtn = firstLi.querySelector('.icon');
            playSong(firstLi, firstBtn);
            return; // Exit early since we just started a song
        }
        if (audioPlayer.paused) {
            audioPlayer.play();
            masterPlay.src = "images/pause.svg";
            if (currentPlayingButton) currentPlayingButton.src = "icons/pause.png";
        } else {
            audioPlayer.pause();
            masterPlay.src = "images/play.svg";
            if (currentPlayingButton) currentPlayingButton.src = "icons/play.png";
        }
    });
    function changeTrack(direction) {
        if (!currentPlayingButton) return;
        const currentLi = currentPlayingButton.closest('li');
        let targetLi;

        if (direction === 'next') {
            targetLi = currentLi.nextElementSibiling;
            if (!targetLi) targetLi = songListItems[0];

        } else if (direction === 'prev') {
            targetLi = currentLi.previousElementSibiling;
            if (!targetLi) targetLi = songListItems[songListItems.length - 1];

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
    audioPlayer.addEventListener('ended', () => {
        changeTrack('next');
    });
    audioPlayer.addEventListener('timeupdate', () => {
        songTimeDisplay.textContent = `${formatTime(audioPlayer.currentTime)} / ${formatTime(audioPlayer.duration)}`;
        const progressPercentage = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        if (!isNaN(progressPercentage)) {
            seekCircle.style.left = `${progressPercentage}%`;
        }
    })
    seekbar.style.cursor = "pointer";
    seekbar.addEventListener('click', (e) => {

        const seekbarWidth = seekbar.getBoundingClientRect().width;

        const clickPositionOffset = e.offsetX;

        const targetPercentage = clickPositionOffset / seekbarWidth;

        audioPlayer.currentTime = targetPercentage * audioPlayer.duration;
    });

    if (volumeSlider) {

        audioPlayer.volume = volumeSlider.value / 100;


        volumeSlider.addEventListener('input', (e) => {
            // Convert a scale of 0-100 down to a scale of 0.0-1.0
            audioPlayer.volume = e.target.value / 100;
        });
    }




    console.log("The HTML is fully loaded and ready!");
});
