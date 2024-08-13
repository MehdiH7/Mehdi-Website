const sendBtn = document.getElementById('sendBtn');
const userInput = document.getElementById('userInput');
const messages = document.getElementById('messages');

const apiEndpoint = 'https://chatbot-4xe980nvz-mehdis-projects-37a20b81.vercel.app/api/chatbot'; // Update with your actual endpoint

function addMessage(content, className) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${className}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = content;
    
    const timestamp = document.createElement('div');
    timestamp.className = 'timestamp';
    const now = new Date();
    timestamp.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    messageElement.appendChild(messageContent);
    messageElement.appendChild(timestamp);
    
    chatbox.appendChild(messageElement);
    chatbox.scrollTop = chatbox.scrollHeight;
}

sendBtn.addEventListener('click', () => {
    const userMessage = userInput.value;
    if (!userMessage.trim()) return;

    addMessage(`You: ${userMessage}`, 'user-message');
    userInput.value = '';
    userInput.focus();

    // Send the prompt to the backend
    fetch(apiEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: userMessage })
    })
    .then(response => response.json())
    .then(data => {
        addMessage(`Bot: ${data.response}`, 'bot-message');
    })
    .catch(error => {
        addMessage('Bot: Sorry, something went wrong.', 'bot-message');
        console.error('Error:', error);
    });
});
