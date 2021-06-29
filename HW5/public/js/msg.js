//new message
// insert into db
module.exports = async function (firebaseDb, username, userId, target, msg, action) {
    if (action == 'insert') console.log('insert my message');

    let path = 'users/' + userId + '/friends/';
    let friendData = await firebaseDb.ref(path).once('value');
    let friendlists = friendData.val();
    let time = new Date().toLocaleString();

    for (let friendId in friendlists) {
        for (let friend in friendlists[friendId]) {
            if (friend == target) {
                await firebaseDb.ref(path + friendId + '/' + target).push({ 'msg': msg, 'name': 'me', 'date': time });
            }
        }
    }

    //insert to friend db
    let userData = await firebaseDb.ref('users/').once('value');
    let allUser = userData.val();
    for (let userid in allUser) {
        if (allUser[userid]["username"] == target) {
            //console.log(allUser[userid]["username"]);
            friendlists = allUser[userid]['friends'];
            for (let friendId in friendlists) {
                for (let friend in friendlists[friendId]) {
                    //console.log(friend);
                    if (friend == username) {
                        await firebaseDb.ref('users/' + userid + '/friends/' + friendId + '/' + username).push({ 'msg': msg, 'name': username, 'date': time });
                    }
                }
            }

        }
    }



    console.log('insert success');

    return msg;

}
