import mic from "mic";
import fs from "fs";

console.log("🎤 Recording audio for 5 seconds...");
const micInstance = mic({
  rate: "16000",
  channels: "1",
  debug: true,
  fileType: "wav",
});

const micInputStream = micInstance.getAudioStream();
const outputFile = fs.createWriteStream("test_audio.wav");

micInputStream.pipe(outputFile);

micInstance.start();
setTimeout(() => {
  micInstance.stop();
  console.log("🛑 Recording stopped. Check `test_audio.wav`.");
}, 5000);
