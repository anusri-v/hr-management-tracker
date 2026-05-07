export type CompensationDetails = {
    id?: number;
    employee_id?: number;
    currency: string;
    salary_ctc: string;
    breakdown: string | null;
    effective_from: string | null;
    effective_to: string | null;
    created_at?: string | null;
    updated_at?: string | null;
};

export type StatutoryDetails = {
    id?: number;
    employee_id?: number;
    bank_name: string | null;
    account_number: string | null;
    ifsc_code: string | null;
    pan_number: string | null;
    aadhar_number: string | null;
    pf_number: string | null;
    created_at?: string | null;
    updated_at?: string | null;
};

export type ExitDetails = {
    id?: number;
    employee_id?: number;
    last_working_day: string | null;
    exit_reason: string | null;
    final_settlement_status: string | null;
    created_at?: string | null;
    updated_at?: string | null;
};

export type FamilyDetails = {
    father_name: string | null;
    mother_name: string | null;
    spouse_name: string | null;
    child1_name: string | null;
    child2_name: string | null;
}

export type Employee = {
    id?: number;
    employee_id: string;
    full_name: string;
    gender: string;
    date_of_birth: string;
    contact_number: string;
    email_id: string;
    address: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    family_members: FamilyDetails;
    department: string | null;
    designation: string | null;
    reporting_manager_id: number | null;
    employment_type: string | null;
    date_of_joining: string | null;
    internal_transfer_date: string | null;
    expat_status: string | null;
    work_location: string | null;
    employment_status: string;
    source_of_hire: string | null;
    interview_date: string | null;
    interview_panel: string | null;
    offer_letter_date: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    compensation_details: CompensationDetails[];
    statutory_details: StatutoryDetails[];
    exit_details?: ExitDetails[];
    offer_letter_status?: string;
};

export const emptyCompensationDetails = (): CompensationDetails => ({
    currency: '',
    salary_ctc: '',
    breakdown: null,
    effective_from: null,
    effective_to: null,
});

export const emptyStatutoryDetails = (): StatutoryDetails => ({
    bank_name: null,
    account_number: null,
    ifsc_code: null,
    pan_number: null,
    aadhar_number: null,
    pf_number: null,
});

export const emptyFamilyDetails = (): FamilyDetails => ({
    father_name: '',
    mother_name: '',
    spouse_name: '',
    child1_name: '',
    child2_name: '',
})

export const emptyEmployee = (): Employee => ({
    employee_id: '',
    full_name: '',
    gender: '',
    date_of_birth: '',
    contact_number: '',
    email_id: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    family_members: emptyFamilyDetails(),
    department: null,
    designation: null,
    reporting_manager_id: null,
    employment_type: null,
    date_of_joining: null,
    internal_transfer_date: null,
    expat_status: "native",
    work_location: null,
    employment_status: 'active',
    source_of_hire: null,
    interview_date: null,
    interview_panel: null,
    offer_letter_date: null,
    compensation_details: [emptyCompensationDetails()],
    statutory_details: [emptyStatutoryDetails()],
    offer_letter_status: '',
});
