const { Router } = require('express');
const router = Router();
const UserController = require('../controllers/userController');
const { verifyUser } = require('../middleware/authMiddleWare');

// Public routes
router.post('/signup', UserController.signUp);
router.post('/login', UserController.logIn);

// Private routes
router.get('/info', verifyUser, UserController.fetch);
router.get('/info/:username', verifyUser, UserController.search);
router.get('/logout', verifyUser, UserController.logOut);

module.exports = router;