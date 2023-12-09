const express = require('express');
const router = express.Router();

// Import the controller for stories
const addStoryController = require('../controllers/addStories');

// Define routes for stories
router.route('/').post(addStoryController);

module.exports = router
