// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAYoswq1WNqspn7eJbnPwdq_cvQV6hRqd8",
    authDomain: "notws-eb773.firebaseapp.com",
    projectId: "notws-eb773",
    storageBucket: "notws-eb773.firebasestorage.app",
    messagingSenderId: "448736370472",
    appId: "1:448736370472:web:2f81b60a40bd8d492e3a1d",
    measurementId: "G-PD6Q1NF2YC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
