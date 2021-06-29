//register

// function registerUser(userId, name, email, password) {
module.exports = async function (firebaseDb, name, email, password, confirm_password, action) {

    if (action == 'register') {
        console.log(action);
    }
    if (name.replace(/(^s*)|(s*$)/g, "").length == 0 || email.replace(/(^s*)|(s*$)/g, "").length == 0 || password.replace(/(^s*)|(s*$)/g, "").length == 0
        || confirm_password.replace(/(^s*)|(s*$)/g, "").length == 0) {
        return 'You should fill every field.';
    }
    if (password.length < 6) {
        return 'Your password should have at least 6 character.';
    }

    if (password != confirm_password) {
        return 'Two password are different.';
    }
    //check duplicate
    let userData = await firebaseDb.ref('users/').once('value');
    let allUser = userData.val();
    for (let userId in allUser) {
        if (allUser[userId]["email"] == email) {
            return 'This email had been used.';
        }
    }

    let msg = '';
    // insert into db
    await firebaseDb.ref('users/').push().set({
        username: name,
        email: email,
        password: password
    }, (error) => {
        if (error) {
            console.log("registerError");
            msg = 'err';
        } else {
            // Data saved successfully!
            console.log("registerSuccess");
            msg = 'success';
        }
    });

    return msg;
    // firebaseDb.ref('users/').once('value', e => {
    //     //console.log(e.val());
    //     allUser = e.val();
    //     for (let userId in allUser) {
    //         if (allUser[userId]["email"] == email) {
    //             return 'This email had been used.';
    //         }
    //     }


    //     firebaseDb.ref('users/').push().set({
    //         username: name,
    //         email: email,
    //         password: password
    //     }, (error) => {
    //         if (error) {
    //             console.log("registerError");
    //         } else {
    //             // Data saved successfully!
    //             console.log("registerSuccess");
    //         }
    //     });
    //     return 'success';
    // });
}

//login
// var path = '/';
// db.ref(path).on('value', e => {
//     console.log(e.val());
//     tvalue = e.val();
//     var showdataElement = document.querySelector(".showdata");
//     showdataElement.innerHTML = "Successfully obtained data from firebase!";

// });
