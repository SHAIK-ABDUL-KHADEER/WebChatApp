// const hostDomain = 'webchatapp-shaikabdulkhadeer.onrender.com';
// const socket = io(`https://${hostDomain}`);
// let username = localStorage.getItem('username') || '';
// const typingIndicator = document.getElementById('typing-indicator');

// function setUsername() {
//     const usernameInput = document.getElementById('username');
//     const enteredUsername = usernameInput.value.trim();

//     if (enteredUsername !== '') {
//         username = enteredUsername;
//         localStorage.setItem('username', username);
//         document.getElementById('username-container').style.display = 'none';
//         document.getElementById('chat-container').style.display = 'block';
//     } else {
//         alert('Please enter a valid username.');
//     }
// }

// function createRoom() {
//     socket.emit('createRoom');
// }

// function joinRoom() {
//     const roomCodeInput = document.getElementById('room-code-input');
//     const enteredCode = roomCodeInput.value.toUpperCase();
//     socket.emit('joinRoom', enteredCode);
// }

// socket.on('roomCreated', (code) => {
//     displaySystemMessage(`Room created! Your room code is: ${code}`);
// });

// socket.on('roomJoined', (code) => {
//     displaySystemMessage(`${username} joined the room.`);
// });

// socket.on('roomFull', () => {
//     alert('Room is full. Please try another room or create a new one.');
// });

// socket.on('message', ({ sender, message }) => {
//     const messagesContainer = document.getElementById('messages');
//     const li = document.createElement('li');
//     li.appendChild(document.createTextNode(`${sender}: ${message}`));
//     messagesContainer.appendChild(li);
// });

// socket.on('userTyping', (username) => {
//     typingIndicator.innerText = `${username} is typing...`;
//     setTimeout(() => {
//         typingIndicator.innerText = '';
//     }, 2000);
// });

// function sendMessage() {
//     const messageInput = document.getElementById('message-input');
//     const message = messageInput.value;

//     if (message.trim() !== '') {
//         socket.emit('message', { sender: username, message });
//         messageInput.value = '';
//     }
// }

// function displaySystemMessage(message) {
//     const messagesContainer = document.getElementById('messages');
//     const li = document.createElement('li');
//     li.classList.add('system-message');
//     li.appendChild(document.createTextNode(message));
//     messagesContainer.appendChild(li);
// }

// function leaveChat() {
//     socket.disconnect();
//     document.getElementById('username-container').style.display = 'block';
//     document.getElementById('chat-container').style.display = 'none';
//     displaySystemMessage(`${username} left the room.`);
// }

const hostIp = 'localhost'; // Replace with the actual IP address of your server
const socket = io(`http://${hostIp}:3000`);
let username = localStorage.getItem('username') || '';
const typingIndicator = document.getElementById('typing-indicator');

let gameRequest = null; // Store the game request information

function setUsername() {
    const usernameInput = document.getElementById('username');
    const enteredUsername = usernameInput.value.trim();

    if (enteredUsername !== '') {
        username = enteredUsername;
        localStorage.setItem('username', username);

        // Show the options container (Connect with Friends)
        document.getElementById('username-container').style.display = 'none';
        document.getElementById('options-container').style.display = 'block';
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
    showGames();
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

socket.on('gameRequest', (request) => {
    if (confirm(`${request.username} wants to play ${request.gameName}. Do you accept?`)) {
        gameRequest = request;
        socket.emit('gameRequestAccepted', { sender: socket.id, receiver: request.sender });
    } else {
        socket.emit('gameRequestRejected', { sender: socket.id, receiver: request.sender });
    }
});

socket.on('gameRequestAccepted', (response) => {
    if (gameRequest && response.sender === socket.id) {
        document.getElementById('games-container').style.display = 'none';
        document.getElementById('game1-container').style.display = 'block';
        alert(`Game request accepted. You are playing against ${gameRequest.username}`);
    }
});

socket.on('gameRequestRejected', (response) => {
    if (gameRequest && response.sender === socket.id) {
        alert(`Game request rejected by ${gameRequest.username}`);
        gameRequest = null; // Reset game request
    }
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
    document.getElementById('options-container').style.display = 'none';
    document.getElementById('games-container').style.display = 'none';
    document.getElementById('game1-container').style.display = 'none';
    displaySystemMessage(`${username} left the room.`);
    gameRequest = null; // Reset game request
}

function showGames() {
    // Hide the options container and show the chat container
    document.getElementById('options-container').style.display = 'none';
    document.getElementById('chat-container').style.display = 'block';
}

function joinGame(gameName) {
    if (gameName === 'Game 1') {
        socket.emit('sendGameRequest', { sender: socket.id, username, gameName });
        alert('Game request sent. Waiting for the opponent to accept...');
    } else {
        alert(`Joined ${gameName}`);
        // Add logic to join other games if needed
    }
}

function chooseOption(option) {
    const roomCode = getRoomCodeBySocketId(socket.id);
    const opponentSocketId = getOpponentSocketId(roomCode);

    if (opponentSocketId) {
        socket.emit('gameMove', { sender: socket.id, receiver: opponentSocketId, move: option });
    } else {
        alert('Waiting for an opponent to join the game.');
    }
}

function getRoomCodeBySocketId(socketId) {
    for (const roomCode in rooms) {
        if (rooms[roomCode].users.includes(socketId)) {
            return roomCode;
        }
    }
    return null;
}

function getOpponentSocketId(roomCode) {
    const users = rooms[roomCode].users;
    const opponentIndex = users.indexOf(socket.id) === 0 ? 1 : 0;
    return users[opponentIndex];
}

// Paste the provided cursor effect JavaScript code below this line
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext('2d');

// for intro motion
let mouseMoved = false;

const pointer = {
    x: 0.5 * window.innerWidth,
    y: 0.5 * window.innerHeight,
};

const params = {
    pointsNumber: 40,
    widthFactor: 0.3,
    mouseThreshold: 0.6,
    spring: 0.4,
    friction: 0.5,
};

const trail = new Array(params.pointsNumber);
for (let i = 0; i < params.pointsNumber; i++) {
    trail[i] = {
        x: pointer.x,
        y: pointer.y,
        dx: 0,
        dy: 0,
    };
}

window.addEventListener("click", e => {
    updateMousePosition(e.pageX, e.pageY);
});

window.addEventListener("mousemove", e => {
    mouseMoved = true;
    updateMousePosition(e.pageX, e.pageY);
});

window.addEventListener("touchmove", e => {
    mouseMoved = true;
    updateMousePosition(e.targetTouches[0].pageX, e.targetTouches[0].pageY);
});

function updateMousePosition(eX, eY) {
    pointer.x = eX;
    pointer.y = eY;
}

setupCanvas();
update(0);
window.addEventListener("resize", setupCanvas);

function update(t) {
    // for intro motion
    if (!mouseMoved) {
        pointer.x = (0.5 + 0.3 * Math.cos(0.002 * t) * (Math.sin(0.005 * t))) * window.innerWidth;
        pointer.y = (0.5 + 0.2 * (Math.cos(0.005 * t)) + 0.1 * Math.cos(0.01 * t)) * window.innerHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    trail.forEach((p, pIdx) => {
        const prev = pIdx === 0 ? pointer : trail[pIdx - 1];
        const spring = pIdx === 0 ? 0.4 * params.spring : params.spring;
        p.dx += (prev.x - p.x) * spring;
        p.dy += (prev.y - p.y) * spring;
        p.dx *= params.friction;
        p.dy *= params.friction;
        p.x += p.dx;
        p.y += p.dy;
    });

    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(trail[0].x, trail[0].y);

    for (let i = 1; i < trail.length - 1; i++) {
        const xc = 0.5 * (trail[i].x + trail[i + 1].x);
        const yc = 0.5 * (trail[i].y + trail[i + 1].y);
        ctx.quadraticCurveTo(trail[i].x, trail[i].y, xc, yc);
        ctx.lineWidth = params.widthFactor * (params.pointsNumber - i);
        ctx.stroke();
    }
    ctx.lineTo(trail[trail.length - 1].x, trail[trail.length - 1].y);
    ctx.stroke();

    window.requestAnimationFrame(update);
}

function setupCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
