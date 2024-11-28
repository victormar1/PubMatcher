const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
    user: 'root_user',         // Database username
    host: 'mv292669-001.eu.clouddb.ovh.net',    // Hostname or IP address of the database server
    database: 'pubmatcher_db',// Name of the database
    password: '5cFXwJep',     // Password for the database user
    port: 35645,                    // Port number for the database
});

// Export the pool for use in other modules
module.exports = pool;
