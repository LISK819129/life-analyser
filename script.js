// Firebase Config (Use Your Own Config)
const firebaseConfig = {
    apiKey: "AIzaSyAxMPFj3Sbp3knrR9kEVLSJQ96m2dD3V4U",
    authDomain: "life-9eb60.firebaseapp.com",
    projectId: "life-9eb60",
    storageBucket: "life-9eb60.appspot.com",
    messagingSenderId: "522366845118",
    appId: "1:522366845118:web:bc96adafcb0ed5da23deef"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let userId = null;

// Handle Google Login
document.getElementById("login-btn").addEventListener("click", () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then(result => {
        userId = result.user.uid;
        document.getElementById("user-name").innerText = `Logged in as: ${result.user.displayName}`;
        loadGraphData();
    }).catch(error => console.error(error.message));
});

// Function to Submit Mood Data
function submitMood(mood) {
    if (!userId) {
        alert("Please log in first!");
        return;
    }

    const moodValues = { worst: 10, average: 20, great: 30 };
    const today = new Date().toISOString().split('T')[0];

    db.collection("users").doc(userId).collection("moods").doc(today).set({
        mood: mood,
        value: moodValues[mood],
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        loadGraphData();
    }).catch(error => console.error("Error saving mood:", error));
}

// Function to Load Graph Data
function loadGraphData() {
    if (!userId) return;

    db.collection("users").doc(userId).collection("moods").orderBy("timestamp").get().then(snapshot => {
        let labels = [], data = [];
        snapshot.forEach(doc => {
            labels.push(doc.id);
            data.push(doc.data().value);
        });
        updateGraph(labels, data);
    });
}

// Function to Update the Graph
function updateGraph(labels, data) {
    const ctx = document.getElementById('moodChart').getContext('2d');
    if (window.moodChart) window.moodChart.destroy(); // Destroy old chart before creating a new one

    window.moodChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Mood Analysis',
                data: data,
                backgroundColor: ['#ff4d4d', '#f1c40f', '#2ecc71'],
                borderColor: '#fff',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true, max: 40 }
            }
        }
    });
}

// Load Graph Data on Page Load
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        userId = user.uid;
        document.getElementById("user-name").innerText = `Logged in as: ${user.displayName}`;
        loadGraphData();
    }
});
