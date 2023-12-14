const express = require('express');
const router = express.Router();

// Import multer for handling file uploads
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Import the controller for stories
const guestAddStoryController = require('../controllers/guestStories');

// Define route for adding a story with a guest account
router.post('/', upload.single('photo'), guestAddStoryController.guestAddStories);

module.exports = router;
