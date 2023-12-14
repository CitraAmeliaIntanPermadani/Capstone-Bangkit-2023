const express = require('express');
const router = express.Router();

// Import multer for handling file uploads
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Import the controller for stories
const addStoryController = require('../controllers/addStories');

// Define route for adding a story
router.post('/', upload.single('photo'), addStoryController);

module.exports = router
