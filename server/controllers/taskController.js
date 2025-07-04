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

    // Check for conflicts
    const currentTask = await db.getTaskById(id);
    if (!currentTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Simple conflict detection based on version
    if (updates.version && updates.version !== currentTask.version) {
      // Conflict detected
      getIO().emit('conflict_detected', {
        taskId: id,
        yourVersion: updates,
        theirVersion: currentTask
      });
      return res.status(409).json({
        message: 'Conflict detected',
        yourVersion: updates,
        theirVersion: currentTask
      });
    }

    const task = await db.updateTask(id, updates);

    // Emit to all connected clients
    getIO().emit('task_updated', task);

    // Log activity
    await db.createLog({
      userId: req.user.id,
      username: req.user.username,
      actionType: 'updated',
      taskId: task.id,
      taskTitle: task.title
    });

    const log = await db.getLatestLog();
    getIO().emit('activity_log', log);

    res.json(task);
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
    
    let updates = {};
    
    switch (resolution) {
      case 'merge':
        // Simple merge strategy - combine both versions
        updates = {
          ...data.theirVersion,
          ...data.yourVersion,
          lastUpdated: new Date().toISOString()
        };
        break;
      case 'overwrite':
        updates = {
          ...data.yourVersion,
          lastUpdated: new Date().toISOString()
        };
        break;
      case 'keep':
        updates = {
          ...data.theirVersion,
          lastUpdated: new Date().toISOString()
        };
        break;
    }
    
    const task = await db.updateTask(id, updates);
    
    // Emit to all connected clients
    getIO().emit('task_updated', task);
    
    res.json(task);
  } catch (error) {
    console.error('Resolve conflict error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

