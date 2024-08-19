const viewport = document.getElementById('video-viewport');

// Initialize Video.js player
const player = videojs('myVideo', {
    autoplay: true,
    controls: true,
    loop: true,
    preload: 'auto',
    fluid: true,
    playsinline: true,
    nativeControlsForTouch: false,
});

player.ready(function() {
    console.log('Player is ready');

    const videoElement = player.el().querySelector('.vjs-tech');

    videoElement.style.objectFit = 'cover';
    videoElement.style.objectPosition = 'center';

    loadFocalPoints('commands.txt').then(focalPoints => {
        updateFocalPoint(focalPoints);
        
        window.addEventListener('resize', () => updateFocalPoint(focalPoints));
        player.on('loadedmetadata', () => updateFocalPoint(focalPoints));
        player.on('timeupdate', () => updateFocalPoint(focalPoints));
        
        setInterval(() => updateFocalPoint(focalPoints), 50);
    });
});

function loadFocalPoints(filePath) {
    return fetch(filePath)
        .then(response => response.text())
        .then(data => {
            const focalPoints = [];
            const lines = data.split('\n');

            lines.forEach(line => {
                line = line.trim();
                if (line) {
                    line = line.replace(';', '');
                    const parts = line.split(',');

                    const timestamp = parseFloat(parts[0].match(/^[\d.]+/)[0]);
                    const crop_w = parseInt(parts[0].match(/crop w (\d+)/)[1], 10);
                    const crop_h = parseInt(parts[1].match(/crop h (\d+)/)[1], 10);
                    const crop_x = parseInt(parts[2].match(/crop x (\d+)/)[1], 10);
                    const crop_y = parseInt(parts[3].match(/crop y (\d+)/)[1], 10);

                    // Object for each focal point
                    focalPoints.push({
                        timestamp: timestamp,
                        cropW: crop_w,
                        cropH: crop_h,
                        cropX: crop_x,
                        cropY: crop_y
                    });
                }
            });

            return focalPoints;
        });
}

let lastProcessedTime = 0;
let lastObjectPositionX = null;
let targetObjectPositionX = null;
let isTransitioning = false;

function smoothTransition(currentX, targetX, duration) {
    if (isTransitioning) return;
    
    isTransitioning = true;

    const stepCount = Math.ceil(duration / 16);
    const stepSize = (targetX - currentX) / stepCount;
    let step = 0;

    function animate() {
        if (step <= stepCount) {
            const videoElement = player.el().querySelector('.vjs-tech');
            lastObjectPositionX = currentX + step * stepSize;
            videoElement.style.objectPosition = `${lastObjectPositionX}% 0%`;
            step++;
            requestAnimationFrame(animate);
        } else {
            isTransitioning = false;
            lastObjectPositionX = targetX;
        }
    }
    animate();
}

function updateFocalPoint(focalPoints) {
    const currentTime = player.currentTime();
    const viewportAspect = viewport.clientWidth / viewport.clientHeight;
    const videoAspect = player.videoWidth() / player.videoHeight();

    if (viewportAspect < videoAspect) {
        focalPoints.forEach(focalPoint => {
            if (focalPoint.timestamp > lastProcessedTime && focalPoint.timestamp <= currentTime) {

                const cropWidth = focalPoint.cropW;
                const cropX = focalPoint.cropX;

                let cropLeft = Math.max(0, Math.min(cropX, player.videoWidth() - cropWidth));
                let objectPositionX = (cropLeft / player.videoWidth()) * 100;

                objectPositionX += 15;

                if (lastObjectPositionX === null) {
                    lastObjectPositionX = objectPositionX;
                    targetObjectPositionX = objectPositionX;
                    const videoElement = player.el().querySelector('.vjs-tech');
                    videoElement.style.objectPosition = `${objectPositionX}% 0%`;
                } else if (targetObjectPositionX !== objectPositionX) {
                    targetObjectPositionX = objectPositionX;
                    smoothTransition(lastObjectPositionX, objectPositionX, 500);
                }
            }
        });

        lastProcessedTime = currentTime;
    } else {
        const videoElement = player.el().querySelector('.vjs-tech');
        videoElement.style.objectPosition = '50% 50%';
    }
}

window.addEventListener('orientationchange', function() {
    if (window.matchMedia("(orientation: portrait)").matches) {
        // Handle portrait orientation
        player.requestFullscreen();
    } else if (window.matchMedia("(orientation: landscape)").matches) {
        // Handle landscape orientation
        player.exitFullscreen();
    }
});
