import { OpenAI } from "openai";
import { OPENAI_API_KEY } from "./config.js";

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export const generateAIResponse = async (userText, assistant) => {
  try {
    console.log("🤖 Generating AI response...");

    const systemMessage = `
      You are ${assistant.name}, an AI assistant for ${assistant.project.name}.
      Role: ${assistant.defaultScript}
      Personality: ${assistant.personality}
      Campaign Description: ${assistant.project.description}

      If you don't know the answer, say "I'm sorry, I don't know the answer to that question."
      Don't answer questions not related to this project description: ${assistant.project.description}
      Don't generate text with emojis or special characters.
      Don't generate text with any Links and images and code blocks and tables 
      You should be friendly and helpful.
      You should be patient.
      You need handle the call smartly and efficiently.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "system", content: systemMessage }, { role: "user", content: userText }],
      temperature: 0.5,
      max_tokens: 120,
      stream:  true
    });

    let aiResponse = "";
    for await (const chunk of response) {
      if (chunk.choices && chunk.choices[0].delta && chunk.choices[0].delta.content) {
        aiResponse += chunk.choices[0].delta.content;
        process.stdout.write(chunk.choices[0].delta.content); // ✅ Show response live
      }
    }

    return aiResponse.trim();

    // ✅ **Fix: Ensure response exists before accessing `content`**
    // if (!response || !response.choices || response.choices.length === 0 || !response.choices[0].message) {
    //   console.error("❌ OpenAI API returned an invalid response:", response);
    //   return "I'm sorry, I didn't understand that.";
    // }

    // return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("❌ Error generating AI response:", error);
    return "I'm sorry, I didn't understand that.";
  }
};
