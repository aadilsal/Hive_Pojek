sessionStorage.setItem('hive', new URLSearchParams(window.location.search).get('hive'));
sessionStorage.setItem('name', new URLSearchParams(window.location.search).get('username'));
sessionStorage.setItem('UID', Math.floor(Math.random() * 100000).toString());

const APP_ID = '593278c8e8b048f29c13c30c420f101f';
const CHANNEL = sessionStorage.getItem('hive');
const TOKEN = sessionStorage.getItem('token');
let UID = Number(sessionStorage.getItem('UID'));
const NAME = sessionStorage.getItem('name');
const hiveName = new URLSearchParams(window.location.search).get('hive');
if (!hiveName) {
    alert('Hive name is missing. Ensure you are joining the correct room.');
}
sessionStorage.setItem('hive', hiveName);

let localTracks = [];
let remoteUsers = {};

const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

let socket = new WebSocket(`ws://127.0.0.1:8000/ws/hive/${CHANNEL}/`);

socket.onopen = function () {
    console.log('WebSocket connection established');
};

socket.onerror = function (error) {
    console.error('WebSocket error: ', error);
};

socket.onclose = function () {
    console.log('WebSocket connection closed');
};

socket.onmessage = function (event) {
    const data = JSON.parse(event.data);
    if (data.type === 'user-joined') {
        handleUserJoined(data.user, data.mediaType);
    } else if (data.type === 'user-left') {
        handleUserLeft(data.user);
    }
};

async function fetchToken(channel) {
    try {
        const uid = Number(sessionStorage.getItem('UID')) || Math.floor(Math.random() * 100000);
        sessionStorage.setItem('UID', uid); // Store UID

        const response = await fetch(`/get-token/?channel=${encodeURIComponent(channel)}&uid=${uid}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch token: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.token) {
            sessionStorage.setItem('token', data.token); // Save token in sessionStorage
            console.log('Token fetched successfully:', data.token);
        } else {
            console.error('Failed to fetch token:', data.error || 'Unknown error');
            alert('Failed to fetch token. Please try again.');
        }
    } catch (error) {
        console.error('Error fetching token:', error);
        alert('Error fetching token. Please check the console for more details.');
    }
}

let joinAndDisplayLocalStream = async () => {
    const token = sessionStorage.getItem('token');
    const uid = Number(sessionStorage.getItem('UID'));
    const channel = sessionStorage.getItem('hive');

    if (!channel || !token || !uid) {
        alert("Channel, Token, or UID is missing.");
        console.error("Missing details:", { channel, token, uid });
        return;
    }

    try {
        await client.join(APP_ID, channel, token, uid);
        localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();

        const player = `
            <div class="video-container" id="user-container-${uid}">
                <div class="username-wrapper"><span class="user-name">${NAME}</span></div>
                <div class="video-player" id="user-${uid}"></div>
            </div>`;
        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player);

        localTracks[1].play(`user-${uid}`);
        await client.publish(localTracks);

        console.log("Successfully joined the channel:", channel);
    } catch (error) {
        console.error("Failed to join the stream:", error);
        alert(`Failed to join the stream: ${error.message}`);
    }
};

document.addEventListener("DOMContentLoaded", async () => {
    if (!sessionStorage.getItem('hive')) {
        sessionStorage.setItem('hive', new URLSearchParams(window.location.search).get('hive'));
    }
    if (!sessionStorage.getItem('name')) {
        sessionStorage.setItem('name', new URLSearchParams(window.location.search).get('username'));
    }
    if (!sessionStorage.getItem('UID')) {
        sessionStorage.setItem('UID', Math.floor(Math.random() * 100000).toString());
    }

    const channel = sessionStorage.getItem('hive');
    if (!channel) {
        alert('Channel name is missing.');
        return;
    }

    await fetchToken(channel);
    joinAndDisplayLocalStream();
});

let handleUserJoined = async (user, mediaType) => {
    try {
        remoteUsers[user.uid] = user;
        await client.subscribe(user, mediaType);

        if (mediaType === "video") {
            console.log("Rendering remote video for user:", user.uid);

            let player = document.getElementById(`user-container-${user.uid}`);
            if (player != null) {
                console.log("Player already exists, removing it.");
                player.remove();
            }

            player = `
                <div class="video-container" id="user-container-${user.uid}">
                    <div class="username-wrapper"><span class="user-name">Remote User</span></div>
                    <div class="video-player" id="user-${user.uid}"></div>
                </div>`;
            document.getElementById('video-streams').insertAdjacentHTML('beforeend', player);

            // Play the video track
            user.videoTrack.play(`user-${user.uid}`);
        }

        if (mediaType === "audio") {
            console.log("Playing remote audio for user:", user.uid);
            user.audioTrack.play();
        }
    } catch (error) {
        console.error("Error handling user join:", error);
    }
};

let handleUserLeft = (user) => {
    delete remoteUsers[user.uid];
    const player = document.getElementById(`user-container-${user.uid}`);
    if (player) {
        player.remove();
    }
};

let leaveAndRemoveLocalStream = async () => {
    for (let track of localTracks) {
        track.stop();
        track.close();
    }

    await client.leave();
    window.open('/', '_self');
};

let toggleCamera = async (e) => {
    if (localTracks[1].muted) {
        await localTracks[1].setMuted(false);
        e.target.style.backgroundColor = '#fff';
    } else {
        await localTracks[1].setMuted(true);
        e.target.style.backgroundColor = 'rgb(255,80,80)';
    }
};

let toggleMic = async (e) => {
    if (localTracks[0].muted) {
        await localTracks[0].setMuted(false);
        e.target.style.backgroundColor = '#fff';
    } else {
        await localTracks[0].setMuted(true);
        e.target.style.backgroundColor = 'rgb(255,80,80)';
    }
};

document.getElementById('leave-btn').addEventListener('click', leaveAndRemoveLocalStream);
document.getElementById('camera-btn').addEventListener('click', toggleCamera);
document.getElementById('mic-btn').addEventListener('click', toggleMic);


client.on("user-published", async (user, mediaType) => {
    console.log("User-published event:", user.uid, "Media type:", mediaType);
    await handleUserJoined(user, mediaType);
});

client.on("user-unpublished", (user, mediaType) => {
    console.log("User-unpublished event:", user.uid, "Media type:", mediaType);
    handleUserLeft(user);
});

client.on("user-left", (user) => {
    console.log("User-left event:", user.uid);
    handleUserLeft(user);
});

document.querySelectorAll(".video-player").forEach((player) => {
    console.log("Video player element found:", player.id);
});
