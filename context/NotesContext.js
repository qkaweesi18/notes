import React, { createContext, useState, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { loadEntries, saveEntries } from '../utils/storage';

const NotesContext = createContext();

export const useNotes = () => useContext(NotesContext);

export const NotesProvider = ({ children }) => {
    const [entries, setEntries] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const loaded = await loadEntries();
        setEntries(loaded);
    };

    const addEntry = async (text, title = '') => {
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
    };

    const updateEntry = async (id, newText, newTitle) => {
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
    };

    const deleteEntry = async (id) => {
        const updatedEntries = entries.filter(item => item.id !== id);
        setEntries(updatedEntries);
        await saveEntries(updatedEntries);
    };

    return (
        <NotesContext.Provider value={{ entries, addEntry, updateEntry, deleteEntry }}>
            {children}
        </NotesContext.Provider>
    );
};
