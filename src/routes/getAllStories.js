const express = require('express');
const router = express.Router();

// Import the controller for stories
const getAllStories = require('../controllers/getAllStories');

// Define route for getting all stories
router.get('/', getAllStories);

module.exports = router;
