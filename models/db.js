const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
    user: 'root_user',         
    host: 'mv292669-001.eu.clouddb.ovh.net',   
    database: 'pubmatcher_db',
    password: '5cFXwJep',     // Password 
    port: 35645,                    
});

module.exports = pool;
