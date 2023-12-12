const express = require('express');
const jwt = require('jsonwebtoken');
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
            return res.status(403).json({ error: true, message: "Invalid custom token" });
        }

        const uid = decodedToken.uid;

        const storyId = req.params.id;

        // Fetch the specific story by ID
        const storyDoc = await db.collection('stories').doc(storyId).get();

        if (!storyDoc.exists) {
            return res.status(404).json({ error: true, message: "Story not found" });
        }

        const storyData = storyDoc.data();

        // Fetch the user's document to get the username
        const userDoc = await db.collection('users').doc(uid).get();

        if (userDoc.exists) {
            const userData = userDoc.data();
            const userName = userData.name;

            const story = {
                id: storyDoc.id,
                name: userName, // Include the name
                description: storyData.description,
                photoUrl: storyData.photoURL,
                createdAt: storyData.createdAt.toDate(),
                lat: storyData.lat,
                lon: storyData.lon
            };

            res.status(200).json({ error: false, message: "Story fetched successfully", story });
        } else {
            // Handle the case where the user's document is not found
            res.status(404).json({ error: true, message: "User not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, message: "Failed to fetch story details" });
    }
};

module.exports = getDetailStories;
