import { format } from 'date-fns';

export const processAICommand = (input, notes, events) => {
    const lowerInput = input.toLowerCase().trim();

    // Help Command
    if (lowerInput === 'help' || lowerInput === 'what can you do?') {
        return {
            type: 'text',
            content: "I can help you manage your notes and events. Try asking:\n\n• \"Show me notes about [keyword]\"\n• \"How many notes do I have?\"\n• \"Show recent notes\"\n• \"Do I have any events today?\"\n• \"List my events\""
        };
    }

    // Stats Command
    if (lowerInput.includes('how many notes') || lowerInput.includes('count notes')) {
        return {
            type: 'text',
            content: `You have ${notes.length} notes saved.`
        };
    }

    // Search Notes Command
    if (lowerInput.includes('show me notes about') || lowerInput.includes('find notes about') || lowerInput.includes('search for')) {
        const keyword = lowerInput.replace('show me notes about', '')
            .replace('find notes about', '')
            .replace('search for', '')
            .trim();

        if (!keyword) {
            return { type: 'text', content: "What would you like me to search for?" };
        }

        const foundNotes = notes.filter(note =>
            (note.title && note.title.toLowerCase().includes(keyword)) ||
            note.content.toLowerCase().includes(keyword)
        );

        if (foundNotes.length === 0) {
            return { type: 'text', content: `I couldn't find any notes matching "${keyword}".` };
        }

        return {
            type: 'list',
            content: `Found ${foundNotes.length} notes matching "${keyword}":`,
            data: foundNotes
        };
    }

    // Recent Notes Command
    if (lowerInput.includes('recent notes') || lowerInput.includes('latest notes')) {
        const recentNotes = [...notes].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);

        if (recentNotes.length === 0) {
            return { type: 'text', content: "You don't have any notes yet." };
        }

        return {
            type: 'list',
            content: "Here are your 5 most recent notes:",
            data: recentNotes
        };
    }

    // Events Today Command
    if (lowerInput.includes('events today') || lowerInput.includes('events for today')) {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const todayEvents = events.filter(event => event.date.startsWith(todayStr));

        if (todayEvents.length === 0) {
            return { type: 'text', content: "You don't have any events scheduled for today." };
        }

        return {
            type: 'text',
            content: `You have ${todayEvents.length} event(s) today:\n` + todayEvents.map(e => `• ${e.title}`).join('\n')
        };
    }

    // List Events Command
    if (lowerInput.includes('list events') || lowerInput.includes('show events')) {
        if (events.length === 0) {
            return { type: 'text', content: "You don't have any upcoming events." };
        }

        // Sort by date
        const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5);

        return {
            type: 'text',
            content: "Here are your upcoming events:\n" + sortedEvents.map(e => `• ${format(new Date(e.date), 'MMM d')}: ${e.title}`).join('\n')
        };
    }

    // Default Fallback
    return {
        type: 'text',
        content: "I'm not sure I understand. Try asking for 'help' to see what I can do."
    };
};
