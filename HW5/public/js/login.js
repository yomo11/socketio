//login

module.exports = async function (firebaseDb, email, password, action) {

    if (action == 'login') {
        console.log(action);
    }
    if (email.replace(/(^s*)|(s*$)/g, "").length == 0 || password.replace(/(^s*)|(s*$)/g, "").length == 0) {
        return Array('You should fill every field.');
    }

    //check duplicate
    let userData = await firebaseDb.ref('users/').once('value');
    let allUser = userData.val();
    for (let userId in allUser) {
        if (allUser[userId]["email"] == email && allUser[userId]["password"] == password) {
            return ['success', allUser[userId]["username"], userId];
        }
    }
    return Array('error');
}
