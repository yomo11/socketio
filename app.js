let express = require('express');
let path = require('path');
// let flash = require('connect-flash');//flash使用在顯示錯誤十分方便
let session = require("express-session");
let bodyParser = require('body-parser');
let logger = require('morgan');

let app = express();
var cookieParser = require('cookie-parser');
app.use(cookieParser());



//set socket.io connection

const server = require('http').createServer(app);
const io = require('socket.io')(server);

//which port you want
const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log('Server listening at port %d', port);
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));//將view加入路徑
app.engine('ejs', require('express-ejs-extend'));
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'));
// app.use(validator());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(session({ secret: 'mysupersecret', resave: true, saveUninitialized: true }));//set session 
// app.use(flash());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


/*set router*/
/*將路徑指到router資料夾下的user.js*/
let user = require('./routers/user');
app.use('/user', user);

/*set index  router*/

/*set firebase*/
let firebaseDb = require('./connections/firebase_admin');
let firebase = require('./connections/firebse_client');
const { create } = require('domain');
let loginUser = require('./public/js/login')
let insertNewFriend = require('./public/js/friendlist')

app.get('/', function (req, res, next) {

    //將資料render到views下的index.html
    console.log(req.cookies.user);
    if (req.cookies.user !== null) {
        //res.redirect('./user/chatroom');
        res.render('index', {
            nickname: 'jack',
            msg: 'msg',
            swal: 'none',
            titleMsg: '',
            msg: '',
            icon: ''
        });
    }
    else {
        res.render('index', {
            nickname: 'jack',
            msg: 'msg',
            swal: 'none',
            titleMsg: '',
            msg: '',
            icon: ''
        });
    }
});

app.post('/', async function (req, res) {

    let data = req.body;
    const errormsg = await loginUser(firebaseDb, data.email, data.password, 'login');
    if (errormsg[0] == 'success') {
        res.cookie('user', errormsg[1]);
        res.cookie('email', data.email);
        res.cookie('userId', errormsg[2]);
        res.render('index', {
            swal: 'pop',
            nickname: errormsg[1],
            titleMsg: 'Login Success!',
            msg: 'go to chat room now',
            icon: 'success'
        });

    }
    else {
        res.render('index', {
            swal: 'pop',
            nickname: data.name,
            titleMsg: 'Login error!',
            msg: errormsg[0],
            icon: 'error'
        });
    }

    console.log(errormsg);

});
let busyList = [];
//建立socket io server
io.on('connection', function (socket) {

    console.log('1 user connected');//socket io 連線成功console顯示"user connected"

    //send message to browser
    socket.emit('message', { text: '你上線了' });
    socket.on('disconnect', function () {
        console.log('1 user disconnected');

    });
    // get message from browser
    socket.on('client_data', function (data) {
        //console.log(data.username);
        //brocast message to browser
        console.log(busyList);
        if (busyList.indexOf(data.username) == -1)
            io.emit('new_user', { newuser: data.username, busyList: busyList });
    });
    //'connect_new_friend'
    socket.on('connect_new_friend', function (data) {
        if (busyList.indexOf(data.username) == -1 && busyList.indexOf(data.new_friend) == -1) {
            console.log(data.username, data.new_friend);
            busyList.push(data.username);
            busyList.push(data.new_friend);
            console.log(busyList);
            //brocast message to browser  socket.emit('connect_new_friend', { 'username': username, 'new_friend': data.newuser });
            io.emit('who_connect_new_friend', { userA: data.username, userB: data.new_friend, busyList: busyList });
        }

    });
    //socket.emit('sent_chat', { 'username': username, 'newFriend': newFriend, 'msg': msg, 'time': time });
    socket.on('sent_chat', function (data) {
        console.log('sent_chat:', data.username);
        //brocast message to browser
        io.emit('get_chat', { username: data.username, newFriend: data.newFriend, msg: data.msg, time: data.time });
    });

    //socket.emit('rematch_req', { 'username': username, 'newFriend': newFriend });
    socket.on('rematch_req', async function (data) {
        console.log('busyList');
        busyList.splice(busyList.indexOf(data.username), 1);
        busyList.splice(busyList.indexOf(data.newFriend), 1);
        console.log(busyList);
        await io.emit('rematch_res', { username: data.username, newFriend: data.newFriend });
        //io.emit('new_user', { newuser: data.username, busyList: busyList });
    });
    //socket.emit('invite_friend', { 'username': username, 'newFriend': newFriend });
    socket.on('invite_friend', async function (data) {
        io.emit('get_invite', { username: data.username, newFriend: data.newFriend });
    });
    //socket.emit('succes_make_friend', { 'username': username, 'newFriend': newFriend });
    socket.on('succes_make_friend', async function (data) {
        io.emit('get_invite', { username: data.username, newFriend: data.newFriend });
        //store to database
        let errormsg = await insertNewFriend(firebaseDb, data.username, data.newFriend, 'insertNewFriend');

    });



})


