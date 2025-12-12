import React, { createContext, useState, useContext, useEffect } from 'react';

// Try to import Firebase - may fail if not configured
let auth = null;
let db = null;
let firebaseConfigured = false;

try {
    const firebase = require('../config/firebaseConfig');
    auth = firebase.auth;
    db = firebase.db;
    // Check if Firebase is actually configured (not placeholder values)
    firebaseConfigured = auth && auth.app && auth.app.options.apiKey !== "YOUR_API_KEY";
} catch (error) {
    console.log('Firebase not configured, running in demo mode');
}

// Only import Firebase functions if Firebase is configured
let createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile;
let doc, setDoc, getDoc;

if (firebaseConfigured) {
    const authModule = require('firebase/auth');
    createUserWithEmailAndPassword = authModule.createUserWithEmailAndPassword;
    signInWithEmailAndPassword = authModule.signInWithEmailAndPassword;
    signOut = authModule.signOut;
    onAuthStateChanged = authModule.onAuthStateChanged;
    updateProfile = authModule.updateProfile;

    const firestoreModule = require('firebase/firestore');
    doc = firestoreModule.doc;
    setDoc = firestoreModule.setDoc;
    getDoc = firestoreModule.getDoc;
}

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // If Firebase is not configured, skip auth and use demo mode
        if (!firebaseConfigured) {
            console.log('Running in demo mode - authentication disabled');
            // Auto-login with demo user
            setUser({
                uid: 'demo-user',
                email: 'demo@example.com',
                displayName: 'Demo User',
                isDemo: true
            });
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Get additional user data from Firestore
                try {
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    const userData = userDoc.data();

                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName || userData?.displayName || 'User',
                        photoURL: firebaseUser.photoURL,
                        ...userData
                    });
                } catch (err) {
                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName || 'User',
                    });
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signup = async (email, password, displayName) => {
        if (!firebaseConfigured) {
            setError('Firebase not configured. Please add your Firebase config.');
            return { success: false, error: 'Firebase not configured' };
        }

        try {
            setError(null);
            const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);

            // Update profile with display name
            await updateProfile(firebaseUser, { displayName });

            // Create user document in Firestore
            await setDoc(doc(db, 'users', firebaseUser.uid), {
                email,
                displayName,
                createdAt: new Date().toISOString(),
                settings: {
                    theme: 'system'
                }
            });

            return { success: true };
        } catch (err) {
            console.error("Signup Error:", err.code, err.message);
            setError(getErrorMessage(err.code));
            return { success: false, error: getErrorMessage(err.code) };
        }
    };

    const login = async (email, password) => {
        if (!firebaseConfigured) {
            setError('Firebase not configured. Please add your Firebase config.');
            return { success: false, error: 'Firebase not configured' };
        }

        try {
            setError(null);
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true };
        } catch (err) {
            console.error("Login Error:", err.code, err.message);
            setError(getErrorMessage(err.code));
            return { success: false, error: getErrorMessage(err.code) };
        }
    };

    const logout = async () => {
        if (!firebaseConfigured) {
            // In demo mode, just reset to demo user (or could set to null)
            setUser({
                uid: 'demo-user',
                email: 'demo@example.com',
                displayName: 'Demo User',
                isDemo: true
            });
            return { success: true };
        }

        try {
            await signOut(auth);
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const getErrorMessage = (code) => {
        switch (code) {
            case 'auth/email-already-in-use':
                return 'This email is already registered';
            case 'auth/invalid-email':
                return 'Invalid email address';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters';
            case 'auth/user-not-found':
                return 'No account found with this email';
            case 'auth/wrong-password':
                return 'Incorrect password';
            case 'auth/too-many-requests':
                return 'Too many attempts. Please try again later';
            case 'auth/invalid-credential':
                return 'Invalid email or password';
            case 'auth/operation-not-allowed':
                return 'Email/Password login is not enabled in Firebase Console';
            default:
                return 'An error occurred. Please try again';
        }
    };

    const value = {
        user,
        loading,
        error,
        signup,
        login,
        loginAsGuest: () => setUser({ uid: 'guest', isGuest: true, displayName: 'Guest' }),
        logout,
        isAuthenticated: !!user,
        isDemo: user?.isDemo || false,
        firebaseConfigured
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
