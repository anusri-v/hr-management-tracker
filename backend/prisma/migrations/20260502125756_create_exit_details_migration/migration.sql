-- CreateTable
CREATE TABLE "exit_details" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "last_working_day" DATE,
    "exit_reason" TEXT,
    "final_settlement_status" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "exit_details_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "exit_details" ADD CONSTRAINT "exit_details_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
