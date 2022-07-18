const soal = require('./soal.json');
const PrismaClient = require('@prisma/client').PrismaClient;
const prisma = new PrismaClient();
const _ = require('lodash');

; (async x => {

    const soal = require('./soal.json');
    console.log();

    let id = 1;
    for (let s of soal) {
        let data = s.kunci.split(':')
        await prisma.kuis.upsert({
            where: {
                id: id
            },
            update: {
                id: id,
                soal: data[0],
                jawaban: _.lowerCase(data[1]),
            },
            create: {
                id: id,
                soal: data[0],
                jawaban: _.lowerCase(data[1]),
            }
        })

        id++;

        console.log(`${id} - ${data[0]}`);
    }

    console.log('success');
})()