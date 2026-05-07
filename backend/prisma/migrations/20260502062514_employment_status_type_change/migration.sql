/*
  Warnings:

  - Made the column `employment_status` on table `employees` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "employees" ALTER COLUMN "employment_status" SET NOT NULL,
ALTER COLUMN "employment_status" SET DEFAULT 'active',
ALTER COLUMN "employment_status" SET DATA TYPE TEXT;
