import Project from '../models/Project.js';

// Create a new project
export const createProject = async (req, res) => {
    try {
        const { name, description, clientData } = req.body;

        const project = new Project({
            name,
            description,
            clientData,
            createdBy: req.user.id, // User who created the project
        });

        await project.save();
        res.status(201).json({ message: 'Project created successfully', project });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get all projects for a user
export const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({ createdBy: req.user.id }).populate('assignedAssistants');
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
