import textToSpeech from "@google-cloud/text-to-speech";
import fs from "fs";
import util from "util";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { exec } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new textToSpeech.TextToSpeechClient();
const writeFile = util.promisify(fs.writeFile);

export const generateSpeech = async (text) => {
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

    console.log("🎧 Playing AI response...");

    execSync(`ffplay -nodisp -autoexit -i "${filePath}" -f dshow -i "audio=Line 1 (Virtual Audio Cable)"`, { stdio: "ignore" });




    console.log("✅ AI response played.");

    return filePath;
  } catch (error) {
    console.error("❌ Error in TTS conversion:", error);
    return null;
  }
};

// Get audio duration using ffprobe
export const getAudioDuration = async (filePath) => {
  try {
    const execPromise = util.promisify(exec);
    const { stdout } = await execPromise(`ffprobe -i "${filePath}" -show_entries format=duration -v quiet -of csv="p=0"`);
    
    const duration = parseFloat(stdout.trim());
    if (isNaN(duration)) {
      console.error("❌ Error extracting audio duration. Using default 5s.");
      return 5; // Default fallback duration
    }
    
    return duration;
  } catch (error) {
    console.error("❌ Error getting audio duration:", error);
    return 5; // Default to 5 seconds if duration extraction fails
  }
};

// Function to play AI response and immediately resume listening
export const playAIResponse = async (resumeListening) => {
  try {
    // Immediately resume listening
    resumeListening();
  } catch (error) {
    console.error("❌ Error in AI response playback:", error);
    global.isAISpeaking = false;
    resumeListening(); // Ensure AI resumes listening even if there's an error
  }
};
