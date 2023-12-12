const express = require('express');
const multer = require('multer');
const { bucket, upload, db } = require('../config/firebase');

const storage = multer.memoryStorage();
const uploadMiddleware = multer({ storage: storage });

// @desc Add New Story with Guest Account
// @route POST /stories/guest
// @access public (no authentication required)

const addGuestStory = uploadMiddleware.single('photo');

const guestAddStories = async (req, res) => {
    try {
        // Access form fields from the request body
        const description = req.body.description;
        const lat = req.body.lat;
        const lon = req.body.lon;

        // Handle the uploaded photo
        const photo = req.file;
        if (!photo) {
            return res.status(400).json({ error: true, message: "Photo is required" });
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
            res.status(500).json({ error: true, message: "Failed to upload photo" });
        });

        stream.on('finish', async () => {
            // Get the public URL of the uploaded photo
            const photoURL = `gs://microbizmate.appspot.com${filename}`;

            // Save the new story to the database
            await db.collection('stories').add({
                description: description,
                photoURL: photoURL,
                lat: lat || null,
                lon: lon || null,
                createdAt: new Date(),
            });

            res.status(200).json({ error: false, message: "success" });
        });

        // Pipe the photo data to the Cloud Storage file stream
        stream.end(photo.buffer);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: true, message: "Failed to add new story" });
    }
};

module.exports = { guestAddStories, addGuestStory };
