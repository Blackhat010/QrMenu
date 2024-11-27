/*
  Warnings:

  - Added the required column `sizes` to the `MenuItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "sizes" JSONB NOT NULL;
