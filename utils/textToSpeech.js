import textToSpeech from "@google-cloud/text-to-speech";
import fs from "fs";
import util from "util";
import path from "path";
import { exec } from "child_process";
import { GOOGLE_CREDENTIALS } from "./config.js";

const client = new textToSpeech.TextToSpeechClient();
const writeFile = util.promisify(fs.writeFile);

export const playAIResponse = async (text, restartListening) => {
  try {
    console.log("🔊 Converting AI response to speech...");

    const request = {
      input: { text },
      voice: { languageCode: "en-US", ssmlGender: "NEUTRAL", name: "en-US-Wavenet-D"},
      audioConfig: { audioEncoding: "MP3", speakingRate: 1.2},
    };

    // ✅ Fix: Properly define response by awaiting the TTS API call
    const [response] = await client.synthesizeSpeech(request);

    const speechPath = path.join("./output/speech.mp3");

    // ✅ Fix: Ensure the response.audioContent exists before saving
    if (!response.audioContent) {
      throw new Error("❌ No audio content received from Google TTS API");
    }

    await writeFile(speechPath, response.audioContent, "binary");
    console.log(`✅ AI Speech saved: ${speechPath}`);

    console.log("🎧 Playing AI response...");
    exec(`ffplay -nodisp -autoexit "${speechPath}"`, (err) => {
      if (err) console.error("❌ Error playing AI response:", err);
      
      console.log("🎙 Restarting microphone...");
      restartListening(); // ✅ Ensure mic restarts after AI finishes speaking
    });
  } catch (error) {
    console.error("❌ Error in AI Speech:", error);
    restartListening(); // ✅ Restart mic even if there's an error
  }
};
