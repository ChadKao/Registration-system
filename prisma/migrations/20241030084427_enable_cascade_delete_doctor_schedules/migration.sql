-- DropForeignKey
ALTER TABLE `doctorschedule` DROP FOREIGN KEY `DoctorSchedule_doctorId_fkey`;

-- AddForeignKey
ALTER TABLE `DoctorSchedule` ADD CONSTRAINT `DoctorSchedule_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `Doctor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
