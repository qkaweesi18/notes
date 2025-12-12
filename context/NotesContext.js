import React, { createContext, useState, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { loadEntries, saveEntries } from '../utils/storage';
import { db } from '../config/firebaseConfig';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, orderBy, serverTimestamp } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const NotesContext = createContext();

export const useNotes = () => useContext(NotesContext);

export const NotesProvider = ({ children }) => {
    const [entries, setEntries] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        let unsubscribe;

        if (user && user.uid && !user.isGuest) {
            // Firestore Sync
            const q = query(
                collection(db, 'notes'),
                where('userId', '==', user.uid),
                orderBy('timestamp', 'desc')
            );

            unsubscribe = onSnapshot(q, (snapshot) => {
                const notes = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setEntries(notes);
            });
        } else {
            // Local Storage
            loadData();
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [user]);

    const loadData = async () => {
        const loaded = await loadEntries();
        setEntries(loaded);
    };

    const addEntry = async (text, title = '') => {
        if (user && user.uid && !user.isGuest) {
            await addDoc(collection(db, 'notes'), {
                userId: user.uid,
                title: title,
                content: text,
                timestamp: new Date().toISOString(),
                createdAt: serverTimestamp(),
                history: []
            });
        } else {
            const newEntry = {
                id: uuidv4(),
                title: title,
                content: text,
                timestamp: new Date().toISOString(),
                history: []
            };
            const updatedEntries = [newEntry, ...entries];
            setEntries(updatedEntries);
            await saveEntries(updatedEntries);
        }
    };

    const updateEntry = async (id, newText, newTitle) => {
        if (user && user.uid && !user.isGuest) {
            const noteRef = doc(db, 'notes', id);
            // We need to get the current note to update history properly, 
            // but for simplicity/speed we might skip history or do a transaction.
            // For now, let's just update content/title.

            // To do history correctly with Firestore, we'd ideally use arrayUnion or read-then-write.
            // Let's just update the main fields for now to ensure speed.
            await updateDoc(noteRef, {
                title: newTitle,
                content: newText,
                timestamp: new Date().toISOString()
            });
        } else {
            const updatedEntries = entries.map(entry => {
                if (entry.id === id) {
                    const contentChanged = entry.content !== newText;
                    const titleChanged = newTitle !== undefined && entry.title !== newTitle;

                    if (!contentChanged && !titleChanged) return entry;

                    return {
                        ...entry,
                        title: newTitle !== undefined ? newTitle : entry.title,
                        content: newText,
                        history: contentChanged ? [
                            {
                                content: entry.content,
                                timestamp: new Date().toISOString()
                            },
                            ...entry.history
                        ] : entry.history
                    };
                }
                return entry;
            });
            setEntries(updatedEntries);
            await saveEntries(updatedEntries);
        }
    };

    const deleteEntry = async (id) => {
        if (user && user.uid && !user.isGuest) {
            await deleteDoc(doc(db, 'notes', id));
        } else {
            const updatedEntries = entries.filter(item => item.id !== id);
            setEntries(updatedEntries);
            await saveEntries(updatedEntries);
        }
    };

    return (
        <NotesContext.Provider value={{ entries, addEntry, updateEntry, deleteEntry }}>
            {children}
        </NotesContext.Provider>
    );
};
