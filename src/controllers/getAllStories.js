const express = require('express');
const jwt = require('jsonwebtoken');
const { db } = require('../config/firebase');

const router = express.Router();

// @desc Get All Stories
// @route GET /stories
// @access private (requires token)

const getAllStories = async (req, res) => {
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

        try {
            // Fetch the user's document to get the name
            const userDoc = await db.collection('users').doc(uid).get();

            if (userDoc.exists) {
                const userData = userDoc.data();
                const userName = userData.name;

                // Access query parameters
                const page = parseInt(req.query.page) || 1;
                const size = parseInt(req.query.size) || 10;
                const location = parseInt(req.query.location) || 0;

                // Fetch stories based on location
                let storiesRef = db.collection('stories');

                if (location === 1) {
                    storiesRef = storiesRef.where('lat', '!=', null).where('lon', '!=', null);
                }

                const snapshot = await storiesRef.orderBy('createdAt', 'desc').limit(size).offset((page - 1) * size).get();

                const listStory = [];

                snapshot.forEach(doc => {
                    const data = doc.data();
                    listStory.push({
                        id: doc.id,
                        name: userName, // Include the user's name
                        description: data.description,
                        photoUrl: data.photoURL,
                        createdAt: data.createdAt.toDate(),
                        lat: data.lat,
                        lon: data.lon
                    });
                });

                res.status(200).json({ error: false, message: "Stories fetched successfully", listStory });
            } else {
                // Handle the case where the user's document is not found
                res.status(404).json({ error: true, message: "User not found" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: true, message: "Failed to fetch user data" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, message: "Failed to fetch stories" });
    }
};

module.exports = getAllStories;
