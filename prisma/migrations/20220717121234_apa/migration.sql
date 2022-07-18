-- AlterTable
ALTER TABLE `UserSekarang` ADD COLUMN `scoreId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `UserSekarang` ADD CONSTRAINT `UserSekarang_scoreId_fkey` FOREIGN KEY (`scoreId`) REFERENCES `Score`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
