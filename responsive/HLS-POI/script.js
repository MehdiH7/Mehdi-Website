const viewport = document.getElementById('video-viewport');

const player = videojs('myVideo', {
    autoplay: 'muted', 
    controls: true, 
    loop: false,
    preload: 'auto', 
    fluid: true, 
    playsinline: true, 
    fullscreen: {
        options: {
            navigationUI: 'hide' 
        }
    },
    preferFullWindow: true, 
});

player.ready(function() {
    console.log('Player is ready');

    const videoElement = player.el().querySelector('.vjs-tech');

    videoElement.style.objectFit = 'cover';
    videoElement.style.objectPosition = 'center';

    // Get the video source URL
    const videoSourceUrl = player.src();
    console.log('Video Source URL:', videoSourceUrl);

    // Parse the video source URL to build the GET request URL
    const getRequestUrl = buildGetRequestUrl(videoSourceUrl);
    console.log('Constructed GET Request URL:', getRequestUrl);

    // Fetch the focal points via GET request
    fetchFocalPoints(getRequestUrl)
        .then(focalPoints => {
            console.log('Focal points loaded:', focalPoints);

            updateFocalPoint(focalPoints);
            
            window.addEventListener('resize', () => updateFocalPoint(focalPoints));
            player.on('loadedmetadata', () => {
                console.log('Video metadata loaded:', {
                    videoWidth: player.videoWidth(),
                    videoHeight: player.videoHeight()
                });
                updateFocalPoint(focalPoints);
            });
            player.on('timeupdate', () => updateFocalPoint(focalPoints));

            setInterval(() => updateFocalPoint(focalPoints), 50);
        })
        .catch(error => {
            console.error('Error loading focal points:', error);
        });
});

function buildGetRequestUrl(videoSourceUrl) {
    const urlParts = videoSourceUrl.split('/');
    const videoIdPart = urlParts[urlParts.length - 2]; 
    const [demoCode, firstFrame, lastFrame] = videoIdPart.split(':');

    const firstFrameCalculated = Math.floor(parseInt(firstFrame) * 0.025);
    const lastFrameCalculated = Math.floor(parseInt(lastFrame) * 0.025);

    const getRequestUrl = `https://fieldvision.forzify.com/v1/poi/demo/${demoCode}?firstFrame=${firstFrameCalculated}&lastFrame=${lastFrameCalculated}`;
    
    return getRequestUrl;
}

function fetchFocalPoints(url) {
    console.log('Fetching focal points from URL:', url);
    
    return fetch(url, {
        headers: {
            'Authorization': 'Basic ACCESSTOKEN', 
            'Accept': 'application/json'
        }
    })
    .then(response => {
        console.log('Response received:', response);
        return response.json();
    })
    .then(data => {
        console.log('Data parsed:', data);
        const focalPoints = data.map(item => ({
            cropX: item.x 
        }));
        return focalPoints;
    })
    .catch(error => {
        console.error('Error fetching or parsing focal points:', error);
        throw error;
    });
}

let lastProcessedFrame = 0;
let focalPointIndex = 0; 
let lastObjectPositionX = null;
let isTransitioning = false;

function smoothTransition(currentX, targetX, duration) {
    if (isTransitioning) return;
    
    isTransitioning = true;
    console.log(`Starting smooth transition from ${currentX}% to ${targetX}% over ${duration}ms`);

    const stepCount = Math.ceil(duration / 16);
    const stepSize = (targetX - currentX) / stepCount;
    let step = 0;

    function animate() {
        if (step <= stepCount) {
            const videoElement = player.el().querySelector('.vjs-tech');
            lastObjectPositionX = currentX + step * stepSize;
            console.log(`Transition step ${step}: Object position X = ${lastObjectPositionX}%`);
            videoElement.style.objectPosition = `${lastObjectPositionX}% 0%`; 
            step++;
            requestAnimationFrame(animate);
        } else {
            isTransitioning = false;
            lastObjectPositionX = targetX;
            console.log('Transition complete. Final object position X =', lastObjectPositionX);
        }
    }
    animate();
}

function updateFocalPoint(focalPoints) {
    const currentTime = player.currentTime();
    const currentFrame = Math.floor(currentTime * 25);
    const viewportAspect = viewport.clientWidth / viewport.clientHeight;
    const videoAspect = player.videoWidth() / player.videoHeight();

    console.log(`Updating focal points. Current time: ${currentTime}s, Current frame: ${currentFrame}, Viewport aspect: ${viewportAspect}, Video aspect: ${videoAspect}`);

    if (!isFinite(videoAspect)) {
        console.log('Video aspect ratio is not yet ready. Skipping focal point update.');
        return;
    }

    if (viewportAspect < videoAspect && focalPointIndex < focalPoints.length) {
        if (currentFrame > lastProcessedFrame) {
            const matchedFocalPoint = focalPoints[focalPointIndex];
            console.log('Matched focal point:', matchedFocalPoint);

            const cropXInPixels = matchedFocalPoint.cropX * player.videoWidth();
            console.log(`cropXInPixels: ${cropXInPixels}`);
                
            const objectPositionX = (cropXInPixels / player.videoWidth()) * 100;
            console.log(`Calculated object position X = ${objectPositionX}%`);

            if (lastObjectPositionX === null) {
                lastObjectPositionX = objectPositionX;
                const videoElement = player.el().querySelector('.vjs-tech');
                videoElement.style.objectPosition = `${objectPositionX}% 0%`;
                console.log('Initial object position set to:', objectPositionX);
            } else {
                smoothTransition(lastObjectPositionX, objectPositionX, 500);
            }

            focalPointIndex++;
            lastProcessedFrame = currentFrame;
        }
    } else {
        const videoElement = player.el().querySelector('.vjs-tech');
        videoElement.style.objectPosition = '50% 50%';
        console.log('Viewport aspect ratio larger than video aspect ratio. Centering video.');
    }
}
