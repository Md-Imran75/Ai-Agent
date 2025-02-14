import mongoose from "mongoose";

const assistantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    personality: {
      type: String,
      required: true, // Defines the AI agent's tone and response style
    },
    project: {
      type: Object,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    defaultScript: {
      type: String,
      required: true, // Ensures every assistant has a default script
    },
  },
  { timestamps: true }
);

const Assistant = mongoose.model("Assistant", assistantSchema);
export default Assistant;
