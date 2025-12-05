import React, { createContext, useState, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { loadEvents, saveEvents } from '../utils/storage';
import { db } from '../config/firebaseConfig';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, orderBy, serverTimestamp } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const EventsContext = createContext();

export const useEvents = () => useContext(EventsContext);

export const EventsProvider = ({ children }) => {
    const [events, setEvents] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        let unsubscribe;

        if (user && user.uid) {
            // Firestore Sync
            const q = query(
                collection(db, 'events'),
                where('userId', '==', user.uid),
                orderBy('createdAt', 'desc')
            );

            unsubscribe = onSnapshot(q, (snapshot) => {
                const loadedEvents = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setEvents(loadedEvents);
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
        const loaded = await loadEvents();
        setEvents(loaded);
    };

    const addEvent = async (eventData) => {
        if (user && user.uid) {
            await addDoc(collection(db, 'events'), {
                userId: user.uid,
                ...eventData,
                createdAt: serverTimestamp(),
            });
        } else {
            const newEvent = {
                id: uuidv4(),
                ...eventData,
                createdAt: new Date().toISOString(),
            };
            const updatedEvents = [...events, newEvent];
            setEvents(updatedEvents);
            await saveEvents(updatedEvents);
        }
    };

    const updateEvent = async (id, updatedData) => {
        if (user && user.uid) {
            const eventRef = doc(db, 'events', id);
            await updateDoc(eventRef, updatedData);
        } else {
            const updatedEvents = events.map(event =>
                event.id === id ? { ...event, ...updatedData } : event
            );
            setEvents(updatedEvents);
            await saveEvents(updatedEvents);
        }
    };

    const deleteEvent = async (id) => {
        if (user && user.uid) {
            await deleteDoc(doc(db, 'events', id));
        } else {
            const updatedEvents = events.filter(event => event.id !== id);
            setEvents(updatedEvents);
            await saveEvents(updatedEvents);
        }
    };

    return (
        <EventsContext.Provider value={{ events, addEvent, updateEvent, deleteEvent }}>
            {children}
        </EventsContext.Provider>
    );
};
