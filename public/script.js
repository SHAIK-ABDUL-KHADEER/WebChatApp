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


let mediaRecorder;
let audioChunks = [];
let isRecording = false;

const hostDomain = 'webchatapp-shaikabdulkhadeer.onrender.com';
const socket = io(`https://${hostDomain}`);
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


function initVoiceChat() {
    const sendVoiceMessageBtn = document.getElementById('sendVoiceMessage');
    const audioPlayer = document.getElementById('audioPlayer');
    const recordingIndicator = document.getElementById('recordingIndicator');

    // Event handler for receiving voice messages
    socket.on('voiceMessage', ({ sender, audio }) => {
        const messagesContainer = document.getElementById('messages');
        const li = document.createElement('li');
        li.appendChild(document.createTextNode(`${sender} sent a voice message`));
        messagesContainer.appendChild(li);

        // Create a new audio element for the voice message without autoplay
        const receivedAudio = new Audio();
        receivedAudio.src = `data:audio/wav;base64,${audio}`;
        receivedAudio.controls = true;

        // Append the audio element to the message container
        li.appendChild(receivedAudio);

        // Display a play button for the user to manually trigger playback
        const playButton = document.createElement('button');
        playButton.innerText = 'Play';
        playButton.addEventListener('click', () => {
            receivedAudio.play();
        });
        li.appendChild(playButton);
    });

    // Event listeners for recording and sending voice messages
    function startRecording() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then((stream) => {
                    mediaRecorder = new MediaRecorder(stream);

                    mediaRecorder.ondataavailable = (event) => {
                        if (event.data.size > 0) {
                            audioChunks.push(event.data);
                        }
                    };

                    mediaRecorder.onstop = () => {
                        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                        const audioUrl = URL.createObjectURL(audioBlob);
                        audioPlayer.src = audioUrl;
                        audioPlayer.style.display = 'block';
                        sendVoiceMessageBtn.disabled = false;
                        recordingIndicator.style.display = 'none'; // Hide recording indicator
                    };

                    mediaRecorder.start();
                    isRecording = true;
                    document.getElementById('startRecording').disabled = true;
                    document.getElementById('stopRecording').disabled = false;
                    recordingIndicator.style.display = 'block'; // Show recording indicator
                })
                .catch((error) => {
                    console.error('Error accessing microphone:', error);
                    // Handle error, show a message, or prompt the user to check microphone permissions
                });
        } else {
            console.error('getUserMedia is not supported in this browser');
            // Handle the lack of support for getUserMedia in this browser
        }
    }

    function stopRecording() {
        if (isRecording) {
            mediaRecorder.stop();
            isRecording = false;
            document.getElementById('startRecording').disabled = false;
            document.getElementById('stopRecording').disabled = true;
            recordingIndicator.style.display = 'none'; // Hide recording indicator
        }
    }

    function playRecording() {
        audioPlayer.play();
    }

    // Function to send a voice message
    function sendVoiceMessage() {
        if (audioChunks.length > 0) {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });

            // Convert the audioBlob to base64 for transmission
            const reader = new FileReader();
            reader.onloadend = function () {
                const base64Data = reader.result.split(',')[1];

                // Send the voice message to the server
                socket.emit('voiceMessage', { sender: username, audio: base64Data });

                // Display the voice message in the sender's chat
                const senderMessagesContainer = document.getElementById('messages');
                const senderLi = document.createElement('li');
                senderLi.appendChild(document.createTextNode(`${username} sent a voice message`));

                // Create a new audio element for the voice message without autoplay
                const senderAudioElement = new Audio();
                senderAudioElement.src = `data:audio/wav;base64,${base64Data}`;
                senderAudioElement.controls = true;

                // Append the audio element to the sender's chat
                senderLi.appendChild(senderAudioElement);

                //Display a play button for the sender to manually trigger playback
                const senderPlayButton = document.createElement('button');
                senderPlayButton.innerText = 'Play';
                senderPlayButton.addEventListener('click', () => {
                    senderAudioElement.play();
                });
                senderLi.appendChild(senderPlayButton);


                // Clear the recorded audioChunks after sending the message
                audioChunks = [];
            };
            reader.readAsDataURL(audioBlob);
        }
    }

    // Attach event listeners only if the corresponding elements are found
    const startRecordingBtn = document.getElementById('startRecording');
    const stopRecordingBtn = document.getElementById('stopRecording');
    const playRecordingBtn = document.getElementById('playRecording');

    if (startRecordingBtn && stopRecordingBtn && playRecordingBtn) {
        startRecordingBtn.addEventListener('click', startRecording);
        stopRecordingBtn.addEventListener('click', stopRecording);
        playRecordingBtn.addEventListener('click', playRecording);
        sendVoiceMessageBtn.addEventListener('click', sendVoiceMessage);

        // Initial state
        stopRecordingBtn.disabled = true;
        playRecordingBtn.disabled = true;
        sendVoiceMessageBtn.disabled = true;
    } else {
        console.error('One or more elements not found. Check your HTML.');
    }
}



function startRecording() {
    mediaRecorder.start();
    isRecording = true;
    document.getElementById('startRecording').disabled = true;
    document.getElementById('stopRecording').disabled = false;
}

function stopRecording() {
    if (isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        document.getElementById('startRecording').disabled = false;
        document.getElementById('stopRecording').disabled = true;
    }
}

function playRecording() {
    audioPlayer.play();
}

initVoiceChat();
