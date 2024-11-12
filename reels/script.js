// Array of video URLs and titles
const videos = [
    {
        url: "https://tv2news.video-output.eu-north-1-prod.vmnd.tv/6736fcc7-8214-4126-83ff-3afa4d33a1da/hls/2_b609724b-f24c-49fe-a89a-100c8e77b285_20271585_200.m3u8",
        title: "Amazing Landscape"
    },
    {
        url: "https://tv2news.video-output.eu-north-1-prod.vmnd.tv/4360272e-3833-446d-8086-1f2e3c71089e/hls/1_38821221-4833-4885-881c-2af14e1c3ace_20271584.m3u8",
        title: "Wildlife Safari"
    },
    {
        url: "https://tv2news.video-output.eu-north-1-prod.vmnd.tv/667785f4-b328-4708-83c1-6b07edc1d389/hls/2_e6023c00-f964-4c58-b0b8-03ea6100cfda_20271608.m3u8",
        title: "City Life Vibes"
    }
];

let currentVideoIndex = 0;
const videoElement = document.getElementById("reel-video");
const videoContainer = document.getElementById("video-container");
const progressBar = document.getElementById("progress-bar");
const videoTitle = document.getElementById("video-title");

let startY = 0;
let isScrolling = false; 


function loadVideo(video) {
    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(video.url);
        hls.attachMedia(videoElement);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            videoElement.play();
            videoTitle.textContent = video.title; 
        });

        videoElement.addEventListener("timeupdate", updateProgressBar);

        videoElement.addEventListener("ended", playNextVideoWithSlide);
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        videoElement.src = video.url;
        videoElement.addEventListener("loadedmetadata", function() {
            videoElement.play();
            videoTitle.textContent = video.title; 
        });

        videoElement.addEventListener("timeupdate", updateProgressBar);

        videoElement.addEventListener("ended", playNextVideoWithSlide);
    }
}

function playNextVideoWithSlide() {
    slideVideo("up");
    setTimeout(() => {
        currentVideoIndex = (currentVideoIndex + 1) % videos.length;
        loadVideo(videos[currentVideoIndex]);
    }, 600);
}

function playPreviousVideoWithSlide() {
    slideVideo("down");
    setTimeout(() => {
        currentVideoIndex = (currentVideoIndex - 1 + videos.length) % videos.length;
        loadVideo(videos[currentVideoIndex]);
    }, 600);
}


function slideVideo(direction) {
    videoContainer.style.transform = direction === "up" ? "translateY(-100%)" : "translateY(100%)";
    setTimeout(() => {
        videoContainer.style.transition = "none"; 
        videoContainer.style.transform = "translateY(0)";
        setTimeout(() => videoContainer.style.transition = "transform 0.6s ease-in-out"); 
    }, 600);
}

function updateProgressBar() {
    const progress = (videoElement.currentTime / videoElement.duration) * 100;
    progressBar.style.width = `${progress}%`;
}

videoContainer.addEventListener("touchstart", (e) => {
    startY = e.touches[0].clientY;
});

videoContainer.addEventListener("touchend", (e) => {
    const endY = e.changedTouches[0].clientY;
    if (startY - endY > 50) {
        playNextVideoWithSlide(); 
    } else if (endY - startY > 50) {
        playPreviousVideoWithSlide(); 
    }
});

window.addEventListener("wheel", (e) => {
    if (!isScrolling) {
        if (e.deltaY > 0) {
            playNextVideoWithSlide(); 
        } else if (e.deltaY < 0) {
            playPreviousVideoWithSlide(); 
        }
        isScrolling = true; 
        setTimeout(() => isScrolling = false, 800); 
    }
});

loadVideo(videos[currentVideoIndex]);