
import ActivityLog from '../models/ActivityLog.js';

export const getRecentLogsForBoard = async (req, res) => {
    try {
        const { boardId } = req.params;
        const logs = await ActivityLog.find({ boardId })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        const formattedLogs = logs.map(log => ({
            id: log._id,
            userId: log.userId,
            username: log.username,
            actionType: log.actionType,
            taskId: log.taskId,
            taskTitle: log.taskTitle,
            additionalInfo: log.additionalInfo,
            timestamp: log.createdAt
        }));

        res.json(formattedLogs);
    } catch (error) {
        console.error('Get logs error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};