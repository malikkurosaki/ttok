const PrismaClient = require("@prisma/client").PrismaClient;
const prisma = new PrismaClient();

async function updateQuestion() {
    let banyaknya = await prisma.kuis.count();
    const randomId = Math.floor(Math.random() * banyaknya);
    let soal = await prisma.kuis.findUnique({
        where: {
            id: randomId
        }
    });

    let soalSekarang = await prisma.soalSekarang.upsert({
        where: {
            id: 1
        },
        update: {
            Kuis: {
                connect: {
                    id: soal.id
                }
            }
        },
        create: {
            Kuis: {
                connect: {
                    id: soal.id
                }
            }
        },
        select: {
            Kuis: {
                select: {
                    soal: true,
                    jawaban: true
                }
            }
        }
    })

    console.log(soal)
    return soalSekarang;
}

module.exports = updateQuestion;