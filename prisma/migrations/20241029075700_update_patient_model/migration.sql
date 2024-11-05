-- AlterTable
ALTER TABLE `patient` ADD COLUMN `authProvider` VARCHAR(191) NULL,
    MODIFY `password` VARCHAR(191) NULL;
