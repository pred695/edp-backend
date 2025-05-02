const jwt = require('jsonwebtoken');
const pool = require('../config');
const queries = require('../queries/userQueries');
const config = require('../config/auth.config');

// Middleware to verify the user, used in protected routes
module.exports.verifyUser = (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (token) {
            jwt.verify(
                token,
                config.secret,
                async (err, decodedToken) => {
                    if (err) {
                        console.error(err);
                        res.status(401).json({ message: 'Unauthorized' });
                    } else {
                        const user_id = decodedToken.id;
                        let result = await pool.query(queries.searchById, [user_id]);
                        const user = result.rows[0];
                        res.locals.user = user;
                        next();
                    }
                }
            );
        } else {
            res.status(401).json({ message: 'Unauthorized' }); // Return an unauthorized response
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Check if user has admin role
module.exports.isAdmin = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        
        const decodedToken = jwt.verify(token, config.secret);
        const user_id = decodedToken.id;
        
        // Here you would check if the user has admin role
        // For now, we'll just check if the user exists
        let result = await pool.query(queries.searchById, [user_id]);
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        
        // Add admin role check here when implementing role-based access
        // For example: if (result.rows[0].role !== 'admin')
        
        next();
    } catch (err) {
        console.error(err);
        res.status(401).json({ message: 'Unauthorized' });
    }
};