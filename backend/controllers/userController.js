const pool = require('../config');
const queries = require('../queries/userQueries');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const config = require('../config/auth.config');

const handleSignUpError = (err) => {
    let errors = { username: '', email: '', password: '' };
    if (err.constraint === 'users_email_key') {
        errors.email = 'Email already registered';
    } else if (err.message === 'Password length must be greater than 6') {
        errors.password = err.message;
    } else if (err.constraint === 'users_username_key') {
        errors.username = 'Username already taken';
    } else if (err.message === 'Invalid email format') {
        errors.email = 'Enter a valid email';
    }
    return errors;  //otherwise throw other unhandled errors.
}

const handleLogInError = (err) => {
    let errors = { username: '', password: '' };
    if (err.message === 'User not found') {
        errors.username = err.message;
    } else if (err.message === 'Invalid password') {
        errors.password = err.message;
    }
    return errors;
}

// createToken function to generate jwt token, used in logIn function.
const createToken = (id) => {
    return jwt.sign(
        { id: id },
        config.secret,
        { expiresIn: config.jwtExpiration }
    );
};

// @desc    Get all users
// @route   GET /info
// For testing purposes
module.exports.fetch = async (req, res) => {
    try {
        let result = await pool.query(queries.fetch);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// @desc    Search a user by username
// @route   GET /info/:username
// For testing purposes
module.exports.search = async (req, res) => {
    try {
        const { username } = req.params;
        let result = await pool.query(queries.search, [username]);
        if (result.rows.length > 0) {
            res.json(result.rows);
        } else {
            return res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error', error: err });
    }
};

// @desc    Post new user / Register new user
// @route   POST /signup
// @access  Public
module.exports.signUp = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check password length
        if (password.length < 6) {
            throw new Error('Password length must be greater than 6');
        }
        
        //check if the email entered is valid or not:
        if (!validator.isEmail(email)) {
            throw new Error('Invalid email format');
        }
        
        // Hash the password using bcrypt + salt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Insert the new user
        const watchlist_items = 0; // Default value
        const result = await pool.query(queries.signUp, [username, email, hashedPassword]);
        
        // User inserted successfully
        res.status(201).json({ message: 'User signed up successfully', newUser: result.rows[0] });
    } catch (err) {
        console.error(err);
        const errors = handleSignUpError(err);
        res.status(400).json({ errors });
    }
};

// @desc    Login existing user
// @route   POST /login
// @access  Public

module.exports.logIn = async (req, res) => {
    try {
        const { username, password } = req.body;
        let result = await pool.query(queries.search, [username]);
        if (result.rows.length === 0) {
            throw new Error('User not found');
        } else {
            const user = result.rows[0];
            //compare the hashed password
            const auth = await bcrypt.compare(password, user.password);
            if (auth) {
                //generate jwt token
                const token = createToken(user.user_id);
                res.cookie('jwt', token, {
                    httpOnly: true,
                    maxAge: config.jwtExpiration * 1000,
                    secure: process.env.NODE_ENV === 'production', // set to true if using https
                    sameSite: "none",
                });
                
                res.status(200).json({ 
                    message: 'User logged in successfully',
                    user: {
                        id: user.user_id,
                        username: user.username,
                        email: user.email
                    }
                });
            } else {
                throw new Error('Invalid password');
            }
        }
    } catch (err) {
        console.error(err);
        const errors = handleLogInError(err);
        res.status(401).json({ errors });
    }
};

// @desc    LogOut a session
// @route   GET /logout
// @access  Private
module.exports.logOut = (req, res) => {
    res.cookie('jwt', "", {
        httpOnly: true,
        maxAge: -1,
        secure: process.env.NODE_ENV === 'production', // set to true if using https
        sameSite: "none",
    });   //negative maxAge so that the cookie expires immediately
    res.status(200).json({ message: 'User logged out successfully' });
};