const express = require('express');
const router = express.Router();

// Import the controller for stories
const getDetailStories = require('../controllers/getDetailStories');

// Define route for getting a story by ID
router.get('/:id', getDetailStories);

module.exports = router;
