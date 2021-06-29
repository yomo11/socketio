{
  const config = {
    apiKey: "AIzaSyBfpyYv2t3CIQdsMM9JO6veTOWllJNJM4I",
    authDomain: "project-1285a.firebaseapp.com",
    databaseURL: "https://project-1285a-default-rtdb.firebaseio.com",
    projectId: "project-1285a",
    storageBucket: "project-1285a.appspot.com",
    messagingSenderId: "139503389782",
    appId: "1:139503389782:web:1978705b35313a3330fff7",
    measurementId: "G-8HQQ9Z582V",
  };

  firebase.initializeApp(config);
  const socket = io();

  const chatInput = document.querySelector(".fa-paper-plane");
  const chatMessages = document.querySelector(".messages");

  function outputMessage(message) {
    const div = document.createElement("div");
    div.classList.add("message", "userA");
    div.innerHTML = `${message.text}<br><span class="message-time">${message.time}</span>`;
    document.querySelector(".messages").appendChild(div);
  }

  function outputMessageB(message) {
    const div = document.createElement("div");
    div.classList.add("message");
    div.innerHTML = `${message.text}<br><span class="message-time-b">${message.time}</span>`;
    document.querySelector(".messages").appendChild(div);
  }
  const btnLogin = document.querySelector(".btn-login");
  const btnSignup = document.querySelector(".btn-signup");
  const emailInput = document.querySelector("#email");
  const passwordInput = document.querySelector("#password");
  const nicknameInput = document.querySelector("#nickname");
  const btnSignOut = document.querySelector(".fa-sign-out-alt");
  function errorAlert(err) {
    const error = document.querySelector(".error");
    error.style.display = "block";
    error.innerHTML = `<span class="close" onclick="this.parentElement.style.visibility = 'hidden'">&#10005;</span><span class="error-message">${err}</span>`;
  }
  function successAlert() {
    const success = document.querySelector(".success");
    success.style.display = "block";
    success.innerHTML = `<span class="close" onclick="this.parentElement.style.visibility = 'hidden'">&#10005;</span><span class="success-message">Success!</span>`;
  }
  function disableAlert() {
    const success = document.querySelector(".success");
    const error = document.querySelector(".error");
    error.style.display = "none";
    success.style.display = "none";
  }

  //log in
  if (btnLogin) {
    btnLogin.addEventListener("click", (e) => {
      e.preventDefault();
      disableAlert();
      const info = {
        email: emailInput.value,
        password: passwordInput.value,
      };
      firebase
        .auth()
        .signInWithEmailAndPassword(info.email, info.password)
        .then(() => {
          const user = firebase.auth().currentUser;

          if (user) {
            // User is signed in.
            successAlert();
            console.log(user);
            setTimeout("location.href='index.html'", 3000);
          }
        })
        .catch(function (error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          if (errorCode == "auth/wrong-password") {
            errorAlert("The password is wrong.");
          } else if (errorCode == "auth/user-not-found") {
            errorAlert("The email is not signed up.");
          } else if (errorCode == "auth/invalid-email") {
            errorAlert("The email is invalid.");
          } else {
            errorAlert(errorMessage);
          }
          console.log(error);
        });
    });
  }

  //sign up
  if (btnSignup) {
    btnSignup.addEventListener("click", (e) => {
      e.preventDefault();
      disableAlert();
      const info = {
        email: emailInput.value,
        password: passwordInput.value,
        nickname: nicknameInput.value,
      };

      firebase
        .auth()
        .createUserWithEmailAndPassword(info.email, info.password)
        .then(function (result) {
          console.log(result);
          successAlert();
          return result.user.updateProfile({
            displayName: info.nickname,
          });
        })
        .catch(function (error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          if (errorCode == "auth/weak-password") {
            errorAlert("The password is too weak.");
          } else if (errorCode == "auth/invalid-email") {
            errorAlert("The email is invalid.");
          } else if (errorCode == "auth/email-already-in-use") {
            errorAlert("The email is already in use.");
          } else {
            errorAlert(errorMessage);
          }
          console.log(error);
        });
    });
  }
  if (btnSignOut) {
    btnSignOut.addEventListener("click", (e) => {
      e.preventDefault();
      firebase.auth().signOut();
    });
  }
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      const user_plus = document.querySelector(".fa-user-plus");
      const contactBar = document.querySelector(".bar");
      const uidA = user.uid;
      const displayNameA = user.displayName;

      console.log("you are " + displayNameA);
      contactBar.innerHTML = `<div class="pic monkey"></div>
                <div class="name">HI, ${displayNameA}</div>`;

      const db = firebase.database();
      const contacts = $(".contacts");
      db.ref("/friendList").on("value", (snapshot) => {
        $("div").remove(".friend");
        snapshot.forEach((element) => {
          const data = element.val();
          const key = element.key;
          if (data.uidA === uidA) {
            const template = `<div class="contact ${data.uidB} ${data.displayNameB} ${key} friend">
              <div class="pic monkey"></div>
              <div class="name">${data.displayNameB}</div>
          </div>`;
            contacts.append(template);
          } else if (data.uidB === uidA) {
            const template = `<div class="contact ${data.uidA} ${data.displayNameA} ${key} friend">
                <div class="pic monkey"></div>
                <div class="name">${data.displayNameA}</div>
            </div>`;
            contacts.append(template);
          }
        });
      });
      //add friend
      if (user_plus) {
        user_plus.addEventListener("click", (e) => {
          e.preventDefault();
          Swal.fire({
            title: `Input email to add a friend`,
            input: "text",
            inputAttributes: {
              autocapitalize: "off",
            },
            showCancelButton: true,
            confirmButtonText: "Add",
            showLoaderOnConfirm: true,
            preConfirm: (email) => {
              $.ajax({
                type: "GET",
                url: "/user_info",
                data: { email: email },
                dataType: "json",
                success: function (response) {
                  db.ref("/friendList").push({
                    displayNameA: displayNameA,
                    displayNameB: response.displayName,
                    uidA: uidA,
                    uidB: response.uid,
                  });
                },
              });
            },
            allowOutsideClick: () => !Swal.isLoading(),
          }).then((result) => {
            if (result.isConfirmed) {
              Swal.fire({
                icon: "success",
                title: "You are friends!",
              });
            }
          });
        });
      }

      //select a friend and chat
      $(".contacts").on("click", ".contact", (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        $("div").remove(".message");
        if (e.target.className.split(/\s+/)[0] != "contact") {
          const userB = e.target.parentElement.className.split(/\s+/)[2];
          const uidB = e.target.parentElement.className.split(/\s+/)[1];
          const room_key = e.target.parentElement.className.split(/\s+/)[3];
          const data = {
            uidA: uidA,
            uidB: uidB,
            userA: displayNameA,
            userB: userB,
            room_key: room_key,
          };
          contactBar.innerHTML = `<div class="pic monkey"></div>
                <div class="name">HI, ${displayNameA}</div>
                <div class="seen">Chat with ${userB}</div>`;
          socket.emit("roomKey", room_key);
          socket.emit("chat", data);
          db.ref("/friendList/" + room_key + "/messageList").once(
            "value",
            (snapshot) => {
              snapshot.forEach((element) => {
                const message = element.val();
                if (message.sender === displayNameA) {
                  outputMessage(message);
                } else {
                  outputMessageB(message);
                }
              });
            }
          );
        } else {
          const userB = e.target.className.split(/\s+/)[2];
          const uidB = e.target.className.split(/\s+/)[1];
          const room_key = e.target.className.split(/\s+/)[3];
          const data = {
            uidA: uidA,
            uidB: uidB,
            userA: displayNameA,
            userB: userB,
            room_key: room_key,
          };
          contactBar.innerHTML = `<div class="pic monkey"></div>
                <div class="name">HI, ${displayNameA}</div>
                <div class="seen">Chat with ${userB}</div>`;
          socket.emit("roomKey", room_key);
          socket.emit("chat", data);
          db.ref("/friendList/" + room_key + "/messageList").once(
            "value",
            (snapshot) => {
              snapshot.forEach((element) => {
                const message = element.val();
                if (message.sender === displayNameA) {
                  console.log("message===A");
                  outputMessage(message);
                } else {
                  console.log("message!=A");
                  outputMessageB(message);
                }
              });
            }
          );
        }
      });
      //input message
      if (chatInput) {
        chatInput.addEventListener("click", (e) => {
          e.preventDefault();

          const inputText = document.querySelector(".input-text").value;
          document.querySelector(".input-text").value = "";
          document.querySelector(".input-text").focus();
          const message = { text: inputText, sender: displayNameA }; //displayNameA is the message sender
          socket.emit("chatMessage", message);
        });
      }
      socket.on("message", (data) => {
        console.log(data); //{username: "coco", text: "hi", time: "5:00 pm"}
        if (data.username === displayNameA) {
          outputMessage(data);
          db.ref("/friendList/" + data.room + "/messageList").push({
            sender: data.username,
            text: data.text,
            time: data.time,
          });
        } else {
          outputMessageB(data);
        }
        chatMessages.scrollTop = chatMessages.scrollHeight;
      });

      socket.on("messageB", (message) => {
        outputMessageB(message);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      });
    } else {
      // User is signed out
      Swal.fire({
        icon: "error",
        title: "Please log in!",
        text: "You must log in first.",
        showConfirmButton: true,
      }).then(function () {
        window.location.href = "login.html";
      });
    }
  });
}
