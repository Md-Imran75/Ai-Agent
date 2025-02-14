import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generateAIResponseForText = async (userText) => {
  try {
    console.log("🤖 Generating AI response...");

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: userText }],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("❌ Error generating AI response:", error);
    return "I'm sorry, I didn't understand that.";
  }
};
