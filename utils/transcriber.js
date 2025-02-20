import { AssemblyAI } from "assemblyai";
import mic from "mic";
import { ASSEMBLYAI_API_KEY } from "./config.js";

let isAIResponding = false; // ✅ Prevent multiple responses

export const startTranscription = async (onSpeechDetected) => {
  const transcriber = new AssemblyAI({ apiKey: ASSEMBLYAI_API_KEY }).realtime.transcriber({
    sampleRate: 48000,
    formatText: false,  
    interimResults: true,
  });

  const micInstance = mic({
    rate: "16000",
    channels: "1",
    debug: false,
    device: "Microphone (Realtek(R) Audio)", // Adjust based on your system
  });

  const micStream = micInstance.getAudioStream();

  transcriber.on("open", () => {
    console.log("✅ WebSocket connected!");
    micInstance.start();
  });

  transcriber.on("error", (error) => console.error("❌ Transcription error:", error));
  transcriber.on("close", () => console.log("❌ WebSocket closed"));

  transcriber.on("transcript", async (transcript) => {
    if (isAIResponding) return; // ✅ Ignore new speech while AI is responding

    if (transcript.message_type === "FinalTranscript" && transcript.text.trim()) {
      isAIResponding = true; // ✅ Block new responses until AI finishes

      micInstance.stop(); // ✅ Pause microphone while AI generates response
      await onSpeechDetected(transcript.text);

      isAIResponding = false; // ✅ Allow new responses after AI finishes
      micInstance.start(); // ✅ Restart microphone after AI response finishes
    }
  });

  console.log("🌐 Connecting to transcript service...");
  await transcriber.connect();

  micStream.on("data", (buffer) => {
    if (!isAIResponding) {
      transcriber.sendAudio(buffer);
    }
  });
};
