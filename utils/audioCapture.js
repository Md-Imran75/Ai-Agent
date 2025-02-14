import mic from "mic";
import { Writable } from "stream";
import { transcribeAudio } from "./speechToText.js";
import { generateAIResponse } from "./aiResponse.js";
import { generateSpeech, getAudioDuration, playAIResponse } from "./textToSpeech.js";
import { saveCallLog } from "./callLogs.js";

class AudioProcessor extends Writable {
  constructor(micInstance, caller) {
    super();
    this.audioChunks = [];
    this.micInstance = micInstance;
    this.caller = caller;
    this.lastSpeechTime = Date.now();
    this.isProcessing = false;
    this.isUserSpeaking = false;
    this.isContinuousSpeech = false;
    this.silenceThreshold = 15000; // End call after 15 sec of complete silence
    this.continuousSpeechThreshold = 1000; // Consider user finished speaking if no speech for 3 sec
    this.minSpeechDuration = 1000; // Require minimum 2 sec of actual speech before processing
  }

  _write(chunk, encoding, next) {
    if (global.isAISpeaking) return next(); // Ignore input while AI is speaking

    this.audioChunks.push(chunk);

    // Detect speech activity
    const avgVolume = chunk.reduce((sum, byte) => sum + Math.abs(byte), 0) / chunk.length;

    if (avgVolume > 64) { // Speech threshold
      console.log(`🎙 Speech detected - Volume: ${avgVolume}`);

      // If speech resumes after a pause, reset timer
      if (!this.isContinuousSpeech) {
        console.log("🔄 Resuming speech...");
        this.isContinuousSpeech = true;
      }

      this.lastSpeechTime = Date.now();
      this.isUserSpeaking = true;
    } else {
      console.log(`🔇 Silence detected - Volume: ${avgVolume}`);
    }

    next();
  }

  // Function to calculate average volume from audio chunks
  getAverageVolume(audioChunks) {
    if (!audioChunks.length) return 0; // No audio, return silence

    const totalVolume = audioChunks.reduce((sum, chunk) => {
      return sum + chunk.reduce((sum, byte) => sum + Math.abs(byte), 0) / chunk.length;
    }, 0);

    return totalVolume / audioChunks.length;
  }



  async monitorSpeech() {
    console.log("🎙 AI is actively listening...");

    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Pause if AI is speaking
      if (global.isAISpeaking) {
        console.log("🔇 AI is speaking, pausing silence detection...");
        continue;
      }

      const silenceDuration = Date.now() - this.lastSpeechTime;
      console.log(`⏳ Silence detected: ${silenceDuration} ms`);

      if (silenceDuration >= this.silenceThreshold) {
        console.log("⛔ User silent for too long. Ending the call.");
        this.micInstance.stop();

        // Ensure clean shutdown before exiting
        global.isAISpeaking = false;
        global.isCallActive = false;
        return;
      }

      // **Ensure user speech is fully finished**
      if (this.isUserSpeaking) {
        if (silenceDuration >= this.continuousSpeechThreshold) {
          console.log(`🤔 Checking if speech truly stopped... (Silence: ${silenceDuration} ms)`);

          // Wait longer (3 seconds) before confirming user stopped speaking
          await new Promise((resolve) => setTimeout(resolve, 500));

          const finalSilenceDuration = Date.now() - this.lastSpeechTime;
          const avgVolume = this.getAverageVolume(this.audioChunks);

          if (finalSilenceDuration >= this.continuousSpeechThreshold && avgVolume < 64) {
            console.log("⚠️ User fully stopped speaking. Processing AI response...");

            this.isProcessing = true;
            this.isUserSpeaking = false;
            this.isContinuousSpeech = false;

            this.micInstance.stop();
            await this.finishProcessing();
            break;
          } else {
            console.log("🔄 False alarm! User is still speaking. Resuming listening...");
          }
        }
      }



    }
  }

  async finishProcessing() {
    try {
      console.log("🎙 Processing captured audio...");
      this.micInstance.stop();

      if (this.audioChunks.length === 0) {
        console.log("⚠️ No speech detected. Restarting listening...");
        setTimeout(() => captureAudio(this.caller), 500);
        return;
      }

      console.log("📢 Transcribing speech...");
      const audioBuffer = Buffer.concat(this.audioChunks);
      this.audioChunks = []; // Clear old speech data

      const transcript = await transcribeAudio(audioBuffer);
      console.log("📝 Transcribed Text:", transcript);

      if (!transcript || transcript.trim().length === 0) {
        console.log("⚠️ No speech transcribed. Restarting listening...");
        setTimeout(() => captureAudio(this.caller), 500);
        return;
      }

      console.log("🤖 Generating AI response...");
      const aiResponse = await generateAIResponse(transcript, this.caller);
      console.log("🤖 AI Response:", aiResponse);

      saveCallLog(this.caller, transcript, aiResponse);

      console.log("🔊 Generating speech for AI response...");
      const speechPath = await generateSpeech(aiResponse);
      console.log(`🎧 Playing AI response: ${speechPath}`);

      // Instead of waiting manually, let playAIResponse handle it
      playAIResponse(() => {
        console.log("🎙 Restarting AI listening immediately after AI finishes speaking...");
        captureAudio(this.caller);
      });
    } catch (error) {
      console.error("❌ Error in finishProcessing():", error);
      setTimeout(() => captureAudio(this.caller), 500);
    }
  }

}

export const captureAudio = async (caller) => {
  console.log("🎙 AI is now listening...");

  const micInstance = mic({
    rate: "16000",
    channels: "1",
    debug: true,
    device: "Line 1 (Virtual Audio Cable)",
  });

  const audioProcessor = new AudioProcessor(micInstance, caller);
  micInstance.getAudioStream().pipe(audioProcessor);

  if (!caller.introductionPlayed) {
    console.log("🔊 AI Introduction is being played...");
    const introMessage = await generateAIResponse(null, caller, true);
    await generateSpeech(introMessage);
    caller.introductionPlayed = true;
  }

  micInstance.start();

  audioProcessor.monitorSpeech();
};
