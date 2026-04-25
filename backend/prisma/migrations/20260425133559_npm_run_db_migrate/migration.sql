-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "google_sub" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL,
    "name" TEXT NOT NULL,
    "picture" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "authorized_by" INTEGER NOT NULL,
    "authorized_at" TIMESTAMP(3) NOT NULL,
    "revoked_by" INTEGER,
    "revoked_at" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_google_sub_key" ON "User"("google_sub");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
