/*
  Warnings:

  - Made the column `name_ar` on table `MenuItem` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "MenuItem" ALTER COLUMN "name_ar" SET NOT NULL;
