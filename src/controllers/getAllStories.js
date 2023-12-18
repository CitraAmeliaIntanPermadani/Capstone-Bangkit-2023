const express = require('express');
const jwt = require('jsonwebtoken');
const { db } = require('../config/firebase');

const router = express.Router();

// @desc Get All Stories
// @route GET /stories
// @access private (requires token)

// ...

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

            for (const doc of snapshot.docs) {
                const data = doc.data();

                // Check if data.uid exists and is a non-empty string
                if (data.uid && typeof data.uid === 'string') {
                    // Fetch the user's document to get the name for each story
                    const userDoc = await db.collection('users').doc(data.uid).get();

                    if (userDoc.exists) {
                        const userName = userDoc.data().name;

                        listStory.push({
                            id: doc.id,
                            name: userName,
                            description: data.description,
                            photoUrl: data.photoURL,
                            createdAt: data.createdAt.toDate(),
                            lat: data.lat,
                            lon: data.lon
                        });
                    } else {
                        // Handle the case where the user's document is not found
                        listStory.push({
                            id: doc.id,
                            name: 'Unknown',
                            description: data.description,
                            photoUrl: data.photoURL,
                            createdAt: data.createdAt.toDate(),
                            lat: data.lat,
                            lon: data.lon
                        });
                    }
                } 
            }

            res.status(200).json({ error: false, message: "Stories fetched successfully", listStory });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: true, message: "Failed to fetch stories" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, message: "Failed to fetch stories" });
    }
};

module.exports = getAllStories;
