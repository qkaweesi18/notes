import { format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const DEFAULT_MODEL = 'llama3.2:1b';
// Use 10.0.2.2 for Android Emulator, localhost for Web/iOS
const DEFAULT_URL = Platform.OS === 'web' ? 'http://localhost:11434' : 'http://10.0.2.2:11434';

export const getAIConfig = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem('ai_config');
        return jsonValue != null ? JSON.parse(jsonValue) : { baseUrl: DEFAULT_URL, model: DEFAULT_MODEL };
    } catch (e) {
        return { baseUrl: DEFAULT_URL, model: DEFAULT_MODEL };
    }
};

export const saveAIConfig = async (config) => {
    try {
        await AsyncStorage.setItem('ai_config', JSON.stringify(config));
    } catch (e) {
        console.error('Failed to save AI config', e);
    }
};

// Helper to make the actual API call
const generateAIResponse = async (messages) => {
    const { baseUrl, model } = await getAIConfig();
    const apiUrl = `${baseUrl}/api/chat`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`Status: ${response.status}`);
        }

        const data = await response.json();
        return data.message?.content || '';
    } catch (error) {
        console.error('AI Request Failed:', error);
        return null;
    }
};

export const improvePrompt = async (currentPrompt) => {
    const systemPrompt = `You are an expert Prompt Engineer. Your goal is to rewrite the user's prompt to be more precise, detailed, and effective for an LLM.
    - Keep the intent exactly the same.
    - Make it clearer and more structured.
    - Fix grammar and ambiguity.
    - Output ONLY the rewritten prompt. Do not add quotes or explanations.`;

    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: currentPrompt }
    ];

    const improved = await generateAIResponse(messages);
    return improved ? improved.trim() : currentPrompt; // Fallback to original if fail
};

export const processAICommand = async (input, notes, events) => {
    const { baseUrl } = await getAIConfig();

    // Prepare Context
    const notesContext = notes.map(n => `- Note (ID: ${n.id}): Title: "${n.title || 'Untitled'}", Content: "${n.content}", Date: ${n.timestamp}`).join('\n');
    const eventsContext = events.map(e => `- Event: "${e.title}", Date: ${e.date}, Desc: "${e.description || ''}"`).join('\n');
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    const systemPrompt = `
    You are a helpful personal assistant integrated into a Notes App.
    Current Date: ${todayStr}
    
    Here is the user's data:
    NOTES:
    ${notesContext}
    
    EVENTS:
    ${eventsContext}
    
    Instructions:
    1. First, THINK step-by-step about the user's request. Output your reasoning inside <think>...</think> tags.
    2. Then, provide the FINAL ANSWER to the user.
    3. Use Markdown for formatting (e.g., **bold** for importance).
    4. IMPORTANT: Do NOT include meta-text like "Here is the response" or "Answer:". Just give the answer directly after the thought.
    
    SPECIAL ABILITIES:
    You can CREATE events. If the user asks to schedule something:
    1. Extract details (Title, Date YYYY-MM-DD).
    2. Output a specific JSON action at the very end.
    3. Format:
       <think>User wants a meeting...</think>
       Okay, I've scheduled that for you.
       :::Action::: {"type": "create_event", "data": {"title": "Meeting", "date": "2024-01-01", "type": "work", "description": "Optional"}}
    `;

    try {
        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: input }
        ];

        const rawContent = await generateAIResponse(messages);

        if (!rawContent) {
            return {
                type: 'text',
                content: `Error connecting to Offline Brain (${baseUrl}). \n\nMake sure Ollama is running (OLLAMA_HOST=0.0.0.0) and configured correctly.`
            };
        }

        let thought = null;
        let action = null;
        let finalAnswer = rawContent;

        // 1. Extract Thought
        const thoughtMatch = rawContent.match(/<think>([\s\S]*?)<\/think>/i);
        if (thoughtMatch) {
            thought = thoughtMatch[1].trim();
            finalAnswer = finalAnswer.replace(thoughtMatch[0], '').trim();
        }

        // 2. Extract Action
        const actionRegex = /:{2,3}Action:{2,3}\s*(\{[\s\S]*?\})/i;
        const actionMatch = finalAnswer.match(actionRegex);
        if (actionMatch) {
            try {
                action = JSON.parse(actionMatch[1]);
                finalAnswer = finalAnswer.replace(actionMatch[0], '').trim();
            } catch (e) {
                console.error('Failed to parse AI action:', e);
            }
        }

        // 3. Clean up any remaining meta-artifacts if model hallucinates
        finalAnswer = finalAnswer.replace(/^::Answer::/i, '').replace(/^Answer:/i, '').trim();

        return {
            type: action ? 'action' : 'text',
            content: finalAnswer,
            action: action,
            thought: thought
        };

    } catch (error) {
        console.error('AI Network Error:', error);
        return {
            type: 'text',
            content: `Cannot reach your Offline Brain at ${baseUrl}.\n\n1. Ensure Ollama is installed and running.\n2. Ensure you are on the same Wi-Fi.\n3. Configure the Host IP in settings (e.g., http://YOUR_PC_IP:11434).`
        };
    }
};
