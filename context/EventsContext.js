import React, { createContext, useState, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { loadEvents, saveEvents } from '../utils/storage';

const EventsContext = createContext();

export const useEvents = () => useContext(EventsContext);

export const EventsProvider = ({ children }) => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const loaded = await loadEvents();
        setEvents(loaded);
    };

    const addEvent = async (eventData) => {
        const newEvent = {
            id: uuidv4(),
            ...eventData,
            createdAt: new Date().toISOString(),
        };
        const updatedEvents = [...events, newEvent];
        setEvents(updatedEvents);
        await saveEvents(updatedEvents);
    };

    const updateEvent = async (id, updatedData) => {
        const updatedEvents = events.map(event =>
            event.id === id ? { ...event, ...updatedData } : event
        );
        setEvents(updatedEvents);
        await saveEvents(updatedEvents);
    };

    const deleteEvent = async (id) => {
        const updatedEvents = events.filter(event => event.id !== id);
        setEvents(updatedEvents);
        await saveEvents(updatedEvents);
    };

    return (
        <EventsContext.Provider value={{ events, addEvent, updateEvent, deleteEvent }}>
            {children}
        </EventsContext.Provider>
    );
};
