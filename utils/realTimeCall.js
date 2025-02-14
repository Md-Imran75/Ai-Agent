import WebSocket from "ws";
import axios from "axios";
import dotenv from "dotenv";
import { exec } from "child_process";
import fs from "fs";
import util from "util";
import mic from "mic";
import path from "path";
import { OpenAI } from "openai";
import textToSpeech from "@google-cloud/text-to-speech";

dotenv.config();

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GOOGLE_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const ttsClient = new textToSpeech.TextToSpeechClient();

// 🔥 AI Assistant Status
let isAIResponding = false;

// 🔥 Start AI Listening
export const startRealTimeCall = async (assistant) => {
  console.log("🎙 AI is now listening in real-time...");

  const ws = new WebSocket("wss://api.assemblyai.com/v2/realtime/ws", {
    headers: { Authorization: ASSEMBLYAI_API_KEY },
  });

  // Setup microphone input
  const micInstance = mic({
    rate: "16000",
    channels: "1",
    debug: false,
    device: "Line 1 (Virtual Audio Cable)", // Ensure Google Voice uses this as input
  });

  const micStream = micInstance.getAudioStream();
  const audioChunks = [];

  ws.on("open", () => {
    console.log("✅ Connected to AssemblyAI Streaming API");
    micInstance.start();
  });

  ws.on("message", async (data) => {
    const message = JSON.parse(data);

    if (message.message_type === "PartialTranscript") {
      console.log(`📝 Live Transcript: ${message.text}`);
    }

    if (message.message_type === "FinalTranscript" && message.text.trim()) {
      console.log(`🎙 User said: ${message.text}`);
      
      micInstance.stop();
      await processUserSpeech(message.text, assistant);
      micInstance.start();
    }
  });

  micStream.on("data", (chunk) => {
    if (!isAIResponding) {
      ws.send(chunk);
    }
  });

  ws.on("close", () => console.log("❌ WebSocket closed"));
};

// 🔥 Process User Speech & Generate AI Response
const processUserSpeech = async (userText, assistant) => {
  try {
    console.log("🤖 Generating AI response...");

    const systemMessage = `
      You are ${assistant.name}, an AI assistant for ${assistant.project.name}.
      Role: ${assistant.defaultScript}
      Personality: ${assistant.personality}
      Campaign Description: ${assistant.project.description}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "system", content: systemMessage }, { role: "user", content: userText }],
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiResponse = response.choices[0].message.content.trim();
    console.log(`🤖 AI Response: ${aiResponse}`);

    await playAIResponse(aiResponse);
  } catch (error) {
    console.error("❌ Error generating AI response:", error);
  }
};

// 🔥 Convert AI Text Response to Speech & Play in Google Voice
const playAIResponse = async (text) => {
  try {
    console.log("🔊 Converting AI response to speech...");
    isAIResponding = true;

    const request = {
      input: { text },
      voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
      audioConfig: { audioEncoding: "MP3" },
    };

    const [response] = await ttsClient.synthesizeSpeech(request);
    const speechPath = path.join(__dirname, "../output/speech.mp3");

    await util.promisify(fs.writeFile)(speechPath, response.audioContent, "binary");
    console.log(`✅ AI Speech saved: ${speechPath}`);

    // Play through Virtual Audio Cable (Google Voice input)
    console.log("🎧 Playing AI response...");
    exec(`ffplay -nodisp -autoexit -i "${speechPath}" -f dshow -i "Line 1 (Virtual Audio Cable)"`, (err) => {
      if (err) console.error("❌ Error playing AI response:", err);
      isAIResponding = false;
    });
  } catch (error) {
    console.error("❌ Error in AI Speech:", error);
    isAIResponding = false;
  }
};
