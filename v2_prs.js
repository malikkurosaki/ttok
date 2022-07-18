const PrismaClient = require("@prisma/client").PrismaClient;
const prisma = new PrismaClient();

const Prs = {
    pKuis: prisma.kuis,
    pSoal: prisma.soalSekarang,
    pUser: prisma.userSekarang,
    score: prisma.score
}

module.exports = Prs