const bcrypt = require('bcrypt');
const express = require('express');
const User = require('./models/user');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');

mongoose.connect('mongodb://localhost:27017/authDemo', {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => {
    console.log('We are on Mongo, connection is open.')
})
.catch(err => {
    console.log("Mongo error: " + err)
});

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(session({secret: 'badsecret'})); // do not use it in production!

app.listen(3000, () => {
    console.log('Server is up on 3000');
})

// routes

const requireLogin = (req, res, next) => { // login middleware
    if(!req.session.user_id){
        return res.redirect('/login')
    }
    next ()
};

app.get('/', (req, res) => {
    res.send('Homepage')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async (req, res) => {
    const {password, username} = req.body;
    const user = new User({ username, password }); // hashing in the model (do not save a password as a string!)
    await user.save();
    req.session.user_id = user._id;
    res.redirect('/secret')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', async (req, res) => {
    const {password, username} = req.body;
    const foundUser = await User.findAndValidate(username, password);
    if(foundUser){
        req.session.user_id = foundUser._id;
        res.redirect('/secret');
    }
    else {
        res.redirect('/login')
    }
});

app.post('/logout', (req, res) => {
    req.session.user_id = null; // req.session.destroy() if there is more info to be erased
    res.redirect('/login');
})

app.get('/secret', requireLogin, (req, res) => {
    res.render('secret')
})

// hash tests

// // const hashPassword = async (pw) => {
// //     const salt = await bcrypt.genSalt(10); // password salt
// //     const hash = await bcrypt.hash(pw, salt); // password hash
// //     console.log(hash);
// // };

// const hashPassword = async (pw) => {
//     const hash = await bcrypt.hash(pw, 12); // password hash with salt included
//     console.log(hash);
// };

// const login = async (pw, hashedPw) => {
//     const result = await bcrypt.compare(pw, hashedPw);
//     if (result){
//         console.log('Success')
//     } else {
//         console.log('Wrong password.')
//     }
// };

// // hashPassword('gabriel');

// hashPassword('123456');
// login('1234567', '$2b$12$1AEpzh26Z6GuEzG.u./Q1.iqgk74vmwj8z4d6WOTWE1ZT01srdiEO');