import { startTranscription } from "./transcriber.js";
import { generateAIResponse } from "./aiResponse.js";
import { playAIResponse } from "./textToSpeech.js";

export const startRealTimeCall = async (assistant) => {
  console.log("🎙 AI is now listening in real-time...");

  const restartListening = () => {
    console.log("🎤 Restarting microphone...");
    startTranscription(onSpeechDetected);
  };

  const onSpeechDetected = async (userText) => {
    console.log(`🎙 User said: ${userText}`);

    const aiResponse = await generateAIResponse(userText, assistant);
    console.log(`🤖 AI Response: ${aiResponse}`);

    await playAIResponse(aiResponse, restartListening);
  };

  startTranscription(onSpeechDetected);
};


const caller = {
  _id: "67a7b4aebc42a7623b0212fb",
  name: "Mr Imran Khan",
  personality: "Friendly, helpful, and patient.",
  project: {
    _id: "67a73c301e7e86cd1f8fdb30",
    name: "Telemarketing campaign",
    description: "We recently completed our new Ai Saas product, Our Ai saas product can handle incoming and outgoing call for automate the sales persion. Now business do not need human sales persion. Our Ai agent can handle incoming and outgoing call. So we want reach out to our potential client for approach them to purchase our subscriptions.",
  },
  introductionPlayed: false,
  defaultScript: "You are a smart sales persion, Who are always follow the project details and try to approach the client based on project requirements. And always act like human.",
  introductionPlayed: false,
};
startRealTimeCall(caller);