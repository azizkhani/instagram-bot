const _ = require('lodash');
var Promise = require("bluebird");
var Client = require('instagram-private-api').V1;
var device = new Client.Device('username');
var storage = new Client.CookieFileStorage('./cookies/someuser.json');

Client.Session.create(device, storage, 'username', 'pass').then(function (session) {
    init(session);
});

function sendImage(session) {
    Client.Upload.photo(session, './images/a.jpg')
        .then(function (upload) {
            return Client.Media.configurePhoto(session, upload.params.uploadId, 'akward caption');
        })
        .then(function (medium) {
            console.log(medium.params)
        });
}

function findAccountForUser(session, username) {
    return Client.Account.searchForUser(session, username);
}

function sendDirectMessage(session, userId, message) {
    Client.Thread.configureText(session, userId, 'یک ناشناس از اینستاگرام:' + message);
}

function init(session) {
    //setInterval(readMessage, 10000, session);
    likeMedia(session, 'عشقولانه');
    //commentMedia(session, 'عشقولانه', 'عالی');
    //sendWelcomeMessageToFollowers(session);
    //unfollowAllFollowing(session,'chapargram');
}

function readMessage(session) {
    console.log('start listening to message');
    var feed = new Client.Feed.Inbox(session, 'ThreadIdGoesHere');
    feed.get()
        .then(function (results) {
            return results;
        })
        .then(function (items) {
            items.forEach(chat => {
                chat.items.forEach(message => {
                    if (message._params.itemType == "text") {
                        console.log("User ID " + message._params.userId + "  Sent the message " + message._params.text);
                        sendReply(message);
                    }
                });
            });
        });

    function sendReply(item) {
        //find @azizkhaniaa
        //find target user id 
        //replace to empty 
        //send to message to user id
        let message = item._params.text;
        if (message.indexOf('@') > -1) {
            let targetUserName = message.match(/(?:@)([A-Za-z0-9_](?:(?:[A-Za-z0-9_]|(?:\.(?!\.))){0,28}(?:[A-Za-z0-9_]))?)/);
            if (targetUserName.length > 0) {
                let username = targetUserName[1];
                findAccountForUser(session, username).then(function (account) {
                    console.log(account.id);
                    sendDirectMessage(session, account.id, message.replace('@' + username, ' '));
                });
            }
        }//when text dose not contain correct pattern reply error message 
        else {
            sendIncorrectFormatMessage(item);
        }
    }

    function sendIncorrectFormatMessage(item) {
        let sampleMessage = 'botchain in payam ro be ersal kon';
        sendDirectMessage(session, item._params.userId, 'گیرنده در پیام ارسال نشده است');
        sendDirectMessage(session, item._params.userId, sampleMessage);
    }
}

function likeMediaPagination(session, hashTah) {
    let feed = new Client.Feed.TaggedMedia(session, hashTah);

    Promise.mapSeries(_.range(0, 2), function () {
        console.log('ii');
        return feed.get();
    }).then((results) => {
        _.forEach(results, (media, i) => {
            setTimeout(() => {
                console.log('Like:' + media.id);
                Client.Like.create(session, media.id);
            }, 8030 * i);
        });
    });

}
function likeMedia(session, hashTah) {
    let feed = new Client.Feed.TaggedMedia(session, hashTah);
    feed.get().then((results) => {
        _.forEach(results, (media, i) => {
            setTimeout(() => {
                console.log('Like:' + media.id);
                Client.Like.create(session, media.id);
            }, 3030 * i);
        });
    });

    setTimeout(() => {
        likeMedia(session, hashTah);
    }, 1000 * 5 * 60);
}

function commentMedia(session, hashTah, comment) {
    let feed = new Client.Feed.TaggedMedia(session, hashTah);
    feed.get().then((results) => {
        _.forEach(results, (media, i) => {
            setTimeout(() => {
                console.log('Comment:' + media.id);
                Client.Comment.create(session, media.id, comment);
            }, 7000 * i);
        });
    });

}

function unfollowAllFollowing(session, username) {
    findAccountForUser(session, username).then((account) => {
        let feed = new Client.Feed.AccountFollowing(session, account.id, 1);
        feed.get().then((results) => {
            _.forEach(results, (user, i) => {
                setTimeout(() => {
                    console.log('unfollow :' + user.id);
                    Client.Relationship.destroy(session, user.id);
                }, 7000 * i);
            });
        });
    });
}

async function sendWelcomeMessageToFollowers(session) {
    findAccountForUser(session, 'chapargram').then(function (account) {
        let feed = new Client.Feed.AccountFollowers(session, account.id, 1);
        feed.get().then((results) => {
            results.forEach(user => {
                setTimeout(() => {
                    console.log('timeout');
                    sendDirectMessage(session, user.id, 'ممنون که اکانت چاپارگرام رو فالو کردید و از حسن اعتماد شما تشکر می کنیم  ');
                }, 3000);
            });
        });

        // let followers = (await feed.get()).map((item) => item.params);
        // followers.forEach((user) => {
        //     setTimeout(() => {
        //         console.log('timeout');
        //         sendDirectMessage(session, user.id, 'ممنون که اکانت چاپارگرام رو فالو کردید و از حسن اعتماد شما تشکر میکنیم  ');
        //     }, 3000);
        // });
    });
}