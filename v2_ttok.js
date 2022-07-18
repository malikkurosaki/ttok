const PrismaClient = require("@prisma/client").PrismaClient;
const prisma = new PrismaClient();
const { WebcastPushConnection } = require('tiktok-live-connector');
const _ = require('lodash');
const colors = require('colors');
const js = require('js-beautify').html;
const path = require('path');
const FDb = require('./v2_fdb');
const Prs = require('./v2_prs');
const updateQuestion = require("./v2_update_question");

let modelChat = {
    comment: '',
    userId: '',
    uniqueId: '',
    nickname: '',
    profilePictureUrl: '',
    followRole: null,
    userBadges: [],
    isModerator: false,
    isNewGifter: false,
    isSubscriber: false,
    topGifterRank: null
}

const EVENT = {
    connected: "connected",
    disconnected: "disconnected",
    streamEnd: "streamEnd",
    rawData: "rawData",
    websocketConnected: "websocketConnected",
    error: "error"
}

const MESSAGE_EVENT = {
    member: "member",
    chat: "chat",
    gift: "gift",
    roomUser: "roomUser",
    like: "like",
    social: "social",
    emote: "emote",
    envelope: "envelope",
    questionNew: "questionNew",
    linkMicBattle: "linkMicBattle",
    linkMicArmies: "linkMicArmies",
    liveIntro: "liveIntro"
}

// EVENT
// connected
// disconnected
// streamEnd
// rawData
// websocketConnected
// error

// MESSAGE EVENT
// member
// chat
// gift
// roomUser
// like
// social
// emote
// envelope
// questionNew
// linkMicBattle
// linkMicArmies
// liveIntro

const init = async (name) => {

    console.log(`${name} cconnecting ...`.green);
    let tok = new WebcastPushConnection(name);
    try {
        await tok.connect();
        let roomId = await tok.getState().roomId
        console.log("connected room " + roomId);
        console.log(`https://www.tiktok.com/@${name}/live`.green);
        
    } catch (error) {
        console.log(`${error}`.red);
    }

    tok.on(MESSAGE_EVENT.chat, onChat)

    tok.on(EVENT.disconnected, async () => {
        console.log("disconnected");
    })

}

var dijawab = false;
/**@param {modelChat} data */
async function onChat(data) {

    let question = await Prs.pSoal.findFirst({
        select: {
            Kuis: {
                select: {
                    soal: true,
                    jawaban: true
                }
            }
        }
    })

    if (_.lowerCase(question.Kuis.jawaban) == _.lowerCase(data.comment) && !dijawab) {
        dijawab = true;
        console.log("jawaban benar".cyan)
        await correctAnswer(data);
        dijawab = false;
    }
}


async function correctAnswer(content) {

    let user = await prisma.user.upsert({
        where: {
            uniqueId: content.uniqueId.toString()
        },
        update: {
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

    let score = await prisma.score.findFirst({
        where: {
            userId: user.id
        }
    })

    if (score) {
        await prisma.score.update({
            where: {
                id: score.id
            },
            data: {
                score: score.score + 1
            }
        })
    } else {
        await prisma.score.create({
            data: {
                userId: user.id,
                score: 1
            }
        })
    }

    let answerer = await prisma.userSekarang.upsert({
        where: {
            id: 1
        },
        update: {
            userId: user.id
        },
        create: {
            id: 1,
            userId: user.id,

        }
    })


    FDb.event("top10").refresh;
    FDb.event("answerer").refresh;
    FDb.event("question").refresh;

    console.log("data has been updated for correct answer".green)
}



const V2Ttok = {
    init
}

module.exports = V2Ttok
