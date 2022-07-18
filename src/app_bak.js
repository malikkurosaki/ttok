
// import firebase app
import 'https://www.gstatic.com/firebasejs/7.14.0/firebase-app.js';

// import firebase database
import 'https://www.gstatic.com/firebasejs/7.14.0/firebase-database.js';

// import jquery
import 'https://code.jquery.com/jquery-3.6.0.min.js'


$("#soal").html(".....");

let gam = Math.floor(Math.random() * 10) + 1;

$("#gam").attr("src", `./assets/${gam}.gif`);

let soundBg = new Audio('./bg.mp3');
let soundWin = new Audio('./win.mp3');
soundBg.loo = true;

soundBg.addEventListener('ended', function () {
    this.currentTime = 0;
    this.play();
});

// soundBg.play();


// Initialize Firebase
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
const Soal = db.ref('/soal');
const UserSekarang = db.ref('/userSekarang');
const TopUser = db.ref('/topUser');
const ConnectedRoom = db.ref('/connectedRoom');
const Coundown = db.ref('/countdown');
const Clue = db.ref('/clue');
const JawabanBenar = db.ref('/jawabanBenar');
const RefreshSoal = db.ref('/refreshSoal');


var waktu = 10;
const timer = setInterval(function () {
    if (waktu < 0) {
        RefreshSoal.set({value: true});
        console.log("refresh soal");
    } else {
        waktu--;
        $("#countdown").html(waktu);
    }
}, 1000);

Soal.on("value", (snapshot) => {
    // console.log(`Soal: ${snapshot.val()}`);
    $("#soal").html(snapshot.val());
});


let loadPertama = true;

UserSekarang.on("value", async (snapshot) => {

    const dataUser = snapshot.val();


    console.log(`User Sekarang: ${JSON.stringify(dataUser)}`);
    try {

        $("#userSekarang").html(`
       <div class="px-3 ">
            <div class="card px2">
                <div class="row px-2 d-flex align-items-center">
                        <img class="p-2 col-4" src="${dataUser.User['profilePictureUrl']}" alt="Avatar" style="width:50px ; height: 50px; border-radius: 50%;" />
                        <div class="p-2 col-8">
                            <div class="text-dark naga" style="font-weight: bold">${dataUser.User['nickname']}</div>
                        </div>
                </div>
            </div>
        </div>
    `);

    } catch (error) {
        console.log(error);
    }

    if (!loadPertama) {
        // soundBg.pause()
        await soundWin.play();
        // soundBg.play()
        const data = snapshot.val();
        console.log(`User Sekarang: ${JSON.stringify(data)}`);
        try {
            Swal.fire({
                timer: 6000,
                color: '#FFFFFF',
                background: '#3E7D8F',
                showConfirmButton: false,
                showCloseButton: false,
                html: `
            <div>
                <h1>SELAMAT!</h1>
                <h1>Benar: ${data.Kuis.jawaban}</h1>
                <div class="">
                    <img class="p-2 " src="${data.User.profilePictureUrl}" alt="Avatar" style="width:100px ; height: 100px; border-radius: 100%;" />
                    <h1>${data.User.nickname}</h1>
                </div>
                <h1>

                </h1>
            </div>
        `,
            });
        } catch (error) {
            console.log(error);
        }


    }

    loadPertama = false;

});

UserSekarang.on("child_changed", (snapshot) => {

    // const data = snapshot.val();
    // console.log(`User Sekarang: ${JSON.stringify(data)}`);
    // try {
    //     Swal.fire({
    //         title: 'Selamat!',
    //         text: `${snapshot.val()}`,
    //         icon: 'info',
    //         timer: 6000,
    //         showConfirmButton: false,
    //         showCloseButton: false,
    //         html: `
    //         <div>
    //             <h1>Benar: ${data.UserSekarang[0].Kuis.jawaban}</h1>
    //             <div class="">
    //                 <img class="p-2 " src="${data.profilePictureUrl}" alt="Avatar" style="width:100px ; height: 100px; border-radius: 100%;" />
    //                 <h1>${data.nickname}</h1>
    //             </div>
    //             <h1>

    //             </h1>
    //         </div>
    //     `,
    //     });
    // } catch (error) {
    //     console.log(error);
    // }



});

TopUser.on("value", (snapshot) => {
    // console.log(`Top User: ${snapshot.val()}`);
});

ConnectedRoom.on("value", (snapshot) => {
    // console.log(`Connected Room: ${snapshot.val()}`);
});


Coundown.on("child_changed", (snapshot) => {
    // console.log(`Countdown: ${snapshot.val()}`);
    waktu = snapshot.val().value;
    console.log(`Countdown: ${snapshot.val()}`);
});

Clue.on("value", (snapshot) => {
    // console.log(`Clue: ${snapshot.val()}`);
    $("#clue").html(snapshot.val());
});

