-- CreateTable
CREATE TABLE "statutory_details" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "bank_name" TEXT,
    "account_number" TEXT,
    "ifsc_code" TEXT,
    "pan_number" TEXT,
    "aadhar_number" TEXT,
    "pf_number" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "statutory_details_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "statutory_details" ADD CONSTRAINT "statutory_details_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
