import Assistant from '../models/Assistant.js';
import Project from '../models/Project.js';

// Create a new AI assistant
export const createAssistant = async (req, res) => {
    try {
        const { name, personality, projectId, defaultScript } = req.body;

        // Check if the project exists
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const assistant = new Assistant({
            name,
            personality,
            project: project,
            defaultScript,
            createdBy: req.user.id, // AI assistant is linked to a user
        });

        await assistant.save();

        // Add assistant to project's assignedAssistants array
        project.assignedAssistants.push(assistant._id);
        await project.save();

        res.status(201).json({ message: 'Assistant created successfully', assistant });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get all AI assistants for a user
export const getAssistants = async (req, res) => {
    try {
        const assistants = await Assistant.find({ createdBy: req.user.id }).populate('project');
        res.status(200).json(assistants);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
