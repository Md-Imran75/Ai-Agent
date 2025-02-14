import axios from "axios";
import fs from "fs";
import util from "util";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;
const AUDIO_FILE_PATH = path.join(__dirname, "../output/audio.wav");

const writeFile = util.promisify(fs.writeFile);

export const transcribeAudio = async (audioBuffer) => {
  try {
    console.log("🎙 Uploading audio for transcription...");

    // Write the audio buffer to a file
    await writeFile(AUDIO_FILE_PATH, audioBuffer);

    // Upload audio to AssemblyAI
    const uploadResponse = await axios.post(
      "https://api.assemblyai.com/v2/upload",
      fs.createReadStream(AUDIO_FILE_PATH),
      {
        headers: {
          Authorization: ASSEMBLYAI_API_KEY,
          "Content-Type": "application/octet-stream",
        },
      }
    );

    const audioUrl = uploadResponse.data.upload_url;
    console.log(`✅ Audio uploaded: ${audioUrl}`);

    // Request transcription
    const transcribeResponse = await axios.post(
      "https://api.assemblyai.com/v2/transcript",
      {
        audio_url: audioUrl,
        speaker_labels: false,
      },
      {
        headers: {
          Authorization: ASSEMBLYAI_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const transcriptId = transcribeResponse.data.id;
    console.log(`⏳ Waiting for transcription (ID: ${transcriptId})...`);

    // Poll for transcription result
    while (true) {
      const transcriptResponse = await axios.get(
        `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
        {
          headers: {
            Authorization: ASSEMBLYAI_API_KEY,
          },
        }
      );

      if (transcriptResponse.data.status === "completed") {
        console.log("✅ Transcription completed!");
        return transcriptResponse.data.text;
      } else if (transcriptResponse.data.status === "failed") {
        throw new Error("Transcription failed");
      }

      // Wait before polling again
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  } catch (error) {
    console.error("❌ Error transcribing audio:", error);
    return "";
  }
};
