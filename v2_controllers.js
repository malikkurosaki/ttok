const PrismaClient = require("@prisma/client").PrismaClient;
const prisma = new PrismaClient();

const expressAsyncHandler = require('express-async-handler');
const Prs = require('./v2_prs');
const updateQuestion = require('./v2_update_question');

const api = require('express').Router();

const getQuestion = expressAsyncHandler(async (req, res) => {
    let data = await updateQuestion();

    let soal = data.Kuis.soal;
    let clueJawaban = '';
    let jawaban = data.Kuis.jawaban.split('');
    let random = Math.floor(Math.random() * jawaban.length);
    for (let char of jawaban) {
        if (char === jawaban[random]) {
            clueJawaban += char;
        } else {
            clueJawaban += ' ? ';
        }
    }

    let clue = `${data.Kuis.jawaban.length} Huruf , ${clueJawaban}`;
    res.json({
        soal,
        clue
    })
})

const getAnswerer = expressAsyncHandler(async (req, res) => {
    let data = await prisma.userSekarang.findFirst({
        select: {
            User: {
                select: {
                    nickname: true,
                    profilePictureUrl: true,
                    Score: {
                        select: {
                            score: true
                        }
                    }
                }
            },
            Score: {
                select: {
                    score: true
                }
            }

        }
    })

    res.json(data)

})

let getTop10 = expressAsyncHandler(async (req, res) => {
    let data = await prisma.score.findMany({
        orderBy: {
            score: 'desc'
        },
        take: 10,
        select: {
            User: {
                select: {
                    nickname: true,
                    profilePictureUrl: true
                }
            },
            score: true

        }
    })

    res.json(data)

})

const getCorrectAnswer = expressAsyncHandler(async (req, res) => {
    let data = await prisma.soalSekarang.findUnique({
        where: {
            id: 1
        },
        select: {
            Kuis: {
                select: {
                    jawaban: true
                }
            }
        }
    })

    res.json(data.Kuis.jawaban);
})


api.get('/question', getQuestion);
api.get('/answerer', getAnswerer);
api.get('/top10', getTop10);
api.get('/correct', getCorrectAnswer)

module.exports = api