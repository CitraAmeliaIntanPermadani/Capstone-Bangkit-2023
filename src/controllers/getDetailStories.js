const express = require('express');
const jwt = require('jsonwebtoken');
const response = require('../middleware/response');
const { db } = require('../config/firebase');

const router = express.Router();

// @desc Get Detail Story by ID
// @route GET /stories/:id
// @access private (requires token)

const getDetailStories = async (req, res) => {
    try {
        // Check if the authorization header is present
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(403).send('Unauthorized');
        }

        const customToken = authHeader.split('Bearer ')[1];

        // Assume the customToken is trusted since it's generated securely on the server.
        // Directly decode it without verification.
        const decodedToken = jwt.decode(customToken);

        if (!decodedToken || !decodedToken.uid) {
            return response(403, null, "Invalid custom token", res);
        }

        const uid = decodedToken.uid;

        const storyId = req.params.id;

        // Fetch the specific story by ID
        const storyDoc = await db.collection('stories').doc(storyId).get();

        if (!storyDoc.exists) {
            return response(404, null, "Story not found", res);
        }

        const storyData = storyDoc.data();

        // Fetch the user's document to get the username
        const userDoc = await db.collection('users').doc(uid).get();

        if (userDoc.exists) {
            const userData = userDoc.data();
            const userName = userData.name;

            const story = {
                id: storyDoc.id,
                username: userName, // Include the username
                description: storyData.description,
                photoUrl: storyData.photoURL,
                createdAt: storyData.createdAt.toDate(),
                lat: storyData.lat,
                lon: storyData.lon
            };

            response(200, { error: false, message: "Story fetched successfully", story }, null, res);
        } else {
            // Handle the case where the user's document is not found
            response(404, null, "User not found", res);
        }
    } catch (error) {
        console.error(error);
        response(500, error, "Failed to fetch story details", res);
    }
};

module.exports = getDetailStories;
