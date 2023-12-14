const bcrypt = require('bcrypt')
const instance = require('../config/firebase')

// firestore and auth
const db = instance.db
const auth = instance.auth

// @desc Register Account
// @route POST /v1/auth/register
// @access public ( berarti tidak butuh secure atau tidak butuh token )

const register = async (req, res) => {
    try {
        // 1. Ambil data dari frontend
        const userData = {
            name : req.body.name, // sintia
            email : req.body.email, // sintia@gmail.com
            password : req.body.password // 123
        }

        // 2. Kirim userData ke Authentication
        const sendUserAuth = await auth.createUser({
            email : userData.email, // sintia@gmail.com
            password : userData.password, // 123

            emailVerified: false,
            disabled: false,
        })

        // 3. Kirim userData ke Firestore DB
        // Khusus password kita hash 
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(userData.password, salt)

        // Kirim ...
        const sendUserDB = db.collection('users/').doc(sendUserAuth.uid).set({
            uid: sendUserAuth.uid,
            name: userData.name,
            email: userData.email,
            password: hashedPassword
        }) 
            .then(() => {
                res.status(201).json({ error: false, message: "User Created" });
            })
    } catch (error) {
        res.status(400).json({ error: true, message: "Failed To Create User" });
        console.log(error);
    }
}

// @desc Login
// @route POST /v1/auth/login
// @access public
const login = async (req, res) => {
    try {
        // Dari Frontend
        const { email, password } = req.body;

        // 1. Authenticate user using Firebase Admin SDK
        const userRecord = await auth.getUserByEmail(email);

        // 2. Fetch hashed password from Firestore using the UID
        const userDoc = await db.collection('users/').doc(userRecord.uid).get();

        // nama, email, pw, uid

        if (!userDoc.exists) {
            return response(401, "Invalid credentials", res);
        }

        const hashedPassword = userDoc.data().password;

        // 3. Compare the provided password with the hashed password from Firestore
        const isPasswordValid = await bcrypt.compare(password, hashedPassword || '');

        if (!isPasswordValid) {
            return response(401, "Invalid credentials", res);
        }

        // 4. Generate a JWT token for the authenticated user
        const token = await auth.createCustomToken(userRecord.uid);

        // 5. Send the token in the response
        const loginResult = {
            userId: userRecord.uid,
            name: userDoc.data().name,
            token: token
        };

        // 6. Send the token in the response
        res.json({
            error: false,
            message: "success",
            loginResult: {
                userId: userRecord.uid,
                name: userDoc.data().name,
                token: token
            }
        });
    } catch (error) {
        res.status(400).json({ error: true, message: error.message });
        console.log(error);
    }
    };

module.exports = {
    register,
    login
}