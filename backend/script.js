const getBtn = document.getElementById('getBtn');
const postBtn = document.getElementById('postBtn');
const putBtn = document.getElementById('putBtn');

const getResult = document.getElementById('getResult');
const postResult = document.getElementById('postResult');
const putResult = document.getElementById('putResult');
const progressText = document.getElementById('progressText');

const apiEndpoint = 'https://my-backend-3cxtoec4h-mehdis-projects-37a20b81.vercel.app/api/hello';

// Function to update the progress text
function updateProgress(message) {
    progressText.textContent = `Progress: ${message}`;
}

// Function to get the token from input
function getToken() {
    const token = document.getElementById('accessToken').value;
    return `Bearer ${token}`;
}

// GET request
getBtn.addEventListener('click', () => {
    const token = getToken();
    updateProgress('Fetching data...');
    fetch(apiEndpoint, {
        method: 'GET',
        headers: {
            'Authorization': token
        }
    })
    .then(response => response.json())
    .then(data => {
        getResult.textContent = JSON.stringify(data, null, 2);
        updateProgress('Data fetched successfully!');
    })
    .catch(error => {
        getResult.textContent = 'Error fetching data';
        updateProgress('Error occurred while fetching data.');
        console.error('Error:', error);
    });
});

// POST request
postBtn.addEventListener('click', () => {
    const token = getToken();
    const postData = { message: document.getElementById('postData').value };
    updateProgress('Posting data...');
    fetch(apiEndpoint, {
        method: 'POST',
        headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
    })
    .then(response => response.json())
    .then(data => {
        postResult.textContent = JSON.stringify(data, null, 2);
        updateProgress('Data posted successfully!');
    })
    .catch(error => {
        postResult.textContent = 'Error posting data';
        updateProgress('Error occurred while posting data.');
        console.error('Error:', error);
    });
});

// PUT request
putBtn.addEventListener('click', () => {
    const token = getToken();
    const putData = { message: document.getElementById('putData').value };
    updateProgress('Updating data...');
    fetch(apiEndpoint, {
        method: 'PUT',
        headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(putData)
    })
    .then(response => response.json())
    .then(data => {
        putResult.textContent = JSON.stringify(data, null, 2);
        updateProgress('Data updated successfully!');
    })
    .catch(error => {
        putResult.textContent = 'Error updating data';
        updateProgress('Error occurred while updating data.');
        console.error('Error:', error);
    });
});