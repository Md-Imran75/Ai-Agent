import mic from "mic";

const micInstance = mic({
  rate: "16000",
  channels: "1",
  debug: true,
  device: "WO Mic Device", // Or try "Microphone (WO Mic Device)"
});

const micStream = micInstance.getAudioStream();
micInstance.start();
console.log("🎤 Microphone test started... Speak now!");

micStream.on("data", (data) => {
  console.log(`🔊 Received audio chunk (${data.length} bytes)`);
});

micStream.on("error", (err) => {
  console.error("❌ Microphone error:", err);
});

setTimeout(() => {
  console.log("🛑 Stopping mic test.");
  micInstance.stop();
  process.exit();
}, 10000);
