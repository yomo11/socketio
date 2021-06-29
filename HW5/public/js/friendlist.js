//login

module.exports = async function (firebaseDb, target, userId, action) {
    console.log(action);

    if (action == 'getFriend') {

        //check duplicate
        let userData = await firebaseDb.ref('users/' + userId + '/friends/').once('value');
        let friendlists = userData.val();
        let friendlist = [];

        for (let friendId in friendlists) {
            for (let friend in friendlists[friendId]) {
                friendlist.push(friend);
            }
        }

        //console.log(friendlist);

        return friendlist;
    }

    else if (action == 'getContent') {
        let userData = await firebaseDb.ref('users/' + userId + '/friends/').once('value');
        let friendlists = userData.val();
        let contentlist = [];

        for (let friendId in friendlists) {
            for (let friend in friendlists[friendId]) {
                if (friend == target) {
                    for (let contentId in friendlists[friendId][friend]) {
                        contentlist.push(friendlists[friendId][friend][contentId]);
                    }
                }
            }
        }

        return contentlist;
    }

    else if (action == 'insertNewFriend') {
        let time = new Date().toLocaleString();

        //insert to userA db
        let userData = await firebaseDb.ref('users/').once('value');
        let allUser = userData.val();
        for (let userid in allUser) {
            if (allUser[userid]["username"] == target) {
                //console.log(allUser[userid]["username"]);
                friendlists = allUser[userid]['friends'];
                //await firebaseDb.ref('users/' + userid + '/friends/').push({ 'msg': msg, 'name': username, 'date': time });
                await firebaseDb.ref('users/' + userid + '/friends/').push({ [userId]: { '0000': { 'msg': 'You are new friend.', 'name': 'System', 'date': time } } });
            }
        }
    }
}
