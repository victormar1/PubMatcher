const getData = require('../services/dataservice.js');
const crypto = require('crypto');
const pool = require('../models/db.js');

/**
 * Controller to handle search requests (GET and POST)
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
exports.search = async (req, res) => {
    try {
        const genes = req.method === 'POST' ? req.body.genes : req.query.genes;
        const phenotypes = req.method === 'POST' ? req.body.phenotypes : req.query.phenotypes;
        const userId = req.body.userId ;
        
        //hash the query for easy compar
        const queryHash = crypto.createHash('sha256').update(`${genes.join(',')}:${phenotypes.join(',')}`).digest('hex');

        // Check or insert
        const queryInsert = await pool.query(
            `
            INSERT INTO researched_queries (query_hash, genes, phenotypes)
            VALUES ($1, $2, $3)
            ON CONFLICT (query_hash)
            DO UPDATE SET last_used_at = CURRENT_TIMESTAMP
            RETURNING *;
            `,
            [queryHash, genes.join(','), phenotypes.join(',')]
        );

        const query = queryInsert.rows[0];
        
        if (userId) { //If logged
            await pool.query(
                'INSERT INTO search_history (user_id, query_id, timestamp) VALUES ($1, $2, CURRENT_TIMESTAMP)',
                [userId, query.id] //save as history entry
            );
        }

        // Check for cached results
        const cachedResult = await pool.query(
            'SELECT * FROM query_results WHERE query_id = $1 AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)',
            [query.id]
        );

        if (cachedResult.rows.length > 0) {
            return res.json({ cached: true, results: cachedResult.rows[0].result_data });
        }


        //If no result in db just fetch apis
        const queryParams = { body: { genes, phenotypes } };
        const apiResults = await getData(queryParams);


        // Save the new results in db / where FK is research ID
        await pool.query(
            'INSERT INTO query_results (query_id, result_data, expires_at) VALUES ($1, $2::jsonb, $3)',
            [query.id, JSON.stringify(apiResults), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
        );


        res.json({ cached: false, results: apiResults });
    } catch (error) {
        console.error('Error during search:', error);
        res.status(500).send('Internal Server Error');
    }
};
