document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.container');
    const maxRotationDegrees = 5; // Maximum degrees the container can rotate

    // Device orientation event
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', function(event) {
            const beta = Math.max(-maxRotationDegrees, Math.min(maxRotationDegrees, event.beta * 0.1));  // X-axis tilt
            const gamma = Math.max(-maxRotationDegrees, Math.min(maxRotationDegrees, event.gamma * 0.1)); // Y-axis tilt

            // Apply a scaled down rotation transform focused on beta (X-axis) and gamma (Y-axis)
            container.style.transform = `rotateX(${beta}deg) rotateY(${gamma}deg)`;
        });
    }

    const responseDiv = document.getElementById('response');
    document.getElementById('contact-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const data = {
            name: form.name.value,
            email: form.email.value,
            message: form.message.value
        };

        // Update UI for sending message
        responseDiv.innerHTML = '<div class="loading">Sending message...</div>';
        responseDiv.classList.add('show');

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
                responseDiv.innerHTML = `<div class="success"><i class="fas fa-check-circle"></i> ${result.message}</div>`;
                setTimeout(() => {
                    responseDiv.classList.remove('show');
                }, 3000);
            } catch (error) {
                console.error('Error:', error);
                responseDiv.innerHTML = `<div class="error"><i class="fas fa-exclamation-triangle"></i> Failed to send message: ${error.message}</div>`;
                setTimeout(() => {
                    responseDiv.classList.remove('show');
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
