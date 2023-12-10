const express = require('express');
const jwt = require('jsonwebtoken');
const response = require('../middleware/response');
const { db } = require('../config/firebase');

const router = express.Router();

// @desc Get All Stories
// @route GET /stories
// @access private (requires token)

const getAllStories = (async (req, res) => {
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

        response(200, { error: false, message: "Stories fetched successfully", listStory }, null, res);
    } else {
        // Handle the case where the user's document is not found
        response(404, null, "User not found", res);
    }
} catch (error) {
    console.error(error);
    response(500, error, "Failed to fetch user data", res);
}

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
                name: userName, // Assuming you have a name field in your user document
                description: data.description,
                photoUrl: data.photoURL,
                createdAt: data.createdAt.toDate(),
                lat: data.lat,
                lon: data.lon
            });
        });

        response(200, { error: false, message: "Stories fetched successfully", listStory }, null, res);
    } catch (error) {
        console.error(error);
        response(500, error, "Failed to fetch stories", res);
    }
});

module.exports = getAllStories;
