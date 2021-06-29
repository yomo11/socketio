const express = require("express");
const app = express();
const PORT = 3000;
const server = require("http").createServer(app);
const cors = require("cors");

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:8080",
  },
});
const formatMessage = require("./utils/messages");
const { userJoin, getCurrentUser } = require("./utils/users");
const admin = require("firebase-admin");

var serviceAccount = require("./connections/admin.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://project-1285a-default-rtdb.firebaseio.com",
});

app.use(cors());
app.use(express.json());

app.use("/", express.static(__dirname + "/public"));

app.get("/user_info", (req, res) => {
  const email = req.query.email;
  admin
    .auth()
    .getUserByEmail(email)
    .then((userRecord) => {
      res.json(userRecord.toJSON());
      console.log(userRecord);
    })
    .catch((err) => {
      console.log(err);
    });
});

io.on("connection", (socket) => {
  console.log("New web socket connection...");
  socket.on("roomKey", (room_key) => {
    //chat with friend
    socket.on("chat", (data) => {
      const user = userJoin(socket.id, data.userB, data.room_key);
      socket.join(user.room);
    });
    socket.on("chatMessage", (data) => {
      console.log("chat message" + data);
      io.emit("message", formatMessage(data.sender, data.text, room_key));
    });
  });
});

server.listen(PORT, () => {
  console.log(`Run on ${PORT}`);
});
