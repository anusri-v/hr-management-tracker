-- CreateTable
CREATE TABLE "sent_reminders" (
    "id" SERIAL NOT NULL,
    "dedup_key" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sent_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sent_reminders_dedup_key_key" ON "sent_reminders"("dedup_key");
