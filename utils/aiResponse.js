import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let conversationHistory = new Map(); // Stores conversation history
let responseCache = new Map(); // Caches AI responses

export const generateAIResponse = async (userText, caller, isFirstInteraction = false) => {
  try {
    console.log("🤖 Generating AI response...");

    const systemMessage = `
      You are ${caller.name}, an Sales person created to handle calls for this project details: ${caller.project.description}.
      Your role: ${caller.defaultScript}
      Campaign Description: ${caller.project.description}
      Stay professional, match the assistant's personality (${caller.personality}), and provide relevant responses.
      If you don't know the answer, say "I'm sorry, I don't know the answer to that question."
      Don't answer questions not related to this project description: ${caller.project.description}.
      Don't generate text with emojis or special characters.
      You should be friendly and helpful.
      You should be patient.
      You need handle the call smartly and efficiently. 
    `;

    if (!conversationHistory.has(caller._id)) {
      conversationHistory.set(caller._id, []);
    }

    if (isFirstInteraction) {
      return `Hello! My name is ${caller.name}. I am handling calls for ${caller.project.name}. How can I assist you today?`;
    }

    conversationHistory.get(caller._id).push({ role: "user", content: userText });

    if (responseCache.has(userText)) {
      return responseCache.get(userText);
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemMessage },
        ...conversationHistory.get(caller._id),
      ],
      temperature: 0.4,
      max_tokens: 150,
    });

    const aiResponse = response.choices[0].message.content.trim();
    conversationHistory.get(caller._id).push({ role: "assistant", content: aiResponse });
    responseCache.set(userText, aiResponse);

    return aiResponse;
  } catch (error) {
    console.error("❌ Error generating AI response:", error);
    return "I'm sorry, I didn't understand that.";
  }
};
