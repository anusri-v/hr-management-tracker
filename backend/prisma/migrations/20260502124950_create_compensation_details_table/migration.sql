-- CreateTable
CREATE TABLE "compensation_details" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "salary_ctc" TEXT NOT NULL,
    "breakdown" TEXT NOT NULL,
    "effective_from" DATE,
    "effective_to" DATE,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "compensation_details_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "compensation_details" ADD CONSTRAINT "compensation_details_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
