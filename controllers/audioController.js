import { captureAudio } from "../utils/audioCapture.js";

export const startAudioCapture = (req, res) => {
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
  try {
    captureAudio(caller);
    res.status(200).json({ message: "Audio capture started." });
  } catch (error) {
    console.error("❌ Error starting audio capture:", error);
    res.status(500).json({ message: "Failed to start audio capture.", error });
  }
};
