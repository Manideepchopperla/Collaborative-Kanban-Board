import Board from '../models/Board.js';

export const createBoard = async (req, res) => {
  try {
    const newBoard = new Board({
      createdBy: req.user.id,
      members: [req.user.id] 
    });
    await newBoard.save();
    res.status(201).json(newBoard);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getBoardById = async (req, res) => {
    try {
        const board = await Board.findById(req.params.id);

        if (!board) {
            return res.status(404).json({ message: 'Board not found' });
        }

        const isMember = board.members.some(memberId => memberId.toString() === req.user.id);

        if (!isMember) {
            const MAX_MEMBERS = 15;
            if (board.members.length >= MAX_MEMBERS) {
                return res.status(403).json({
                    message: `This board has reached its maximum of ${MAX_MEMBERS} members.`
                });
            }
            board.members.push(req.user.id);
            await board.save();
        }

        const populatedBoard = await Board.findById(req.params.id)
            .populate({
                path: 'tasks',
                options: { sort: { 'createdAt': -1 } },
                transform: (doc) => ({
                    id: doc._id,
                    title: doc.title,
                    description: doc.description,
                    status: doc.status,
                    priority: doc.priority,
                    assignedTo: doc.assignedTo,
                    createdBy: doc.createdBy,
                    createdAt: doc.createdAt,
                    lastUpdated: doc.updatedAt,
                    version: doc.version,
                })
            })
            .populate('members', 'username'); 

        res.json(populatedBoard);

    } catch (error) {
        console.error('Get board by ID error:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};