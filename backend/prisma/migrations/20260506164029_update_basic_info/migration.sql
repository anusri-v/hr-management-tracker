-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "emergency_contact_name" TEXT,
ADD COLUMN     "emergency_contact_phone" TEXT,
ADD COLUMN     "expat_status" TEXT NOT NULL DEFAULT 'native',
ADD COLUMN     "family_members" JSONB,
ADD COLUMN     "internal_transfer_date" DATE,
ADD COLUMN     "talentx_id" TEXT;
