-- CreateTable
CREATE TABLE "employees" (
    "id" SERIAL NOT NULL,
    "employee_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "contact_number" TEXT NOT NULL,
    "email_id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "department" TEXT,
    "designation" TEXT,
    "reporting_manager_id" INTEGER,
    "employment_type" TEXT,
    "date_of_joining" DATE,
    "work_location" TEXT,
    "employment_status" BOOLEAN,
    "source_of_hire" TEXT,
    "interview_date" DATE,
    "interview_panel" TEXT,
    "offer_letter_date" DATE,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employees_employee_id_key" ON "employees"("employee_id");
