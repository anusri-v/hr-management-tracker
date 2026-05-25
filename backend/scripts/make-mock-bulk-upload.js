// Generates a mock employees xlsx for testing /employee/bulk-import.
// Run: node scripts/make-mock-bulk-upload.js
const path = require('path');
const ExcelJS = require('exceljs');

const OUT = path.join(__dirname, '..', '..', 'mock_employees_bulk_upload.xlsx');

// Header labels deliberately use friendly aliases to exercise HEADER_MAP
// (e.g. "DOB" -> date_of_birth, "Manager" -> reporting_manager_emp_id).
const columns = [
    { header: 'Employee ID', key: 'employee_id', width: 14 },
    { header: 'Full Name', key: 'full_name', width: 22 },
    { header: 'Gender', key: 'gender', width: 10 },
    { header: 'DOB', key: 'dob', width: 14 },
    { header: 'Contact Number', key: 'contact', width: 16 },
    { header: 'Email', key: 'email', width: 28 },
    { header: 'Address', key: 'address', width: 30 },
    { header: 'Department', key: 'department', width: 16 },
    { header: 'Designation', key: 'designation', width: 22 },
    { header: 'Employment Type', key: 'employment_type', width: 16 },
    { header: 'DOJ', key: 'doj', width: 14 },
    { header: 'Internal Transfer Date', key: 'transfer_date', width: 18 },
    { header: 'Manager', key: 'manager', width: 12 },
    { header: 'Work Location', key: 'location', width: 16 },
    { header: 'Expat Status', key: 'expat_status', width: 12 },
    { header: 'Employment Status', key: 'employment_status', width: 16 },
    { header: 'Source of Hire', key: 'source', width: 14 },
    { header: 'Emergency Contact Name', key: 'ec_name', width: 22 },
    { header: 'Emergency Contact Phone', key: 'ec_phone', width: 20 },
    { header: 'Father Name', key: 'father_name', width: 20 },
    { header: 'Mother Name', key: 'mother_name', width: 20 },
    { header: 'Spouse Name', key: 'spouse_name', width: 20 },
    { header: 'Child1 Name', key: 'child1_name', width: 18 },
    { header: 'Child2 Name', key: 'child2_name', width: 18 },
    { header: 'PAN Number', key: 'pan_number', width: 16 },
    { header: 'Aadhar Number', key: 'aadhar_number', width: 18 },
    { header: 'UAN Number', key: 'pf_number', width: 18 },
];

const d = (s) => new Date(s);

const rows = [
    {
        employee_id: 'MOCK001', full_name: 'Asha Menon', gender: 'Female', dob: d('1985-04-12'),
        contact: '9810000001', email: 'asha.menon@example.com', address: '12 MG Road, Bengaluru',
        department: 'Engineering', designation: 'VP Engineering', employment_type: 'Full-time',
        doj: d('2018-06-01'), transfer_date: '', manager: '', location: 'Bengaluru', expat_status: 'native',
        employment_status: 'active', source: 'Referral', ec_name: 'Ravi Menon', ec_phone: '9810000010',
        father_name: 'Krishnan Menon', mother_name: 'Lata Menon', spouse_name: 'Ravi Menon',
        child1_name: 'Aditya Menon', child2_name: '', pan_number: 'ABCPM1234A', aadhar_number: '111122223333', pf_number: 'UAN1000001',
    },
    {
        employee_id: 'MOCK002', full_name: 'Rahul Verma', gender: 'Male', dob: d('1990-09-23'),
        contact: '9810000002', email: 'rahul.verma@example.com', address: '88 Park Street, Kolkata',
        department: 'Engineering', designation: 'Engineering Manager', employment_type: 'Full-time',
        doj: d('2020-02-17'), transfer_date: d('2023-04-01'), manager: 'MOCK001', location: 'Bengaluru', expat_status: 'native',
        employment_status: 'active', source: 'Consultant', ec_name: 'Sunita Verma', ec_phone: '9810000011',
        father_name: 'Mohan Verma', mother_name: 'Sunita Verma', spouse_name: 'Kavita Verma',
        child1_name: 'Ishaan Verma', child2_name: 'Diya Verma', pan_number: 'ABCPV5678B', aadhar_number: '222233334444', pf_number: 'UAN1000002',
    },
    {
        employee_id: 'MOCK003', full_name: 'Priya Nair', gender: 'Female', dob: d('1994-12-05'),
        contact: '9810000003', email: 'priya.nair@example.com', address: '5 Marine Drive, Mumbai',
        department: 'Engineering', designation: 'Senior Engineer', employment_type: 'Full-time',
        doj: d('2021-08-09'), transfer_date: '', manager: 'MOCK002', location: 'Mumbai', expat_status: 'native',
        employment_status: 'active', source: 'Campus', ec_name: 'Anil Nair', ec_phone: '9810000012',
        father_name: 'Anil Nair', mother_name: 'Meera Nair', spouse_name: '',
        child1_name: '', child2_name: '', pan_number: 'ABCPN9012C', aadhar_number: '333344445555', pf_number: 'UAN1000003',
    },
    {
        employee_id: 'MOCK004', full_name: 'David Smith', gender: 'Male', dob: d('1988-07-30'),
        contact: '9810000004', email: 'david.smith@example.com', address: '20 Baker Street, London',
        department: 'Product', designation: 'Product Manager', employment_type: 'Full-time',
        doj: d('2022-01-10'), transfer_date: '', manager: 'MOCK001', location: 'London', expat_status: 'expat',
        employment_status: 'active', source: 'Referral', ec_name: 'Emma Smith', ec_phone: '9810000013',
        father_name: 'John Smith', mother_name: 'Mary Smith', spouse_name: 'Emma Smith',
        child1_name: 'Oliver Smith', child2_name: '', pan_number: '', aadhar_number: '', pf_number: '',
    },
    {
        employee_id: 'MOCK005', full_name: 'Neha Gupta', gender: 'Female', dob: d('1998-03-18'),
        contact: '9810000005', email: 'neha.gupta@example.com', address: '7 Sector 18, Noida',
        department: 'Design', designation: 'UX Design Intern', employment_type: 'Intern',
        doj: d('2024-05-06'), transfer_date: '', manager: 'MOCK002', location: 'Noida', expat_status: 'native',
        employment_status: 'active', source: 'Campus', ec_name: 'Manoj Gupta', ec_phone: '9810000014',
        father_name: 'Manoj Gupta', mother_name: 'Rekha Gupta', spouse_name: '',
        child1_name: '', child2_name: '', pan_number: 'ABCPG3456D', aadhar_number: '444455556666', pf_number: 'UAN1000005',
    },
];

async function main() {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Employees');
    ws.columns = columns;
    rows.forEach((r) => ws.addRow(r));
    ws.getRow(1).font = { bold: true };
    // Format the date columns (DOB, DOJ, Internal Transfer Date) as dates.
    ['D', 'K', 'L'].forEach((col) => { ws.getColumn(col).numFmt = 'yyyy-mm-dd'; });
    await wb.xlsx.writeFile(OUT);
    console.log(`Wrote ${rows.length} mock employees to ${OUT}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
