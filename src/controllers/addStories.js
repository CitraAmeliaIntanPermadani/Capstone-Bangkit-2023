const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const instance = require('../config/firebase');
const response = require('../middleware/response');
const { bucket, upload, db, auth } = require('../config/firebase');
// Multer configuration for handling file uploads
const storage = multer.memoryStorage();

// @desc Add New Story
// @route POST /stories
// @access private ( requires token )

const userAddStories = (async (req, res) => {
    try {
        // Check if the authorization header is present
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(403).send('Unauthorized');
        }

        const customToken = authHeader.split('Bearer ')[1];

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
        const filename = `stories/${Date.now()}_${photo.originalname}`;
        const file = bucket.file(filename);
        const stream = file.createWriteStream({
            metadata: {
                contentType: photo.mimetype,
            },
        });

        stream.on('error', (err) => {
            console.error(err);
            response(500, err, "Failed to upload photo", res);
        });

        stream.on('finish', async () => {
            // Get the public URL of the uploaded photo
            const photoURL = `gs://testing-406904.appspot.com/${filename}`;

            // Save the new story to the database
            await db.collection('stories').add({
                uid: uid,
                name : req.body.username,
                description: description,
                photoURL: photoURL,
                lat: lat || null,
                lon: lon || null,
                createdAt: new Date(),
            });

            response(200, { error: false, message: "success" }, "Story added successfully", res);
        });

        // Pipe the photo data to the Cloud Storage file stream
        stream.end(photo.buffer);
    } catch (error) {
        console.error(error);
        response(400, error, "Failed to add new story", res);
    }
});

module.exports = userAddStories;
