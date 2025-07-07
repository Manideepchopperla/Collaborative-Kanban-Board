import db from '../config/database.js';
import { getIO } from "../utils/socket.js"



export const getAllTasks = async (req, res) => {
  try {
    const tasks = await db.getAllTasks();
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, priority, status, assignedTo } = req.body;

    const task = await db.createTask({
      title,
      description,
      priority,
      status,
      assignedTo,
      createdBy: req.user.id
    });

    // Emit to all connected clients
    getIO().emit('task_created', task);

    // Log activity
    await db.createLog({
      userId: req.user.id,
      username: req.user.username,
      actionType: 'created',
      taskId: task.id,
      taskTitle: task.title
    });

    const log = await db.getLatestLog();
    getIO().emit('activity_log', log);

    res.json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Get current task from database
    const currentTask = await db.getTaskById(id);
    if (!currentTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check for conflicts - compare versions
    if (updates.version && updates.version !== currentTask.version) {
      // Conflict detected - return conflict data
      return res.status(409).json({
        message: 'Conflict detected: Task was modified by another user',
        taskId: id,
        yourVersion: updates,
        theirVersion: currentTask
      });
    }

    // No conflict - proceed with update
    const updatedTask = await db.updateTask(id, {
      ...updates,
      version: currentTask.version + 1, // Increment version
      lastUpdated: new Date()
    });

    // Emit to all connected clients EXCEPT the one who made the update
    getIO().emit('task_updated', {
      ...updatedTask,
      updatedBy: req.user.id // Include who made the update
    });

    // Log activity
    await db.createLog({
      userId: req.user.id,
      username: req.user.username,
      actionType: 'updated',
      taskId: updatedTask.id,
      taskTitle: updatedTask.title
    });

    const log = await db.getLatestLog();
    getIO().emit('activity_log', log);

    res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await db.getTaskById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await db.deleteTask(id);

    // Emit to all connected clients
    getIO().emit('task_deleted', id);

    // Log activity
    await db.createLog({
      userId: req.user.id,
      username: req.user.username,
      actionType: 'deleted',
      taskId: id,
      taskTitle: task.title
    });

    const log = await db.getLatestLog();
    getIO().emit('activity_log', log);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const dragDropTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const task = await db.updateTask(id, { status });
    
    // Emit to all connected clients
    getIO().emit('task_moved', task);
    
    // Log activity
    await db.createLog({
      userId: req.user.id,
      username: req.user.username,
      actionType: 'moved',
      taskId: task.id,
      taskTitle: task.title,
      additionalInfo: `to ${status}`
    });
    
    const log = await db.getLatestLog();
    getIO().emit('activity_log', log);
    
    res.json(task);
  } catch (error) {
    console.error('Move task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const smartAssignTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find user with least active tasks
    const users = await db.getAllUsers();
    const tasks = await db.getAllTasks();
    
    const userTaskCounts = users.map(user => ({
      username: user.username,
      activeTasks: tasks.filter(task => 
        task.assignedTo === user.username && task.status !== 'done'
      ).length
    }));
    
    const leastBusyUser = userTaskCounts.reduce((prev, current) => 
      prev.activeTasks < current.activeTasks ? prev : current
    );
    
    const task = await db.updateTask(id, { assignedTo: leastBusyUser.username });
    
    // Emit to all connected clients
    getIO().emit('task_updated', task);
    
    // Log activity
    await db.createLog({
      userId: req.user.id,
      username: req.user.username,
      actionType: 'assigned',
      taskId: task.id,
      taskTitle: task.title,
      additionalInfo: `to ${leastBusyUser.username}`
    });
    
    const log = await db.getLatestLog();
    getIO().emit('activity_log', log);
    
    res.json(task);
  } catch (error) {
    console.error('Smart assign error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const resolveConflict = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution, data } = req.body;

    const currentTask = await db.getTaskById(id);
    if (!currentTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    let updates = {};

    switch (resolution) {
      case 'merge':
        updates = {
          title: data.yourVersion.title || data.theirVersion.title,
          description: [
            data.theirVersion.description,
            data.yourVersion.description
          ].filter(Boolean).join('\n---\n'),
          priority: data.yourVersion.priority || data.theirVersion.priority,
          assignedTo: data.yourVersion.assignedTo || data.theirVersion.assignedTo,
          status: data.yourVersion.status || data.theirVersion.status
        };
        break;
      case 'overwrite':
        updates = { ...data.yourVersion };
        break;
      case 'keep':
        updates = { ...data.theirVersion };
        break;
      default:
        return res.status(400).json({ message: 'Invalid resolution strategy' });
    }

    updates.version = currentTask.version + 1;

    const updatedTask = await db.updateTask(id, updates);

    getIO().emit('task_updated', updatedTask);

    await db.createLog({
      userId: req.user.id,
      username: req.user.username,
      actionType: 'updated',
      taskId: updatedTask.id,
      taskTitle: updatedTask.title,
      additionalInfo: `Resolution strategy: ${resolution}`
    });

    const log = await db.getLatestLog();
    getIO().emit('activity_log', log);

    res.json(updatedTask);
  } catch (error) {
    console.error('Resolve conflict error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


