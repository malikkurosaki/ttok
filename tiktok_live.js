const { WebcastPushConnection } = require('tiktok-live-connector');
const PrismaClient = require('@prisma/client').PrismaClient;
const prisma = new PrismaClient();
const _ = require('lodash');
const colors = require('colors');
const js = require('js-beautify').html;

const admin = require("firebase-admin");
const path = require('path');
const serviceAccount = require(path.join(__dirname, "./malikkurosaki1985-firebase-adminsdk-gdzr0-61efee2462.json"));
const db = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://malikkurosaki1985.firebaseio.com"
}).database();



const Soal = db.ref('/soal');
const UserSekarang = db.ref('/userSekarang');
const TopUser = db.ref('/topUser');
const ConnectedRoom = db.ref('/connectedRoom');
const Coundown = db.ref('/countdown');
const Clue = db.ref('/clue');
const JawabanBenar = db.ref('/jawabanBenar');
const RefreshSoal = db.ref('/refreshSoal');

RefreshSoal.on('child_changed', async (snapshot) => {
    await updateSoal();
    console.log("Refresh Soal".cyan);
})

async function updateSoal() {
    
    const banyaknyaSoal = await prisma.kuis.count();
    const id = Math.floor(Math.random() * banyaknyaSoal) + 1;
    let soal = await prisma.soalSekarang.upsert({
        where: {
            id: 1
        },
        update: {
            id: 1,
            kuisId: id
        },
        create: {
            id: 1,
            kuisId: id
        },
        include: {
            Kuis: true
        }
    })

    let soalJawaban = `
    -----------------------------------------------------
    Soal sekarang: ${soal.Kuis.soal} \n  jawaban: ${soal.Kuis.jawaban}
    -----------------------------------------------------
    `

    console.log(js(soalJawaban).toString().green);

    Soal.set(soal.Kuis.soal);

    let randomClueCharacter = '';
    // random character
    let randomCharacter = Math.floor(Math.random() * soal.Kuis.jawaban.length);
    for (let char of soal.Kuis.jawaban.split('')) {
        if (char === soal.Kuis.jawaban[randomCharacter]) {
            randomClueCharacter += char;
        } else {
            randomClueCharacter += ' ? ';
        }
    }


    // clue
    let clue = `${soal.Kuis.jawaban.length} karakter , ${randomClueCharacter}`;
    console.log(`Clue: ${clue}`.yellow);
    Clue.set(clue);
    JawabanBenar.set(soal.Kuis.jawaban);
    Coundown.set({value: 10});
}

async function jawabanBenar(content) {

    let user = await prisma.user.upsert({
        where: {
            uniqueId: content.uniqueId.toString()
        },
        update: {
            uniqueId: content.uniqueId.toString(),
            followRole: content.followRole.toString(),
            nickname: content.nickname.toString(),
            profilePictureUrl: content.profilePictureUrl.toString(),

        },
        create: {
            uniqueId: content.uniqueId.toString(),
            followRole: content.followRole.toString(),
            nickname: content.nickname.toString(),
            profilePictureUrl: content.profilePictureUrl.toString(),
        },
    })

    const soalnya = await prisma.soalSekarang.findUnique({
        where: {
            id: 1,
        },

    })

    let userSekarang = await prisma.userSekarang.upsert({
        where: {
            id: 1
        },
        create: {
            id: 1,
            userId: user.id,
            kuisId: soalnya.kuisId
        },
        update: {
            userId: user.id,
            kuisId: soalnya.kuisId
        },
        include: {
            User: true
        }
    })

    const score = await prisma.score.findFirst({
        where: {
            userId: user.id
        }
    })

    if (score == null) {
        await prisma.score.create({
            data: {
                userId: user.id,
                score: 1
            }
        });
    } else {
        await prisma.score.update({
            where: {
                id: score.id
            },
            data: {
                score: score.score + 1
            }
        });
    }

    let userScore = await prisma.score.findFirst({
        where: {
            userId: user.id
        }
    })


    let dataBenar = {
        "name": user.nickname,
        "score": userScore.score
    }

    let topUser = await prisma.score.findMany({
        orderBy: {
            score: 'desc'
        },
        take: 10,
        include: {
            User: true
        }
    });

    const usrSkrng = await prisma.userSekarang.findUnique({
        where: {
            id: 1
        },
        select: {
            User: {
                select: {
                    profilePictureUrl: true,
                    nickname: true,
                    uniqueId: true,
                    Score: {
                        select: {
                            score: true
                        }
                    },
                    UserSekarang: {
                        select: {
                            Kuis: {
                                select: {
                                    jawaban: true,
                                    soal: true
                                }
                            }
                        }
                    }
                },



            },
            Kuis: {
                select: {
                    soal: true,
                    jawaban: true
                }
            }

        },

    });

    UserSekarang.set(usrSkrng);
    TopUser.set(topUser);

    console.log(`${user.nickname} benar , score: ${userScore.score}`.yellow);
    console.log(`Top 10 User : ${topUser.map(user => `${user.User.nickname} - ${user.score}`)}`.yellow);
    await updateSoal();

}


async function init(name) {

    // Create a new wrapper object and pass the username
    let tiktokChatConnection = new WebcastPushConnection(name);


    // timer.addEventListener("secondsUpdated", async (e) => {

    //     if (hitungan < 0) {
    //         await updateSoal();
    //     } else {
    //         Coundown.set(hitungan);
    //         hitungan--;
    //     }

    // });

    // Connect to the chat (await can be used as well)
    tiktokChatConnection.connect().then(async state => {
        let pesanConnect = `
        -----------------------------------------------------
        Connected to roomId ${state.roomId}
        https://www.tiktok.com/@${name}/live
        -----------------------------------------------------
        `
        console.log(js(pesanConnect).toString().cyan);
        ConnectedRoom.set(state.roomId);
        await updateSoal();
    }).catch(err => {
        let pesanError =
            `
        -----------------------------------------------------
        Error: ${err}
        -----------------------------------------------------
        `
        console.log(js(pesanError).toString().red);
    })


    // Define the events that you want to handle
    // In this case we listen to chat messages (comments)
    tiktokChatConnection.on('chat', async content => {
        // console.log(`${data.uniqueId} (userId:${data.userId}) writes: ${data.comment}`);

        const soal = await prisma.soalSekarang.findFirst({
            select: {
                Kuis: {
                    select: {
                        soal: true,
                        jawaban: true
                    }
                }
            }
        });

        // console.log(`${content.uniqueId} (userId:${content.userId}) writes: ${content.comment}`);

        if (_.lowerCase(soal.Kuis.jawaban) == _.lowerCase(content.comment)) {
            console.log("jawaban benar".cyan)
            jawabanBenar(content);
        }


    })

    // And here we receive gifts sent to the streamer
    tiktokChatConnection.on('gift', data => {
        // console.log(`${data.uniqueId} (userId:${data.userId}) sends ${data.giftId}`);

    })

    tiktokChatConnection.on('like', data => {
        // console.log(`${data.uniqueId} (userId:${data.userId}) likes the stream`);

    })

    tiktokChatConnection.on('member', data => {
        // console.log(`${data.uniqueId} (userId:${data.userId}) joins the room`);

    })


}

const TikTok = {
    init
}

module.exports = TikTok;