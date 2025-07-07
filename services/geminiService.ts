
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Category, Program, ProgramDay, DevotionContent, PrayerContent, MeditationContent, AccountabilityContent } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getCategoryPromptDetails = (category: Category) => {
    switch (category) {
        case Category.DEVOTION:
            return `For 'Daily Devotion', each day's content must be a JSON object with keys: "scripture" (e.g., "Philippians 4:6-7"), "prayer" (a 1-2 sentence prayer related to the scripture), and "declaration" (a short, powerful "I am..." or "God is..." statement).`;
        case Category.PRAYER:
            return `For 'Daily Prayer', use the ACTS model. Each day's content must be a JSON object with keys: "adoration" (a prompt to praise God), "confession" (a prompt for repentance), "thanksgiving" (a prompt for gratitude), and "supplication" (a prompt for requests).`;
        case Category.MEDITATION:
            return `For 'Daily Meditation', each day's content must be a JSON object with keys: "scripture" (a short, reflective verse), "prompt1" (a question about what the scripture reveals about God), and "prompt2" (a question about how to apply the scripture).`;
        case Category.ACCOUNTABILITY:
            return `For 'Daily Accountability', each day's content must be a JSON object with keys: "scripture" (a verse for strength), "declaration" (a statement of truth to combat temptation), and "alternativeAction" (a practical, healthy alternative to the user's struggle).`;
        default:
            return '';
    }
}

export const generateProgram = async (category: Category, topic: string): Promise<Program> => {
    const categoryInstructions = getCategoryPromptDetails(category);

    const prompt = `
        You are DSCPL, an empathetic and wise AI spiritual assistant. 
        A user is seeking guidance on "${topic}" within the category of "${category}".
        Generate a 7-day spiritual program for them.
        The entire response MUST be a valid JSON array.
        The array should contain 7 objects, one for each day.
        Each object in the array must have two keys: "day" (a number from 1 to 7) and "content".
        The "content" key must hold a JSON object structured exactly as follows for the specified category:
        ${categoryInstructions}
        Tailor the content to be encouraging and directly relevant to the user's topic: "${topic}".
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.7,
            },
        });

        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
          jsonStr = match[2].trim();
        }

        const parsedData = JSON.parse(jsonStr) as ProgramDay[];

        // Basic validation
        if (!Array.isArray(parsedData) || parsedData.length !== 7) {
            throw new Error("Invalid data structure received from API.");
        }

        return parsedData;

    } catch (e) {
        console.error("Failed to generate program:", e);
        throw new Error("I had trouble creating your plan. Please try again.");
    }
};

export const createChat = (): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash-preview-04-17',
        config: {
            systemInstruction: 'You are DSCPL, a personal spiritual assistant. Your goal is to be a supportive and encouraging guide for the user on their spiritual journey. You are warm, empathetic, and wise. You can talk about faith, life challenges, or just be a listening ear. Ground your responses in principles of Christian faith when appropriate, but maintain a conversational and non-judgmental tone.',
            temperature: 0.8,
        },
    });
};
