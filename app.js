// Auth0 Configuration
const auth0Config = {
    domain: "blueboop.au.auth0.com",
    clientId: "AFWFFI2yAlvymluiWfH7uKFmgH01h6mj"
};

let auth0Client = null;
let userLocation = null;
let currentUser = null;

// Initialize Auth0
async function initAuth0() {
    console.log("Initializing Auth0 with:", auth0Config);
    try {
        auth0Client = await auth0.createAuth0Client({
            domain: auth0Config.domain,
            clientId: auth0Config.clientId,
            authorizationParams: {
                redirect_uri: window.location.origin + window.location.pathname
            }
        });

        // Check if user is returning from login redirect
        const query = window.location.search;
        if (query.includes("code=") && query.includes("state=")) {
            console.log("Handling redirect callback...");
            await auth0Client.handleRedirectCallback();
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        updateAuthUI();
    } catch (e) {
        console.error("Auth0 initialization failed", e);
    }
}

async function updateAuthUI() {
    const isAuthenticated = await auth0Client.isAuthenticated();
    console.log("Is authenticated:", isAuthenticated);

    if (isAuthenticated) {
        currentUser = await auth0Client.getUser();
        console.log("User:", currentUser);
        document.getElementById("btn-login").classList.add("hidden");
        document.getElementById("btn-logout").classList.remove("hidden");
        document.getElementById("app-container").classList.remove("hidden");
        document.getElementById("welcome-screen").classList.add("hidden");

        startApp();
    } else {
        document.getElementById("btn-login").classList.remove("hidden");
        document.getElementById("btn-logout").classList.add("hidden");
        document.getElementById("app-container").classList.add("hidden");
        document.getElementById("welcome-screen").classList.remove("hidden");
    }
}

function startApp() {
    getLocation();
    loadFeed();
}

function getLocation() {
    const statusText = document.querySelector("#location-status span");
    if (!navigator.geolocation) {
        statusText.textContent = "Geolocation not supported by your browser.";
        return;
    }

    statusText.textContent = "Detecting location...";

    navigator.geolocation.getCurrentPosition(
        (position) => {
            userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            statusText.textContent = `Location active: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`;
            loadFeed(); // Reload feed with location
        },
        () => {
            statusText.textContent = "Unable to retrieve location. Please enable GPS.";
        }
    );
}

// Proximity Logic (Haversine Formula)
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

const FEED_RADIUS_KM = 10;

async function loadFeed() {
    if (!userLocation) return;
    const { db, collection, query, orderBy, getDocs } = window.firebaseTools;
    const feedEl = document.getElementById("feed");
    feedEl.innerHTML = "Loading echoes...";

    try {
        const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);

        feedEl.innerHTML = "";
        let count = 0;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const distance = getDistance(userLocation.lat, userLocation.lng, data.lat, data.lng);

            if (distance <= FEED_RADIUS_KM) {
                renderPost(feedEl, data, distance);
                count++;
            }
        });

        if (count === 0) {
            feedEl.innerHTML = "<p class='empty-msg'>No echoes nearby. Be the first to post!</p>";
        }
    } catch (e) {
        console.error("Error loading feed:", e);
        feedEl.innerHTML = "Failed to load feed.";
    }
}

function renderPost(container, data, distance) {
    const card = document.createElement("div");
    card.className = "post-card";

    const time = data.timestamp ? data.timestamp.toDate().toLocaleString() : "Just now";
    const distText = distance !== null ? `${distance.toFixed(1)} km away` : "";
    const score = data.score || 0;

    card.innerHTML = `
        <div class="post-text">${escapeHTML(data.text)}</div>
        <div class="post-meta">
            <div class="vote-controls">
                <button class="vote-btn">▲</button>
                <span class="score">${score}</span>
                <button class="vote-btn">▼</button>
            </div>
            <div>
                <span>${time}</span>
                <span style="margin-left: 8px;">${distText}</span>
            </div>
        </div>
    `;
    container.appendChild(card);
}

function escapeHTML(str) {
    const p = document.createElement("p");
    p.textContent = str;
    return p.innerHTML;
}

// Post Submission
document.getElementById("btn-submit-post").onclick = async () => {
    const textEl = document.getElementById("post-text");
    const text = textEl.value.trim();

    if (!text) return;
    if (!userLocation) {
        alert("Location is required to post.");
        return;
    }

    const { db, collection, addDoc, Timestamp } = window.firebaseTools;

    try {
        await addDoc(collection(db, "posts"), {
            text: text,
            lat: userLocation.lat,
            lng: userLocation.lng,
            userId: currentUser.sub, // Track user history
            timestamp: Timestamp.now(),
            score: 0
        });

        textEl.value = "";
        document.getElementById("post-modal").classList.add("hidden");
        loadFeed();
    } catch (e) {
        console.error("Error adding document: ", e);
        alert("Failed to post.");
    }
};

// Tab Switching
document.getElementById("tab-feed").onclick = () => {
    document.getElementById("tab-feed").classList.add("active");
    document.getElementById("tab-history").classList.remove("active");
    document.getElementById("feed-container").classList.remove("hidden");
    document.getElementById("history-container").classList.add("hidden");
    loadFeed();
};

document.getElementById("tab-history").onclick = () => {
    document.getElementById("tab-history").classList.add("active");
    document.getElementById("tab-feed").classList.remove("active");
    document.getElementById("history-container").classList.remove("hidden");
    document.getElementById("feed-container").classList.add("hidden");
    loadHistory();
};

// Modal Logic
const modal = document.getElementById("post-modal");
document.getElementById("btn-post-modal").onclick = () => modal.classList.remove("hidden");
document.querySelector(".close-modal").onclick = () => modal.classList.add("hidden");
window.onclick = (event) => { if (event.target == modal) modal.classList.add("hidden"); };

// Event Listeners
document.getElementById("btn-login").onclick = () => {
    console.log("Login button clicked");
    auth0Client.loginWithRedirect();
};

document.getElementById("btn-logout").onclick = () => {
    auth0Client.logout({ logoutParams: { returnTo: window.location.origin + window.location.pathname } });
};

document.getElementById("btn-refresh-loc").onclick = getLocation;

async function loadHistory() {
    if (!currentUser) return;
    const { db, collection, query, where, orderBy, getDocs } = window.firebaseTools;
    const historyEl = document.getElementById("history");
    historyEl.innerHTML = "Loading your history...";

    try {
        const q = query(
            collection(db, "posts"),
            where("userId", "==", currentUser.sub),
            orderBy("timestamp", "desc")
        );
        const querySnapshot = await getDocs(q);

        historyEl.innerHTML = "";
        let count = 0;

        querySnapshot.forEach((doc) => {
            renderPost(historyEl, doc.data(), null); // Null distance for history
            count++;
        });

        if (count === 0) {
            historyEl.innerHTML = "<p class='empty-msg'>You haven't posted anything yet.</p>";
        }
    } catch (e) {
        console.error("Error loading history:", e);
        historyEl.innerHTML = "Failed to load history. (Make sure Firestore indexes are created if this fails)";
    }
}

// Initial Call
window.addEventListener('load', initAuth0);
