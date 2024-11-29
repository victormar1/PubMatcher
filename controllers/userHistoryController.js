const pool = require('../models/db.js');

/**
 * Controller to fetch user search history
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
exports.getHistory = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId; 

        if (!userId) {
            return res.status(401).json({ error: 'User is not authenticated' });
        }

        // Pagination parameters if we need to add filtering ?? 
        const page = parseInt(req.query.page, 10) || 1;
        const pageSize = parseInt(req.query.pageSize, 10) || 10;
        const offset = (page - 1) * pageSize;

        // Fetch the user's search history
        const history = await pool.query(
            `
            SELECT h.timestamp, q.genes, q.phenotypes
            FROM search_history h
            JOIN researched_queries q ON h.query_id = q.id
            WHERE h.user_id = $1
            ORDER BY h.timestamp DESC
            LIMIT $2 OFFSET $3;
            `,
            [userId, pageSize, offset]
        );

        // Get total count for pagination metadata
        const total = await pool.query(
            `
            SELECT COUNT(*)
            FROM search_history
            WHERE user_id = $1;
            `,
            [userId]
        );

        res.json({
            history: history.rows,
            page,
            pageSize,
            total: parseInt(total.rows[0].count, 10),
        });
    } catch (error) {
        console.error('Error fetching user history:', error);
        res.status(500).send('Internal Server Error');
    }
};

/**
 * Controller to clear user search history
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
exports.clearHistory = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId;

        if (!userId) {
            return res.status(401).json({ error: 'User is not authenticated' });
        }

        // Delete all history for the user
        await pool.query(
            `
            DELETE FROM search_history
            WHERE user_id = $1;
            `,
            [userId]
        );

        res.status(200).json({ message: 'Search history cleared.' });
    } catch (error) {
        console.error('Error clearing user history:', error);
        res.status(500).send('Internal Server Error');
    }
};
