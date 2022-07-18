const path = require('path');
const admin = require("firebase-admin");
const serviceAccount = require(path.join(__dirname, "./malikkurosaki1985-firebase-adminsdk-gdzr0-61efee2462.json"));
const db = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://malikkurosaki1985.firebaseio.com"
}).database();

const uuid = require('uuid').v4
const ttok = db.ref("/ttok");


/** @param {"top10" | "question" | "answerer"} child */
const event = (child) => {
    const value = { value: `server_${uuid()}` }
    return {
        onChange: (val) => ttok.child(child).on("child_changed", x => {
            if (x.val().split('_')[0] === 'client') {
                val()
            }
        }),
        refresh: ttok.child(child).set(value)
    };
}

const FDb = {
    event
}

module.exports = FDb