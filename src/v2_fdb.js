
// import firebase app
import 'https://www.gstatic.com/firebasejs/7.14.0/firebase-app.js';

// import firebase database
import 'https://www.gstatic.com/firebasejs/7.14.0/firebase-database.js';
import uuidv4 from './v2_uuid.js';


firebase.initializeApp({
    apiKey: "AIzaSyAfACNHRoyIvX4nct4juVabZDgwEDKQ6jY",
    authDomain: "malikkurosaki1985.firebaseapp.com",
    databaseURL: "https://malikkurosaki1985.firebaseio.com",
    projectId: "malikkurosaki1985",
    storageBucket: "malikkurosaki1985.appspot.com",
    messagingSenderId: "27222609089",
    appId: "1:27222609089:web:bf85a0777451fb17da9840"
});

const db = firebase.database();
const ttok = db.ref("/ttok");

/** @param {"top10" | "question" | "answerer"} child */
function event(child){
    const value = { value: `client_${uuidv4()}` }
    return {
        onChange: (val) => ttok.child(child).on("child_changed", x => {
            if (x.val().split('_')[0] === 'server') {
                val()
            }
        }),
        refresh: ttok.child(child).set(value)
    };
}

const FDb = {
    event
}

export default FDb;