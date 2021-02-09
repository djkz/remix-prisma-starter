/*
  Warnings:

  - The migration will add a unique constraint covering the columns `[userId]` on the table `PasswordReset`. If there are existing duplicate values, the migration will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_userId_unique" ON "PasswordReset"("userId");
