import { AssemblyAI } from "assemblyai";
import mic from "mic";
import dotenv from "dotenv";
import { generateAIResponseForText } from "./testAiResponse.js";
import { generateSpeechForTest, playAIResponseForTest } from "./testtospeechfortest.js";

dotenv.config();
const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;

let client;
let transcriber;
let micInstance;
let isProcessing = false;
let isListening = true;
let silenceTimer;
let fullTranscript = "";
let lastSpeechTime = Date.now();

// 🎙 **Start AI Listening**
const startRealTimeTranscription = async () => {
  console.log("🎙 AI is now listening...");

  client = new AssemblyAI({ apiKey: ASSEMBLYAI_API_KEY });
  transcriber = client.realtime.transcriber({ sampleRate: 16000 });

  transcriber.on("open", ({ sessionId }) => {
    console.log(`✅ WebSocket connected! Session ID: ${sessionId}`);
    startMic();
  });

  transcriber.on("error", (error) => {
    console.error("❌ Transcription error:", error);
    restartService();
  });

  transcriber.on("close", () => {
    console.log("🔄 Reconnecting transcription service...");
    restartService();
  });

  transcriber.on("transcript", async (transcript) => {
    if (!transcript.text || transcript.text.trim().length === 0) {
      console.log("⚠️ No meaningful text detected.");
      return;
    }

    console.log(`📝 Partial Transcription: ${transcript.text}`);

    fullTranscript = transcript.text;
    lastSpeechTime = Date.now();

    clearTimeout(silenceTimer);
    silenceTimer = setTimeout(() => {
      console.log("⏳ Processing transcript after delay...");
      processTranscript();
    }, 4000);
  });

  console.log("🌐 Connecting to transcript service...");
  await transcriber.connect();
};

// 🎤 **Start Microphone**
const startMic = () => {
  if (!isListening) return;

  console.log("🎤 Starting microphone...");
  micInstance = mic({
    rate: "16000",
    channels: "1",
    debug: true,
    device: "WO Mic Device", // Ensure your mic name is correct
  });

  const micStream = micInstance.getAudioStream();
  micInstance.start();
  console.log("🎙 Microphone started!");

  micStream.on("data", (data) => {
    if (!transcriber || !transcriber.isConnected) return;
    
    try {
      transcriber.sendAudio(data);
    } catch (err) {
      console.error("❌ Error sending audio to WebSocket:", err.message);
      restartService();
    }
  });

  micStream.on("error", (err) => {
    console.error("❌ Microphone error:", err);
    restartService();
  });

  micStream.on("end", () => {
    console.log("🛑 Microphone stream ended. Restarting...");
    restartService();
  });

  // ✅ **Silence Detection**
  clearTimeout(silenceTimer);
  silenceTimer = setInterval(() => {
    if (Date.now() - lastSpeechTime > 5000 && fullTranscript.trim().length > 0) {
      console.log("🛑 Silence detected. Processing transcript...");
      processTranscript();
    }
  }, 500);
};

// 🔄 **Restart Service if WebSocket Fails**
const restartService = async () => {
  console.log("🔄 Restarting AI Service...");
  try {
    if (micInstance) micInstance.stop();
    if (transcriber) await transcriber.close();
  } catch (err) {
    console.error("❌ Error closing resources:", err.message);
  }
  setTimeout(startRealTimeTranscription, 3000);
};

// 📜 **Process Speech and Generate AI Response**
const processTranscript = async () => {
  if (!fullTranscript.trim() || isProcessing) return;

  isProcessing = true;
  isListening = false;
  console.log(`📝 Final Transcribed Text: ${fullTranscript.trim()}`);

  fullTranscript = fullTranscript
    .split(" ")
    .filter((word, index, arr) => index === 0 || word !== arr[index - 1])
    .join(" ");

  const aiResponse = await generateAIResponseForText(fullTranscript.trim());
  console.log(`🤖 AI Response: ${aiResponse}`);

  fullTranscript = "";

  const speechPath = await generateSpeechForTest(aiResponse);

  await playAIResponseForTest(speechPath, () => {
    console.log("🎙 Restarting microphone...");
    isProcessing = false;
    isListening = true;
    startMic();
  });
};

// 🛑 **Graceful Exit Handling**
process.on("SIGINT", async function () {
  console.log("\n🛑 Stopping microphone...");
  if (micInstance) micInstance.stop();
  console.log("🔌 Closing transcription...");
  if (transcriber) await transcriber.close();
  console.log("👋 Exiting AI.");
  process.exit();
});

// 🎧 **Start AI Listening**
startRealTimeTranscription();
