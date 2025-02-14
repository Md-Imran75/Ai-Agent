import textToSpeech from "@google-cloud/text-to-speech";
import fs from "fs";
import util from "util";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import player from "play-sound";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new textToSpeech.TextToSpeechClient();
const writeFile = util.promisify(fs.writeFile);
const audioPlayer = player();
export const generateSpeechForTest = async (text) => {
  try {
    console.log("🔊 Converting text to speech...");
    const request = {
      input: { text },
      voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
      audioConfig: { audioEncoding: "MP3" },
    };

    const [response] = await client.synthesizeSpeech(request);
    const filePath = path.join(__dirname, "../output/speech.mp3");

    await writeFile(filePath, response.audioContent, "binary");
    console.log(`✅ Speech saved: ${filePath}`);

    return filePath;
  } catch (error) {
    console.error("❌ Error in TTS conversion:", error);
    return null;
  }
};






let isPlaying = false; // Prevent multiple simultaneous playbacks

export const playAIResponseForTest = async (filePath, resumeListening) => {
  try {
    if (isPlaying) {
      console.log("⚠️ AI is already playing audio. Skipping playback.");
      return; // Prevent overlapping playbacks
    }

    if (!fs.existsSync(filePath)) {
      console.error("❌ Error: Speech file not found!");
      resumeListening();
      return;
    }

    console.log("🎧 Playing AI response...");
    isPlaying = true; // Lock playback

    // Play the audio file asynchronously (non-blocking)
    const player = exec(`ffplay -nodisp -autoexit "${filePath}"`, (error) => {
      isPlaying = false; // Unlock playback after completion

      if (error) {
        console.error("❌ Error in AI response playback:", error);
      } else {
        console.log("✅ AI response played.");
      }

      resumeListening(); // Resume microphone listening
    });

    // Avoid blocking execution
    player.on("exit", () => {
      isPlaying = false; // Ensure playback flag resets
      console.log("🎙 AI is now listening again...");
      resumeListening();
    });

  } catch (error) {
    console.error("❌ Error in AI response playback:", error);
    isPlaying = false; // Ensure playback flag resets
    resumeListening();
  }
};

