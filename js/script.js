const video = document.getElementById("myVideo");
const playPause = document.getElementById("playPause");
const progress = document.getElementById("progress");
const muteBtn = document.getElementById("mute");
const forward = document.getElementById("forward");
const backward = document.getElementById("backward");

// check of video bestaat (voor andere pagina's!)
if (video) {

    // ▶️ play/pause
    playPause.addEventListener("click", () => {
        if (video.paused) {
            video.play();
            playPause.textContent = "⏸";
        } else {
            video.pause();
            playPause.textContent = "▶️";
        }
    });

    // 🔊 mute
    muteBtn.addEventListener("click", () => {
        video.muted = !video.muted;
        muteBtn.textContent = video.muted ? "🔇" : "🔊";
    });

    // ⏩ 10 sec vooruit
    forward.addEventListener("click", () => {
        video.currentTime += 10;
    });

    // ⏪ 10 sec terug
    backward.addEventListener("click", () => {
        video.currentTime -= 10;
    });

    // 📊 progress bar update
    video.addEventListener("timeupdate", () => {
        progress.value = (video.currentTime / video.duration) * 100;
    });

    // 📊 scrubben
    progress.addEventListener("input", () => {
        video.currentTime = (progress.value / 100) * video.duration;
    });

    // 👀 autoplay als zichtbaar
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                video.play();
                playPause.textContent = "⏸";
            } else {
                video.pause();
                playPause.textContent = "▶️";
            }
        });
    }, { threshold: 0.5 });

    observer.observe(video);
}

