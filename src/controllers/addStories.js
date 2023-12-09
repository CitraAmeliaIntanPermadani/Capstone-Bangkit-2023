const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const instance = require('../config/firebase');
const response = require('../middleware/response');


const router = express.Router();
const db = instance.db;
const auth = instance.auth;

// Multer configuration for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// @desc Add New Story
// @route POST /stories
// @access private ( requires token )

router.post('/addStories', upload.single('photo'), async (req, res) => {
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

        // Fetch user data using the UID
        const userDoc = await db.collection('users').doc(uid).get();

        if (!userDoc.exists) {
            return response(404, null, "User not found", res);
        }

        // Access other form fields from the request body
        const description = req.body.description;
        const lat = req.body.lat;
        const lon = req.body.lon;

        // Handle the uploaded photo
        const photo = req.file;
        if (!photo) {
            return response(400, null, "Photo is required", res);
        }

        // Here, you can process the photo, save it to storage, and get a URL
        // For simplicity, let's assume you save it to a variable called photoURL
        const photoURL = 'gs://testing-406904.appspot.com';

        // Save the new story to the database
        await db.collection('stories').add({
            uid: uid,
            description: description,
            photoURL: photo,
            lat: lat || null,
            lon: lon || null,
            createdAt: new Date(),
        });

        response(200, { error: false, message: "success" }, "Story added successfully", res);
    } catch (error) {
        console.error(error);
        response(400, error, "Failed to add new story", res);
    }
});

module.exports = router;
