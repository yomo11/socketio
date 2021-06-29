const express = require('express');
const router = express.Router();
//set firebase
var firebase = require('../connections/firebse_client');
var firebaseDb = require('../connections/firebase_admin');
const { check } = require('express-validator');
var cookieParser = require('cookie-parser');
router.use(cookieParser());

let registerUser = require('../public/js/register');
let getFriend = require('../public/js/friendlist');
let insertMsg = require('../public/js/msg');


/*此文件下的路徑皆為user/....*/
router.get('/chatbox', async function (req, res) {
    let username = '';
    let userId = '';
    userId = req.cookies.userId;
    let friend = req.query.fr;


    if (req.cookies.user !== null) {
        username = req.cookies.user;
        userId = req.cookies.userId;
    }
    let contents = await getFriend(firebaseDb, friend, userId, 'getContent');
    res.render('user/chatbox', {
        title: 'chat box',
        name: username,
        friend: friend,
        contents: contents
    });
})
router.post('/chatbox', async function (req, res) {
    let username = '';
    let userId = '';
    let friend = req.query.fr;
    let newMsg = req.body.msgInput
    //console.log('friend', friend);

    if (req.cookies.user !== null) {
        username = req.cookies.user;
        userId = req.cookies.userId;
    }

    let msg = await insertMsg(firebaseDb, username, userId, friend, newMsg, 'insert');
    let contents = await getFriend(firebaseDb, friend, userId, 'getContent');

    res.render('user/chatbox', {
        title: 'chat box',
        name: username,
        friend: friend,
        contents: contents
    });
})

router.get('/chatroom', async function (req, res) {



    let username = '';
    let userId = '';
    if (req.cookies.user !== null) {
        username = req.cookies.user;
        userId = req.cookies.userId;
    }
    let friendlist = await getFriend(firebaseDb, 'none', userId, 'getFriend');

    res.render('user/chatroom', {
        title: 'chat room',
        name: username,
        friendlist: friendlist
    });
})

router.post('/chatroom', async function (req, res) {
    console.log('post chatroom');
    let username = '';
    let userId = '';
    if (req.cookies.user !== null) {
        username = req.cookies.user;
        userId = req.cookies.userId;
    }
    let friendlist = await getFriend(firebaseDb, 'none', userId, 'getFriend');
    // make new friend
    res.render('user/newfriendbox', {
        title: 'make new friend',
        username: username,
        friendlist: friendlist
    });


});

router.get('/register', function (req, res) {
    //將資料title: '登入' 以及name: "jack" render到網址下的user/login
    // Swal('Hello world!');
    res.render('user/register', {
        title: 'Register',
        name: "jack",
        swal: 'none',
        titleMsg: '',
        msg: '',
        icon: ''
    });
})

router.post('/register', async function (req, res) {
    //console.log(req.body);
    let data = req.body;
    let errormsg = await registerUser(firebaseDb, data.username, data.email, data.password, data.confirm_password, 'register');
    if (errormsg == 'success') {
        res.render('user/register', {
            swal: 'pop',
            title: 'Register',
            name: 'jack',
            titleMsg: 'Register Success!',
            msg: 'You create a new account.',
            icon: 'success'
        });
    }
    else {
        res.render('user/register', {
            swal: 'pop',
            title: 'Register',
            name: 'jack',
            titleMsg: 'Register error!',
            msg: errormsg,
            icon: 'error'
        });
    }

    console.log(errormsg);

});



module.exports = router;