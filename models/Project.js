import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    clientData: {
        type: Array, // Client list (phone numbers, names, etc.)
        required: true,
    },
    assignedAssistants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assistant',
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
