const pool = require('../models/db.js');

async function displayUsers() {
    try {
        // Query to fetch all users
        const result = await pool.query('SELECT * FROM users');
        
        // Display users
        console.log("Users in the database:");
        result.rows.forEach(user => {
            console.log(user);
        });

        return result.rows; // Return users as an array of objects if needed
    } catch (error) {
        console.error("Error fetching users:", error.message);
    }
}


module.exports = {
    displayUsers,
};
