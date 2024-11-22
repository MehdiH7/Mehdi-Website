const video = document.getElementById('myVideo');
const viewport = document.getElementById('video-viewport');

// Fetch the focal points
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

function smoothTransition(currentX, targetX, duration) {
    const startTime = performance.now();
    function animate() {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1); // Don't go over 100%
        const newX = lastObjectPositionX + (targetX - lastObjectPositionX) * progress;
        video.style.objectPosition = `${newX}% 0%`;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            lastObjectPositionX = newX; 
        }
    }
    requestAnimationFrame(animate);
}

function updateFocalPoint(focalPoints) {
    const currentTime = video.currentTime;
    const viewportAspect = viewport.clientWidth / viewport.clientHeight;
    const videoAspect = video.videoWidth / video.videoHeight;

    if (viewportAspect < videoAspect) {
        focalPoints.forEach(focalPoint => {
            if (focalPoint.timestamp > lastProcessedTime && focalPoint.timestamp <= currentTime) {
                const cropWidth = focalPoint.cropW;
                const cropX = focalPoint.cropX;

                let cropLeft = Math.max(0, Math.min(cropX, video.videoWidth - cropWidth));
                let objectPositionX = (cropLeft / video.videoWidth) * 100;

                // Add a fixed 10% to the object position
                objectPositionX += 15;

                if (lastObjectPositionX === null) {
                    lastObjectPositionX = objectPositionX;
                    video.style.objectPosition = `${objectPositionX}% 0%`;
                } else {
                    // Smooth transition from last position to new one
                    smoothTransition(lastObjectPositionX, objectPositionX, 200); 
                }
            }
        });

        lastProcessedTime = currentTime;
    } else {
        video.style.objectPosition = '50% 50%';
    }
}

loadFocalPoints('commands.txt').then(focalPoints => {
    window.addEventListener('resize', () => updateFocalPoint(focalPoints));
    video.addEventListener('loadedmetadata', () => updateFocalPoint(focalPoints));
    video.addEventListener('timeupdate', () => updateFocalPoint(focalPoints));

    updateFocalPoint(focalPoints);
});
