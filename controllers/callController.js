import Assistant from '../models/Assistant.js';
import { initiateCall } from '../utils/googleVoiceBot.js';

// API to make a call
export const makeCall = async (req, res) => {
    try {
        const { phoneNumber, assistantId } = req.body;

        if (!phoneNumber || !/^\+\d{10,15}$/.test(phoneNumber)) {
            return res.status(400).json({ message: 'Invalid phone number format. Use E.164 format.' });
        }

        const assistant = await Assistant.findById(assistantId);
        if (!assistant) {
            return res.status(404).json({ message: "Assistant not found." });
        }

        await initiateCall(phoneNumber, assistant)
            .then(() => {
                res.status(200).json({ message: `Call initiated to ${phoneNumber}` });
            })
            .catch((error) => {
                console.error("❌ Error initiating call:", error);
                res.status(500).json({ message: "Call initiation failed", error: error.toString() });
            });

    } catch (error) {
        console.error("❌ Server Error:", error);
        res.status(500).json({ message: 'Call initiation failed', error });
    }
};
