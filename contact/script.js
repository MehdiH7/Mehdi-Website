document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.container');
    const rotationFactor = 0.1; // Reduce the sensitivity of rotation

    // Device orientation event
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', function(event) {
            const alpha = event.alpha * rotationFactor; // Z-axis rotation
            const beta = event.beta * rotationFactor;  // X-axis tilt
            const gamma = event.gamma * rotationFactor; // Y-axis tilt

            // Apply a scaled down rotation transform
            container.style.transform = `rotateZ(${alpha}deg) rotateX(${beta}deg) rotateY(${gamma}deg)`;
        });
    }

    // Form submission handling with reCAPTCHA
    document.getElementById('contact-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const data = {
            name: form.name.value,
            email: form.email.value,
            message: form.message.value
        };

        grecaptcha.ready(async () => {
            const token = await grecaptcha.execute('6LfLgiEqAAAAAIMGJ4ePyUfYynzqRre-mkWQdtWP', { action: 'submit' });
            data['g-recaptcha-response'] = token;

            try {
                const response = await fetch('https://my-contact-form-n1nounryp-mehdis-projects-37a20b81.vercel.app/api/send-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const result = await response.json();
                document.getElementById('response').innerText = result.message;
                document.getElementById('response').classList.add('success');
                setTimeout(() => {
                    document.getElementById('response').classList.remove('success');
                }, 3000);
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('response').innerText = 'Failed to send message';
                document.getElementById('response').classList.add('error');
                setTimeout(() => {
                    document.getElementById('response').classList.remove('error');
                }, 3000);
            }
        });
    });

    // Focus and blur animations for input fields
    document.querySelectorAll('.input-group input, .input-group textarea').forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        input.addEventListener('blur', () => {
            if (!input.value) {
                input.parentElement.classList.remove('focused');
            }
        });
    });
});
