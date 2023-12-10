const express = require('express');
const router = express.Router();

// Import multer for handling file uploads
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Import the controller for stories
const getAllStories = require('../controllers/getAllStories');

// Define route for adding a story
router.get('/get', getAllStories);

module.exports = router
