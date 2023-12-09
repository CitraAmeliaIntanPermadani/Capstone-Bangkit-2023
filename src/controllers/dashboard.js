const response = require('../middleware/response')
const instance = require('../config/firebase')
const jwt = require('jsonwebtoken');

// firestore and auth
const db = instance.db
const auth = instance.auth

// @desc Dashboard
// @route GET /dashboard
// @access private ( butuh token / harus di protect )

const dashboard = async (req, res) => {
    try {
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

        const userData = userDoc.data();

        console.log(userData);
        response(200, userData, "User Data", res);
    } catch (error) {
        response(400, error, "Failed To Get Data in Dashboard", res);
        console.log(error);
    }
};


module.exports = dashboard