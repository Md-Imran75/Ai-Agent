import mongoose from "mongoose";

// Define call log schema
const callLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  caller: String,
  transcript: String,
  aiResponse: String,
});

const CallLog = mongoose.model("CallLog", callLogSchema);

// Save call logs in MongoDB
export const saveCallLog = async (caller, transcript, aiResponse) => {
  try {
    const logEntry = new CallLog({ caller, transcript, aiResponse });
    await logEntry.save();
    console.log("📝 Call transcript saved to database.");
  } catch (error) {
    console.error("❌ Error saving call log:", error);
  }
};
