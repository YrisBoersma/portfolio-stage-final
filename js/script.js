const mediaElement = document.getElementById("myVideo");
const playPause = document.getElementById("playPause");
const progress = document.getElementById("progress");
const muteBtn = document.getElementById("mute");
const forward = document.getElementById("forward");
const backward = document.getElementById("backward");

if (mediaElement && playPause && progress && muteBtn && forward && backward) {
    const isNativeVideo = mediaElement.tagName === "VIDEO";
    const youtubeId = mediaElement.dataset.youtubeId;

    const setupControls = (api) => {
        const togglePlayPause = () => {
            if (api.isPaused()) {
                api.play();
                playPause.textContent = "⏸";
            } else {
                api.pause();
                playPause.textContent = "▶️";
            }
        };

        playPause.addEventListener("click", togglePlayPause);

        muteBtn.addEventListener("click", () => {
            api.toggleMute();
            muteBtn.textContent = api.isMuted() ? "🔇" : "🔊";
        });

        forward.addEventListener("click", () => {
            api.seekBy(10);
        });

        backward.addEventListener("click", () => {
            api.seekBy(-10);
        });

        api.onTimeUpdate((current, duration) => {
            if (duration > 0) {
                progress.value = String((current / duration) * 100);
            }
        });

        progress.addEventListener("input", () => {
            const duration = api.getDuration();
            if (duration > 0) {
                api.seekTo((Number(progress.value) / 100) * duration);
            }
        });

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        api.play();
                        playPause.textContent = "⏸";
                    } else {
                        api.pause();
                        playPause.textContent = "▶️";
                    }
                });
            },
            { threshold: 0.5 }
        );

        observer.observe(mediaElement);
    };

    if (isNativeVideo) {
        const video = mediaElement;

        const api = {
            play: () => video.play().catch(() => {}),
            pause: () => video.pause(),
            isPaused: () => video.paused,
            toggleMute: () => {
                video.muted = !video.muted;
            },
            isMuted: () => video.muted,
            seekBy: (seconds) => {
                const duration = Number.isFinite(video.duration) ? video.duration : Infinity;
                const target = Math.max(0, Math.min(duration, video.currentTime + seconds));
                video.currentTime = target;
            },
            seekTo: (time) => {
                video.currentTime = time;
            },
            getDuration: () => (Number.isFinite(video.duration) ? video.duration : 0),
            onTimeUpdate: (cb) => {
                video.addEventListener("timeupdate", () => cb(video.currentTime, video.duration || 0));
            },
        };

        video.addEventListener("click", () => {
            if (video.paused) {
                video.play().catch(() => {});
                playPause.textContent = "⏸";
            } else {
                video.pause();
                playPause.textContent = "▶️";
            }
        });

        setupControls(api);
    } else if (youtubeId) {
        const loadYouTubeApi = () => {
            if (window.YT && window.YT.Player) {
                return Promise.resolve();
            }

            return new Promise((resolve) => {
                const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
                if (!existing) {
                    const tag = document.createElement("script");
                    tag.src = "https://www.youtube.com/iframe_api";
                    document.head.appendChild(tag);
                }

                const previousReady = window.onYouTubeIframeAPIReady;
                window.onYouTubeIframeAPIReady = () => {
                    if (typeof previousReady === "function") {
                        previousReady();
                    }
                    resolve();
                };
            });
        };

        loadYouTubeApi().then(() => {
            let player;

            const api = {
                play: () => {
                    if (player) {
                        player.playVideo();
                    }
                },
                pause: () => {
                    if (player) {
                        player.pauseVideo();
                    }
                },
                isPaused: () => {
                    if (!player) {
                        return true;
                    }
                    const state = player.getPlayerState();
                    return state !== window.YT.PlayerState.PLAYING;
                },
                toggleMute: () => {
                    if (!player) {
                        return;
                    }
                    if (player.isMuted()) {
                        player.unMute();
                    } else {
                        player.mute();
                    }
                },
                isMuted: () => (player ? player.isMuted() : true),
                seekBy: (seconds) => {
                    if (!player) {
                        return;
                    }
                    const current = player.getCurrentTime() || 0;
                    const duration = player.getDuration() || 0;
                    const target = Math.max(0, Math.min(duration || Infinity, current + seconds));
                    player.seekTo(target, true);
                },
                seekTo: (time) => {
                    if (player) {
                        player.seekTo(time, true);
                    }
                },
                getDuration: () => (player ? player.getDuration() || 0 : 0),
                onTimeUpdate: (cb) => {
                    setInterval(() => {
                        if (!player || typeof player.getCurrentTime !== "function") {
                            return;
                        }
                        cb(player.getCurrentTime() || 0, player.getDuration() || 0);
                    }, 250);
                },
            };

            player = new window.YT.Player("myVideo", {
                videoId: youtubeId,
                playerVars: {
                    controls: 0,
                    rel: 0,
                    modestbranding: 1,
                    playsinline: 1,
                    iv_load_policy: 3,
                },
                events: {
                    onReady: () => {
                        player.unMute();
                        muteBtn.textContent = player.isMuted() ? "🔇" : "🔊";
                        setupControls(api);
                    },
                },
            });
        });
    }
}
