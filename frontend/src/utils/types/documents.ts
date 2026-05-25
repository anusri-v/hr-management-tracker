export type EmployeeDocument = {
    id: number;
    employee_id: number;
    document_type: string;
    file_name: string;
    storage_key: string;
    content_type: string | null;
    size: number | null;
    uploaded_by: number | null;
    created_at?: string | null;
    updated_at?: string | null;
};

// Onboarding document types, in display order.
export const ONBOARDING_DOCUMENT_TYPES = [
    'offer_letter',
    'signed_offer_letter',
    'aadhar_card',
    'pan_card',
    'bank_passbook',
    'passport',
    'photo',
    'driving_license',
    'other',
] as const;

// Exit document types, in display order.
export const EXIT_DOCUMENT_TYPES = [
    'no_dues_form',
    'exit_interview_form',
    'resignation_acceptance_letter',
] as const;

export const DOCUMENT_LABELS: Record<string, string> = {
    offer_letter: 'Offer Letter',
    signed_offer_letter: 'Signed Offer Letter',
    aadhar_card: 'Aadhar Card',
    pan_card: 'PAN Card',
    bank_passbook: 'Bank Passbook',
    passport: 'Passport',
    photo: 'Photograph',
    driving_license: 'Driving License',
    other: 'Other',
    no_dues_form: 'No Dues Form',
    exit_interview_form: 'Exit Interview Form',
    resignation_acceptance_letter: 'Resignation Acceptance Letter',
};
