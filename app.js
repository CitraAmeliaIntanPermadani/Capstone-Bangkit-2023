// Baru mau dipake blm dipake
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()

// Baru kita pake
app.use(express.urlencoded({extended:true}))
app.use(cors());
app.use(bodyParser.json());

// Route ...
app.get('/v1/', (req,res) => {
    res.send('It is US, MicroBizMate - new dev')
})
// 1. auth
app.use('/auth', require('./src/routes/auth'))
// 2. Dashboard
app.use('/dashboard', require('./src/routes/dashboard'))
// 3. addStory
const storiesRouter = require('./src/routes/addStories') // Make sure the path is correct
app.use('/stories', storiesRouter);
// 4. guestAccount
const guestStoriesRouter = require('./src/routes/guestStories');
app.use('/stories/guest', guestStoriesRouter);
// 5. getAllStories
app.use('/stories', require('./src/routes/getAllStories'));
// 6. getDetailStories
app.use('/stories', require('./src/routes/getDetailStories'));

// Jalanin Server
const port = 8080
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})