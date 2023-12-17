const hostIp = '13.228.225.19'; // Replace with the actual IP address of your server
const socket = io(`http://${hostIp}:3000`);
let username = localStorage.getItem('username') || '';
const typingIndicator = document.getElementById('typing-indicator');

function setUsername() {
    const usernameInput = document.getElementById('username');
    const enteredUsername = usernameInput.value.trim();

    if (enteredUsername !== '') {
        username = enteredUsername;
        localStorage.setItem('username', username);
        document.getElementById('username-container').style.display = 'none';
        document.getElementById('chat-container').style.display = 'block';
    } else {
        alert('Please enter a valid username.');
    }
}

function createRoom() {
    socket.emit('createRoom');
}

function joinRoom() {
    const roomCodeInput = document.getElementById('room-code-input');
    const enteredCode = roomCodeInput.value.toUpperCase();
    socket.emit('joinRoom', enteredCode);
}

socket.on('roomCreated', (code) => {
    displaySystemMessage(`Room created! Your room code is: ${code}`);
});

socket.on('roomJoined', (code) => {
    displaySystemMessage(`${username} joined the room.`);
});

socket.on('roomFull', () => {
    alert('Room is full. Please try another room or create a new one.');
});

socket.on('message', ({ sender, message }) => {
    const messagesContainer = document.getElementById('messages');
    const li = document.createElement('li');
    li.appendChild(document.createTextNode(`${sender}: ${message}`));
    messagesContainer.appendChild(li);
});

socket.on('userTyping', (username) => {
    typingIndicator.innerText = `${username} is typing...`;
    setTimeout(() => {
        typingIndicator.innerText = '';
    }, 2000);
});

function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value;

    if (message.trim() !== '') {
        socket.emit('message', { sender: username, message });
        messageInput.value = '';
    }
}

function displaySystemMessage(message) {
    const messagesContainer = document.getElementById('messages');
    const li = document.createElement('li');
    li.classList.add('system-message');
    li.appendChild(document.createTextNode(message));
    messagesContainer.appendChild(li);
}

function leaveChat() {
    socket.disconnect();
    document.getElementById('username-container').style.display = 'block';
    document.getElementById('chat-container').style.display = 'none';
    displaySystemMessage(`${username} left the room.`);
}
