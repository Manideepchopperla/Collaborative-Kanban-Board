import Task from '../models/Task.js';
import Board from '../models/Board.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import { getIO } from "../utils/socket.js";

/**
 * Helper function to format a task object for consistent client-side responses.
 * @param {object} task - The Mongoose task document.
 * @returns {object} A formatted task object with a simple 'id' field.
 */
const formatTaskForClient = (task) => ({
    id: task._id,
    boardId: task.boardId,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    assignedTo: task.assignedTo,
    createdBy: task.createdBy,
    createdAt: task.createdAt,
    lastUpdated: task.updatedAt,
    version: task.version,
});

/**
 * Creates a new task and correctly associates it with a board.
 * All real-time events are emitted only to the specific board's room.
 */
export const createTask = async (req, res) => {
    try {
        const { title, description, priority, status, assignedTo, boardId } = req.body;

        const board = await Board.findById(boardId);
        if (!board) {
            return res.status(404).json({ message: 'Board not found' });
        }

        const task = new Task({
            boardId,
            title,
            description,
            priority,
            status,
            assignedTo,
            createdBy: req.user.id
        });
        await task.save();

        board.tasks.push(task._id);
        await board.save();

        const formattedTask = formatTaskForClient(task);
        getIO().to(boardId).emit('task_created', formattedTask);

        const log = new ActivityLog({
            boardId,
            userId: req.user.id,
            username: req.user.username,
            actionType: 'created',
            taskId: task._id,
            taskTitle: task.title
        });
        await log.save();
        
        getIO().to(boardId).emit('activity_log', log.toObject());

        res.status(201).json(formattedTask);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'A task with this title already exists on this board.' });
        }
        console.error('Create task error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Updates a task, handles version conflicts, and emits changes to the correct room.
 */
export const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const currentTask = await Task.findById(id);
        if (!currentTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (updates.version && updates.version !== currentTask.version) {
            return res.status(409).json({
                message: 'Conflict detected: Task was modified by another user.',
                taskId: id,
                yourVersion: updates,
                theirVersion: formatTaskForClient(currentTask)
            });
        }
        
        Object.assign(currentTask, updates);
        currentTask.version += 1;
        const updatedTaskDoc = await currentTask.save();

        const formattedTask = formatTaskForClient(updatedTaskDoc);
        getIO().to(formattedTask.boardId.toString()).emit('task_updated', formattedTask);

        const log = new ActivityLog({
            boardId: formattedTask.boardId,
            userId: req.user.id,
            username: req.user.username,
            actionType: 'updated',
            taskId: formattedTask.id,
            taskTitle: formattedTask.title
        });
        await log.save();

        getIO().to(formattedTask.boardId.toString()).emit('activity_log', log.toObject());

        res.json(formattedTask);
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Deletes a task and its reference from the parent board.
 */
export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const { boardId, title } = task;
        await Task.findByIdAndDelete(id);

        await Board.findByIdAndUpdate(boardId, { $pull: { tasks: id } });

        getIO().to(boardId.toString()).emit('task_deleted', id);

        const log = new ActivityLog({
            boardId,
            userId: req.user.id,
            username: req.user.username,
            actionType: 'deleted',
            taskId: id,
            taskTitle: title
        });
        await log.save();

        getIO().to(boardId.toString()).emit('activity_log', log.toObject());

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Updates a task's status during a drag-and-drop operation.
 */
export const dragDropTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const task = await Task.findById(id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        task.status = status;
        task.version += 1;
        const updatedTaskDoc = await task.save();

        const formattedTask = formatTaskForClient(updatedTaskDoc);
        getIO().to(formattedTask.boardId.toString()).emit('task_moved', formattedTask);
        
        const log = new ActivityLog({
            boardId: formattedTask.boardId,
            userId: req.user.id,
            username: req.user.username,
            actionType: 'moved',
            taskId: formattedTask.id,
            taskTitle: formattedTask.title,
            additionalInfo: `to ${status}`
        });
        await log.save();
        
        getIO().to(formattedTask.boardId.toString()).emit('activity_log', log.toObject());
        
        res.json(formattedTask);
    } catch (error) {
        console.error('Move task error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Assigns a task to the user on the board with the fewest active tasks.
 */
export const smartAssignTask = async (req, res) => {
    try {
        const { id } = req.params;
        const taskToAssign = await Task.findById(id);

        if (!taskToAssign) {
            return res.status(404).json({ message: "Task not found." });
        }

        const board = await Board.findById(taskToAssign.boardId).populate('members', 'username');
        if (!board || !board.members.length) {
            return res.status(404).json({ message: 'Board or members not found.' });
        }

        const tasksOnBoard = await Task.find({ boardId: board._id, status: { $ne: 'done' } });

        const userTaskCounts = board.members.map(member => ({
            username: member.username,
            activeTasks: tasksOnBoard.filter(task => task.assignedTo === member.username).length
        }));
        
        const leastBusyUser = userTaskCounts.reduce((prev, current) => 
            prev.activeTasks <= current.activeTasks ? prev : current
        );
        
        taskToAssign.assignedTo = leastBusyUser.username;
        taskToAssign.version += 1;
        const updatedTaskDoc = await taskToAssign.save();
        
        const formattedTask = formatTaskForClient(updatedTaskDoc);
        getIO().to(board._id.toString()).emit('task_updated', formattedTask);
        
        const log = new ActivityLog({
            boardId: board._id,
            userId: req.user.id,
            username: req.user.username,
            actionType: 'assigned',
            taskId: formattedTask.id,
            taskTitle: formattedTask.title,
            additionalInfo: `to ${leastBusyUser.username}`
        });
        await log.save();
        
        getIO().to(board._id.toString()).emit('activity_log', log.toObject());
        
        res.json(formattedTask);
    } catch (error) {
        console.error('Smart assign error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Resolves an update conflict based on a specified strategy.
 */
export const resolveConflict = async (req, res) => {
    try {
        const { id } = req.params;
        const { resolution, data } = req.body;

        const currentTask = await Task.findById(id);
        if (!currentTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        let finalUpdates = {};

        switch (resolution) {
            case 'merge':
                const theirDesc = data.theirVersion.description || '';
                const yourDesc = data.yourVersion.description || '';
                let mergedDescription;

                if (theirDesc.trim() === yourDesc.trim()) {
                    mergedDescription = theirDesc;
                } else {
                    mergedDescription = [theirDesc, yourDesc]
                        .filter(d => d && d.trim() !== '')
                        .join('\n\n---\n\n');
                }

                finalUpdates = {
                    ...data.theirVersion,
                    ...data.yourVersion,
                    description: mergedDescription,
                };
                break;

            case 'overwrite':
                finalUpdates = { ...data.yourVersion };
                break;

            case 'keep':
                finalUpdates = { ...data.theirVersion };
                break;
                
            default:
                return res.status(400).json({ message: 'Invalid resolution strategy' });
        }

        Object.assign(currentTask, finalUpdates);
        currentTask.version += 1;
        const updatedTaskDoc = await currentTask.save();

        const formattedTask = formatTaskForClient(updatedTaskDoc);
        getIO().to(formattedTask.boardId.toString()).emit('task_updated', formattedTask);

        const log = new ActivityLog({
            boardId: formattedTask.boardId,
            userId: req.user.id,
            username: req.user.username,
            actionType: 'updated',
            taskId: formattedTask.id,
            taskTitle: formattedTask.title,
            additionalInfo: `Conflict resolved with strategy: "${resolution}"`
        });
        await log.save();

        getIO().to(formattedTask.boardId.toString()).emit('activity_log', log.toObject());

        res.json(formattedTask);
    } catch (error) {
        console.error('Resolve conflict error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};