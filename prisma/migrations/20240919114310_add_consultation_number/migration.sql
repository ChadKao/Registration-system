/*
  Warnings:

  - Added the required column `consultationNumber` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `appointment` ADD COLUMN `consultationNumber` INTEGER NOT NULL;
