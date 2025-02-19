// Firebase Setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } 
    from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } 
    from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAxMPFj3Sbp3knrR9kEVLSJQ96m2dD3V4U",
    authDomain: "life-9eb60.firebaseapp.com",
    projectId: "life-9eb60",
    storageBucket: "life-9eb60.firebasestorage.app",
    messagingSenderId: "522366845118",
    appId: "1:522366845118:web:bc96adafcb0ed5da23deef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const provider = new GoogleAuthProvider();
const db = getFirestore();

// UI Elements
const loginBtn = document.getElementById("login-btn");
const userEmail = document.getElementById("user-email");
const buttonsDiv = document.getElementById("buttons");

// Sign in function
loginBtn.addEventListener("click", () => {
    signInWithPopup(auth, provider).then(result => {
        const user = result.user;
        userEmail.innerText = `Logged in as: ${user.email}`;
        userEmail.classList.remove("hidden");
        buttonsDiv.classList.remove("hidden");
    });
});

// Graph Data
let dailyData = {};

// Log Day Function
async function logDay(choice) {
    const user = auth.currentUser;
    if (!user) return alert("Please login first!");

    const today = new Date().toISOString().split('T')[0];
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    
    let userData = docSnap.exists() ? docSnap.data() : { logs: {} };
    userData.logs[today] = choice;
    
    await setDoc(docRef, userData);
    updateGraph(userData.logs);
}

// Graph Logic
const ctx = document.getElementById('lifeChart').getContext('2d');
let chart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'Daily Life Analysis',
            data: [],
            backgroundColor: ['red', 'yellow', 'green']
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: { beginAtZero: true, max: 30 }
        }
    }
});

// Update Graph
async function updateGraph(logs) {
    const labels = Object.keys(logs);
    const values = labels.map(date => {
        return logs[date] === "worst" ? 10 :
               logs[date] === "average" ? 20 :
               30;
    });

    chart.data.labels = labels;
    chart.data.datasets[0].data = values;
    chart.update();
}

// Fetch data on login
onAuthStateChanged(auth, async (user) => {
    if (user) {
        userEmail.innerText = `Logged in as: ${user.email}`;
        userEmail.classList.remove("hidden");
        buttonsDiv.classList.remove("hidden");

        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) updateGraph(docSnap.data().logs);
    }
});
