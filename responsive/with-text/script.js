const video = document.getElementById('myVideo');
const viewport = document.getElementById('video-viewport');

// Function to fetch the focal points text file and parse it
function loadFocalPoints(filePath) {
    return fetch(filePath)
        .then(response => response.text())
        .then(data => {
            const focalPoints = [];
            const lines = data.split('\n');

            lines.forEach(line => {
                line = line.trim();
                if (line) {
                    // Remove the semicolon and split by spaces
                    line = line.replace(';', '');
                    const parts = line.split(',');

                    // Extracting values using regex to handle the format correctly
                    const timestamp = parseFloat(parts[0].match(/^[\d.]+/)[0]);
                    const crop_w = parseInt(parts[0].match(/crop w (\d+)/)[1], 10);
                    const crop_h = parseInt(parts[1].match(/crop h (\d+)/)[1], 10);
                    const crop_x = parseInt(parts[2].match(/crop x (\d+)/)[1], 10);
                    const crop_y = parseInt(parts[3].match(/crop y (\d+)/)[1], 10);

                    // Create an object for each focal point
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
let lastObjectPositionX = null; // Keep track of the last object-position X to smooth transition
let isFullScreenActive = false; // Track whether full-screen mode is active

function smoothTransition(currentX, targetX, duration) {
    const startTime = performance.now();
    function animate() {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1); // Ensure we don't go over 100%
        const newX = lastObjectPositionX + (targetX - lastObjectPositionX) * progress;
        video.style.objectPosition = `${newX}% 0%`;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            lastObjectPositionX = newX; // Finalize position
        }
    }
    requestAnimationFrame(animate);
}

function updateFocalPoint(focalPoints) {
    if (!isFullScreenActive) return; // Only apply cropping in full-screen mode

    const currentTime = video.currentTime;
    const viewportAspect = video.clientWidth / video.clientHeight;
    const videoAspect = video.videoWidth / video.videoHeight;

    if (viewportAspect < videoAspect) {
        focalPoints.forEach(focalPoint => {
            if (focalPoint.timestamp > lastProcessedTime && focalPoint.timestamp <= currentTime) {
                const cropWidth = focalPoint.cropW;
                const cropX = focalPoint.cropX;

                let cropLeft = Math.max(0, Math.min(cropX, video.videoWidth - cropWidth));
                let objectPositionX = (cropLeft / video.videoWidth) * 100;
                
                objectPositionX += 15;    

                if (lastObjectPositionX === null) {
                    lastObjectPositionX = objectPositionX;
                    video.style.objectPosition = `${objectPositionX}% 0%`;
                } else {
                    smoothTransition(lastObjectPositionX, objectPositionX, 200); // Adjust duration as needed
                }
            }
        });

        lastProcessedTime = currentTime;
    } else {
        video.style.objectPosition = '50% 50%';
    }
}

function handleFullscreenChange() {
    isFullScreenActive = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement || // Safari/WebKit full-screen
        document.mozFullScreenElement || // Firefox full-screen
        document.msFullscreenElement // IE/Edge full-screen
    );
    if (!isFullScreenActive) {
        // Reset video position if exiting full-screen mode
        video.style.objectPosition = '50% 50%';
        lastProcessedTime = 0;
        lastObjectPositionX = null;
    }
}

// Add event listener for full-screen changes
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange); // Safari/WebKit
document.addEventListener('mozfullscreenchange', handleFullscreenChange); // Firefox
document.addEventListener('MSFullscreenChange', handleFullscreenChange); // IE/Edge

// Load and parse the focal points, then start handling video events
loadFocalPoints('commands.txt').then(focalPoints => {
    window.addEventListener('resize', () => updateFocalPoint(focalPoints));
    video.addEventListener('loadedmetadata', () => updateFocalPoint(focalPoints));
    video.addEventListener('timeupdate', () => updateFocalPoint(focalPoints));

    updateFocalPoint(focalPoints); // Initial position adjustment
});
