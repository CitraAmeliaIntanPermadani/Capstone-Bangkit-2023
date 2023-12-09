const bcrypt = require('bcrypt')
const response = require('../middleware/response')
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
            name : req.body.username, // sintia
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
                response(201,sendUserAuth,"User Created Successfully",res)
                console.log('Success Create User');
            })
    } catch (error) {
        response(400,error,"Failed To Create User",res)
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
            return response(401, null, "Invalid credentials", res);
        }

        const hashedPassword = userDoc.data().password;

        // 3. Compare the provided password with the hashed password from Firestore
        const isPasswordValid = await bcrypt.compare(password, hashedPassword || '');

        if (!isPasswordValid) {
            return response(401, null, "Invalid credentials", res);
        }

        // 4. Generate a JWT token for the authenticated user
        const token = await auth.createCustomToken(userRecord.uid);

        // 5. Send the token in the response
        response(200, { token }, "Login successful", res);
    } catch (error) {
        response(400, error, "Failed to login", res);
        console.error(error);
    }
}


module.exports = {
    register,
    login
}