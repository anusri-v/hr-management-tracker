const express = require('express');
const { Prisma } = require('@prisma/client');
const multer = require('multer');
const ExcelJS = require('exceljs');

const router = express.Router();
const prisma = require('../lib/prisma');
const requireAuth = require('../middleware/requireAuth');
const { logActivity } = require('../lib/activityLog');
const storage = require('../lib/storage');
const { runDailyReminders, runMonthlyBirthdayDigest } = require('../lib/reminderJobs');

const upload = multer({ storage: multer.memoryStorage() });

// Allowed employee document types (onboarding + exit). Keep in sync with the
// frontend label map in src/utils/types.
const DOCUMENT_TYPES = new Set([
    // onboarding
    'offer_letter', 'signed_offer_letter', 'aadhar_card', 'pan_card',
    'bank_passbook', 'passport', 'photo', 'driving_license', 'other',
    // exit
    'no_dues_form', 'exit_interview_form', 'resignation_acceptance_letter',
]);

router.get('/summary', async (req, res) => {
    try {
        const [total, active, resigned] = await Promise.all([
            prisma.employee.count(),
            prisma.employee.count({ where: { employment_status: 'active' } }),
            prisma.employee.count({ where: { employment_status: 'resigned' } }),
        ]);

        res.status(200).json({
            success: true,
            summary: { total, active, resigned },
        });
    } catch (e) {
        console.error('GET /employee/summary failed:', e.message);
        res.status(500).json({ error: 'Internal server error', message: e.message });
    }
})

const REMINDER_WINDOW_DAYS = 30;

function withinWindow(date, today, windowDays) {
    const end = new Date(today);
    end.setDate(end.getDate() + windowDays);
    return date >= today && date <= end;
}

function nextYearlyOccurrence(storedDate, today) {
    const thisYear = new Date(today.getFullYear(), storedDate.getMonth(), storedDate.getDate());
    if (thisYear >= today) return thisYear;
    return new Date(today.getFullYear() + 1, storedDate.getMonth(), storedDate.getDate());
}

router.get('/reminders', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const windowEnd = new Date(today);
        windowEnd.setDate(windowEnd.getDate() + REMINDER_WINDOW_DAYS);

        const milestoneJoinStart = new Date(today);
        milestoneJoinStart.setDate(milestoneJoinStart.getDate() - 90);
        const milestoneJoinEnd = new Date(today);
        milestoneJoinEnd.setDate(milestoneJoinEnd.getDate() - 60);

        const [allActive, exitingEmployees, milestoneEmployees] = await Promise.all([
            prisma.employee.findMany({
                where: { employment_status: 'active' },
                select: { employee_id: true, full_name: true, date_of_birth: true, date_of_joining: true },
            }),
            prisma.exitDetails.findMany({
                where: {
                    last_working_day: { gte: today, lte: windowEnd },
                },
                include: {
                    employee: { select: { employee_id: true, full_name: true } },
                },
            }),
            prisma.employee.findMany({
                where: {
                    employment_status: 'active',
                    date_of_joining: { gte: milestoneJoinStart, lte: milestoneJoinEnd },
                },
                select: { employee_id: true, full_name: true, date_of_joining: true },
            }),
        ]);

        const reminders = [];

        for (const emp of allActive) {
            if (emp.date_of_birth) {
                const next = nextYearlyOccurrence(new Date(emp.date_of_birth), today);
                const dob = new Date(emp.date_of_birth)
                if (withinWindow(next, today, REMINDER_WINDOW_DAYS)) {
                    reminders.push({ type: 'birthday', employee_id: emp.employee_id, full_name: emp.full_name, date: dob });
                }
            }
            if (emp.date_of_joining) {
                const next = nextYearlyOccurrence(new Date(emp.date_of_joining), today);
                const joinYear = new Date(emp.date_of_joining).getFullYear();
                const doj = new Date(emp.date_of_joining)
                if (next.getFullYear() > joinYear && withinWindow(next, today, REMINDER_WINDOW_DAYS)) {
                    reminders.push({ type: 'work_anniversary', employee_id: emp.employee_id, full_name: emp.full_name, date: doj });
                }
            }
        }

        for (const exit of exitingEmployees) {
            reminders.push({
                type: 'last_working_day',
                employee_id: exit.employee.employee_id,
                full_name: exit.employee.full_name,
                date: exit.last_working_day,
            });
        }

        for (const emp of milestoneEmployees) {
            const milestone = new Date(emp.date_of_joining);
            milestone.setDate(milestone.getDate() + 90);
            reminders.push({ type: 'three_month_milestone', employee_id: emp.employee_id, full_name: emp.full_name, date: milestone });
        }

        reminders.sort((a, b) => new Date(a.date) - new Date(b.date));

        res.json({
            success: true,
            reminders,
            total: reminders.length,
        });
    } catch (e) {
        console.error('GET /employee/reminders failed:', e.message);
        res.status(500).json({ error: 'Internal server error', message: e.message });
    }
});

// GET /employee/bulk-export — export all employees as xlsx
router.get('/bulk-export', async (req, res) => {
    try {
        const employees = await prisma.employee.findMany({
            orderBy: { employee_id: 'asc' },
            include: { statutory_details: { orderBy: { id: 'desc' }, take: 1 } },
        });

        // Build a map of internal id -> employee_id string for reporting manager lookup
        const idToEmpId = {};
        for (const emp of employees) {
            idToEmpId[emp.id] = emp.employee_id;
        }

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Employees');

        sheet.columns = [
            { header: 'employee_id', key: 'employee_id', width: 15 },
            { header: 'full_name', key: 'full_name', width: 25 },
            { header: 'gender', key: 'gender', width: 10 },
            { header: 'date_of_birth', key: 'date_of_birth', width: 15 },
            { header: 'contact_number', key: 'contact_number', width: 18 },
            { header: 'email_id', key: 'email_id', width: 25 },
            { header: 'address', key: 'address', width: 35 },
            { header: 'department', key: 'department', width: 20 },
            { header: 'designation', key: 'designation', width: 20 },
            { header: 'employment_type', key: 'employment_type', width: 15 },
            { header: 'date_of_joining', key: 'date_of_joining', width: 15 },
            { header: 'internal_transfer_date', key: 'internal_transfer_date', width: 18 },
            { header: 'reporting_manager', key: 'reporting_manager', width: 15 },
            { header: 'work_location', key: 'work_location', width: 15 },
            { header: 'expat_status', key: 'expat_status', width: 12 },
            { header: 'employment_status', key: 'employment_status', width: 15 },
            { header: 'source_of_hire', key: 'source_of_hire', width: 15 },
            { header: 'talentx_id', key: 'talentx_id', width: 15 },
            { header: 'emergency_contact_name', key: 'emergency_contact_name', width: 22 },
            { header: 'emergency_contact_phone', key: 'emergency_contact_phone', width: 22 },
            { header: 'father_name', key: 'father_name', width: 20 },
            { header: 'mother_name', key: 'mother_name', width: 20 },
            { header: 'spouse_name', key: 'spouse_name', width: 20 },
            { header: 'child1_name', key: 'child1_name', width: 20 },
            { header: 'child2_name', key: 'child2_name', width: 20 },
            { header: 'pan_number', key: 'pan_number', width: 16 },
            { header: 'aadhar_number', key: 'aadhar_number', width: 18 },
            { header: 'pf_number', key: 'pf_number', width: 16 },
        ];

        for (const emp of employees) {
            const family = emp.family_members ?? {};
            const statutory = emp.statutory_details?.[0] ?? {};
            sheet.addRow({
                employee_id: emp.employee_id,
                full_name: emp.full_name,
                gender: emp.gender,
                date_of_birth: emp.date_of_birth ? emp.date_of_birth.toISOString().split('T')[0] : '',
                contact_number: emp.contact_number,
                email_id: emp.email_id,
                address: emp.address,
                department: emp.department ?? '',
                designation: emp.designation ?? '',
                employment_type: emp.employment_type ?? '',
                date_of_joining: emp.date_of_joining ? emp.date_of_joining.toISOString().split('T')[0] : '',
                internal_transfer_date: emp.internal_transfer_date ? emp.internal_transfer_date.toISOString().split('T')[0] : '',
                reporting_manager: emp.reporting_manager_id ? (idToEmpId[emp.reporting_manager_id] ?? '') : '',
                work_location: emp.work_location ?? '',
                expat_status: emp.expat_status ?? '',
                employment_status: emp.employment_status ?? '',
                source_of_hire: emp.source_of_hire ?? '',
                talentx_id: emp.talentx_id ?? '',
                emergency_contact_name: emp.emergency_contact_name ?? '',
                emergency_contact_phone: emp.emergency_contact_phone ?? '',
                father_name: family.father_name ?? '',
                mother_name: family.mother_name ?? '',
                spouse_name: family.spouse_name ?? '',
                child1_name: family.child1_name ?? '',
                child2_name: family.child2_name ?? '',
                pan_number: statutory.pan_number ?? '',
                aadhar_number: statutory.aadhar_number ?? '',
                pf_number: statutory.pf_number ?? '',
            });
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="employees.xlsx"');

        await workbook.xlsx.write(res);
        res.end();
    } catch (e) {
        console.error('GET /employee/bulk-export failed:', e.message);
        res.status(500).json({ error: 'Internal server error', message: e.message });
    }
});

// POST /employee/bulk-import — import employees from xlsx
const MANDATORY_FIELDS = ['employee_id', 'full_name', 'gender', 'date_of_birth', 'contact_number', 'email_id', 'address', 'department', 'designation', 'employment_type', 'date_of_joining'];

function normalizeHeader(h) {
    return String(h).toLowerCase().replace(/[\s_\-]+/g, '');
}

const HEADER_MAP = {
    'employeeid': 'employee_id',
    'empid': 'employee_id',
    'fullname': 'full_name',
    'name': 'full_name',
    'gender': 'gender',
    'dateofbirth': 'date_of_birth',
    'dob': 'date_of_birth',
    'birthdate': 'date_of_birth',
    'contactnumber': 'contact_number',
    'contact': 'contact_number',
    'phone': 'contact_number',
    'mobilenumber': 'contact_number',
    'mobile': 'contact_number',
    'emailid': 'email_id',
    'email': 'email_id',
    'address': 'address',
    'department': 'department',
    'dept': 'department',
    'designation': 'designation',
    'role': 'designation',
    'jobtitle': 'designation',
    'employmenttype': 'employment_type',
    'emptype': 'employment_type',
    'type': 'employment_type',
    'dateofjoining': 'date_of_joining',
    'doj': 'date_of_joining',
    'joiningdate': 'date_of_joining',
    'dateofjoin': 'date_of_joining',
    'reportingmanager': 'reporting_manager_emp_id',
    'reportingmanagerid': 'reporting_manager_emp_id',
    'manager': 'reporting_manager_emp_id',
    'managerid': 'reporting_manager_emp_id',
    'worklocation': 'work_location',
    'location': 'work_location',
    'expatstatus': 'expat_status',
    'sourceofhire': 'source_of_hire',
    'source': 'source_of_hire',
    'talentxid': 'talentx_id',
    'emergencycontactname': 'emergency_contact_name',
    'emergencycontactphone': 'emergency_contact_phone',
    'emergencyphone': 'emergency_contact_phone',
    // employment
    'internaltransferdate': 'internal_transfer_date',
    'transferdate': 'internal_transfer_date',
    'employmentstatus': 'employment_status',
    'status': 'employment_status',
    // family members (stored as JSON on the employee)
    'fathername': 'father_name',
    'fathersname': 'father_name',
    'mothername': 'mother_name',
    'mothersname': 'mother_name',
    'spousename': 'spouse_name',
    'spousesname': 'spouse_name',
    'child1name': 'child1_name',
    'child1': 'child1_name',
    'child2name': 'child2_name',
    'child2': 'child2_name',
    // statutory details (separate table)
    'pannumber': 'pan_number',
    'pan': 'pan_number',
    'aadharnumber': 'aadhar_number',
    'aadhaarnumber': 'aadhar_number',
    'aadhar': 'aadhar_number',
    'aadhaar': 'aadhar_number',
    'pfnumber': 'pf_number',
    'pf': 'pf_number',
    'uan': 'pf_number',
    'uannumber': 'pf_number',
    'pfuan': 'pf_number',
};

function parseDateValue(val) {
    if (!val) return undefined;
    if (val instanceof Date) return val;
    // Excel numeric serial date
    if (typeof val === 'number') {
        const excelEpoch = new Date(1899, 11, 30);
        return new Date(excelEpoch.getTime() + val * 86400000);
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? undefined : d;
}

router.post('/bulk-import', requireAuth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(req.file.buffer);

        const sheet = workbook.worksheets[0];
        if (!sheet) {
            return res.status(400).json({ success: false, message: 'xlsx file has no worksheets' });
        }

        // Read headers from row 1
        const headerRow = sheet.getRow(1);
        const headers = [];
        headerRow.eachCell({ includeEmpty: false }, (cell) => {
            const normalized = normalizeHeader(cell.value);
            headers.push(HEADER_MAP[normalized] || normalized);
        });

        // Parse all data rows
        const rows = [];
        sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber === 1) return;
            const obj = {};
            row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                const field = headers[colNumber - 1];
                if (field) obj[field] = cell.value;
            });
            rows.push({ rowNumber, data: obj });
        });

        if (rows.length === 0) {
            return res.status(400).json({ success: false, message: 'No data rows found in file' });
        }

        // Validate and separate valid/invalid rows
        const validRows = [];
        const errors = [];

        for (const { rowNumber, data } of rows) {
            const missing = MANDATORY_FIELDS.filter(f => !data[f] && data[f] !== 0);
            if (missing.length > 0) {
                errors.push({ row: rowNumber, message: `Missing mandatory fields: ${missing.join(', ')}` });
                continue;
            }
            validRows.push({ rowNumber, data });
        }

        if (validRows.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid rows to import', errors });
        }

        // Pass 1: create all valid employees (without reporting_manager_id)
        const created = [];
        const createErrors = [];

        const str = (v) => (v != null && String(v).trim() !== '' ? String(v).trim() : undefined);

        for (const { rowNumber, data } of validRows) {
            try {
                // Build family_members JSON from any provided members.
                const familyEntries = {
                    father_name: str(data.father_name),
                    mother_name: str(data.mother_name),
                    spouse_name: str(data.spouse_name),
                    child1_name: str(data.child1_name),
                    child2_name: str(data.child2_name),
                };
                const hasFamily = Object.values(familyEntries).some((v) => v !== undefined);

                const emp = await prisma.employee.create({
                    data: {
                        employee_id: String(data.employee_id).trim(),
                        full_name: String(data.full_name).trim(),
                        gender: String(data.gender).trim().toLowerCase(),
                        date_of_birth: parseDateValue(data.date_of_birth),
                        contact_number: String(data.contact_number).trim(),
                        email_id: String(data.email_id).trim(),
                        address: String(data.address).trim(),
                        department: str(data.department),
                        designation: str(data.designation),
                        employment_type: data.employment_type ? String(data.employment_type).trim().toLowerCase() : undefined,
                        date_of_joining: data.date_of_joining ? parseDateValue(data.date_of_joining) : undefined,
                        internal_transfer_date: data.internal_transfer_date ? parseDateValue(data.internal_transfer_date) : undefined,
                        work_location: str(data.work_location),
                        expat_status: data.expat_status ? String(data.expat_status).trim().toLowerCase() : 'native',
                        employment_status: data.employment_status ? String(data.employment_status).trim().toLowerCase() : undefined,
                        source_of_hire: str(data.source_of_hire),
                        talentx_id: str(data.talentx_id),
                        emergency_contact_name: str(data.emergency_contact_name),
                        emergency_contact_phone: str(data.emergency_contact_phone),
                        family_members: hasFamily ? familyEntries : undefined,
                    },
                });

                // Statutory details live in a separate table — create when provided.
                const statutory = {
                    pan_number: str(data.pan_number),
                    aadhar_number: str(data.aadhar_number),
                    pf_number: str(data.pf_number),
                };
                if (Object.values(statutory).some((v) => v !== undefined)) {
                    await prisma.statutoryDetails.create({
                        data: { employee_id: emp.id, ...statutory },
                    });
                }

                created.push({ rowNumber, employee_id: emp.employee_id, internalId: emp.id, reporting_manager_emp_id: data.reporting_manager_emp_id });
            } catch (e) {
                if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                    createErrors.push({ row: rowNumber, message: `Employee ID "${data.employee_id}" already exists` });
                } else {
                    createErrors.push({ row: rowNumber, message: e.message });
                }
            }
        }

        // Pass 2: resolve and apply reporting manager IDs
        const rowsNeedingManager = created.filter(r => r.reporting_manager_emp_id);

        if (rowsNeedingManager.length > 0) {
            // Build set of unique manager employee_ids to look up
            const managerEmpIds = [...new Set(rowsNeedingManager.map(r => String(r.reporting_manager_emp_id).trim()))];

            const managers = await prisma.employee.findMany({
                where: { employee_id: { in: managerEmpIds } },
                select: { id: true, employee_id: true },
            });

            const managerMap = {};
            for (const m of managers) {
                managerMap[m.employee_id] = m.id;
            }

            for (const row of rowsNeedingManager) {
                const mgr_emp_id = String(row.reporting_manager_emp_id).trim();
                const managerId = managerMap[mgr_emp_id];
                if (managerId) {
                    await prisma.employee.update({
                        where: { id: row.internalId },
                        data: { reporting_manager_id: managerId },
                    });
                }
            }
        }

        const actor = await prisma.user.findUnique({ where: { google_sub: req.user.uid }, select: { id: true } });
        if (actor) {
            logActivity({
                actorId: actor.id,
                action: 'BULK_IMPORT',
                entityType: 'employee',
                entityId: 'bulk',
                description: `Bulk imported ${created.length} employees`,
            });
        }

        res.status(200).json({
            success: true,
            message: `Import complete: ${created.length} created, ${errors.length + createErrors.length} failed`,
            created: created.length,
            failed: errors.length + createErrors.length,
            errors: [...errors, ...createErrors],
        });
    } catch (e) {
        console.error('POST /employee/bulk-import failed:', e.message);
        res.status(500).json({ error: 'Internal server error', message: e.message });
    }
});

router.post('/:employee_id/compensation', async (req, res) => {
    const { employee_id } = req.params;
    const { currency, salary_ctc, breakdown, effective_from, effective_to } = req.body;

    try {
        const employee = await prisma.employee.findUnique({
            where: {
                employee_id: employee_id
            }
        })

        if (employee == null) {
            res.status(409).json({ success: true, message: "Employee not found" });
            return
        }

        const latest = await prisma.compensationDetails.findFirst({
            where: { employee_id: employee.id },
            orderBy: { id: 'desc' },
        })

        const breakdown_str = breakdown != null
            ? (typeof breakdown === 'string' ? breakdown : JSON.stringify(breakdown))
            : undefined;

        const compensationDetails = latest
            ? await prisma.compensationDetails.update({
                where: { id: latest.id },
                data: { currency, salary_ctc: salary_ctc != null ? String(salary_ctc) : undefined, breakdown: breakdown_str },
            })
            : await prisma.compensationDetails.create({
                data: { employee_id: employee.id, currency, salary_ctc: salary_ctc != null ? String(salary_ctc) : undefined, breakdown: breakdown_str, effective_from: new Date() },
            })
        res.status(201).json({ success: true, employee: employee, message: "Compensation details updated successfully" });

    } catch (e) {
        console.error('GET /employee/:id failed:', e.message);
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code == 'P2025') {
            return res.status(409).json({ success: false, message: 'Employee not found' })
        }
        res.status(500).json({ error: 'Internal server error', message: e.message });
    }
})

router.post('/:employee_id/statutory', async (req, res) => {
    const { employee_id } = req.params;
    const { bank_name, account_number, ifsc_code, pan_number, aadhar_number, pf_number } = req.body;
    try {
        const employee = await prisma.employee.findUnique({
            where: {
                employee_id: employee_id
            }
        })

        if (employee == null) {
            res.status(409).json({ success: true, message: "Employee not found" });
            return
        }

        const latest = await prisma.statutoryDetails.findFirst({
            where: { employee_id: employee.id },
            orderBy: { id: 'desc' },
        })

        const statutoryDetails = latest
            ? await prisma.statutoryDetails.update({
                where: { id: latest.id },
                data: { bank_name, account_number, ifsc_code, pan_number, aadhar_number, pf_number },
            })
            : await prisma.statutoryDetails.create({
                data: { employee_id: employee.id, bank_name, account_number, ifsc_code, pan_number, aadhar_number, pf_number },
            })

        res.status(201).json({ success: true, employee: employee, message: "Compensation details updated successfully" });

    } catch (e) {
        console.error('GET /employee/:id failed:', e.message);
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code == 'P2025') {
            return res.status(409).json({ success: false, message: 'Employee not found' })
        }
        res.status(500).json({ error: 'Internal server error', message: e.message });
    }
})

router.post('/:employee_id/exit_details', requireAuth, async (req, res) => {
    const { employee_id } = req.params;
    const { last_working_day, exit_reason, final_settlement_status } = req.body;

    try {
        const employee = await prisma.employee.findUnique({
            where: { employee_id }
        });

        if (employee == null) {
            return res.status(404).json({ success: false, message: "Employee not found" });
        }

        const existing = await prisma.exitDetails.findFirst({
            where: { employee_id: employee.id },
            orderBy: { id: 'desc' },
        });

        const exitDetails = existing
            ? await prisma.exitDetails.update({
                where: { id: existing.id },
                data: {
                    last_working_day: last_working_day ? new Date(last_working_day) : undefined,
                    exit_reason,
                    final_settlement_status,
                },
            })
            : await prisma.exitDetails.create({
                data: {
                    employee_id: employee.id,
                    last_working_day: last_working_day ? new Date(last_working_day) : undefined,
                    exit_reason,
                    final_settlement_status,
                },
            });

        await prisma.employee.update({
            where: { id: employee.id },
            data: { employment_status: 'resigned' },
        });

        const actor = await prisma.user.findUnique({ where: { google_sub: req.user.uid }, select: { id: true } });
        if (actor) {
            logActivity({
                actorId: actor.id,
                action: 'EMPLOYEE_RESIGNED',
                entityType: 'employee',
                entityId: employee_id,
                description: `Marked ${employee.full_name} (${employee_id}) as resigned`,
            });
        }

        res.status(201).json({ success: true, exit_details: exitDetails, message: "Exit details updated successfully" });
    } catch (e) {
        console.error('POST /employee/:id/exit_details failed:', e.message);
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        res.status(500).json({ error: 'Internal server error', message: e.message });
    }
});

router.post('/', requireAuth, async (req, res) => {
    try {
        const { employeeInfo } = req.body
        const {
            employee_id,
            full_name,
            gender,
            date_of_birth,
            contact_number,
            email_id,
            address,
            emergency_contact_name,
            emergency_contact_phone,
            family_members,
            reporting_manager_employee_id,
        } = employeeInfo;

        let reporting_manager_id = undefined;
        if (reporting_manager_employee_id) {
            const manager = await prisma.employee.findUnique({
                where: { employee_id: reporting_manager_employee_id },
                select: { id: true },
            });
            if (manager) reporting_manager_id = manager.id;
        }

        const employee = await prisma.employee.create({
            data: {
                employee_id,
                full_name,
                gender,
                date_of_birth: date_of_birth ? new Date(date_of_birth) : undefined,
                contact_number,
                email_id,
                address,
                emergency_contact_name,
                emergency_contact_phone,
                family_members,
                reporting_manager_id,
            },
        });

        const actor = await prisma.user.findUnique({ where: { google_sub: req.user.uid }, select: { id: true } });
        if (actor) {
            logActivity({
                actorId: actor.id,
                action: 'EMPLOYEE_ADDED',
                entityType: 'employee',
                entityId: employee_id,
                description: `Added employee ${full_name} (${employee_id})`,
            });
        }

        res.status(201).json({ success: true, employee: employee, message: "Employee created successfully" });
    } catch (e) {
        console.error('POST /employee failed:', e.message);
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
            const target = Array.isArray(e.meta?.target) ? e.meta.target.join(', ') : e.meta?.target;
            if (target?.includes('employee_id')) {
                return res.status(409).json({ message: 'Employee ID already exists' });
            }
            return res.status(409).json({ message: `Duplicate value for: ${target}` });
        }
        res.status(500).json({ error: 'Internal server error', detail: e.message });
    }
});

router.patch('/:employee_id', requireAuth, async (req, res) => {
    const { employee_id } = req.params;
    const { employeeInfo } = req.body;

    try {
        let reporting_manager_id = undefined;
        if (employeeInfo.reporting_manager_employee_id !== undefined) {
            if (employeeInfo.reporting_manager_employee_id) {
                const manager = await prisma.employee.findUnique({
                    where: { employee_id: employeeInfo.reporting_manager_employee_id },
                    select: { id: true },
                });
                reporting_manager_id = manager ? manager.id : null;
            } else {
                reporting_manager_id = null;
            }
        }

        const updateData = {
            full_name: employeeInfo.full_name,
            gender: employeeInfo.gender,
            date_of_birth: employeeInfo.date_of_birth ? new Date(employeeInfo.date_of_birth) : undefined,
            contact_number: employeeInfo.contact_number,
            email_id: employeeInfo.email_id,
            address: employeeInfo.address,
            department: employeeInfo.department,
            designation: employeeInfo.designation,
            employment_type: employeeInfo.employment_type,
            date_of_joining: employeeInfo.date_of_joining ? new Date(employeeInfo.date_of_joining) : undefined,
            work_location: employeeInfo.work_location,
            source_of_hire: employeeInfo.source_of_hire,
            offer_letter_date: employeeInfo.offer_letter_date ? new Date(employeeInfo.offer_letter_date) : undefined,
            interview_date: employeeInfo.interview_date ? new Date(employeeInfo.interview_date) : undefined,
            interview_panel: employeeInfo.interview_panel,
            emergency_contact_name: employeeInfo.emergency_contact_name,
            emergency_contact_phone: employeeInfo.emergency_contact_phone,
            family_members: employeeInfo.family_members,
            expat_status: employeeInfo.expat_status,
            internal_transfer_date: employeeInfo.internal_transfer_date,
        };

        if (reporting_manager_id !== undefined) {
            updateData.reporting_manager_id = reporting_manager_id;
        }

        const updatedUser = await prisma.employee.update({
            where: { employee_id },
            data: updateData,
        });

        const actor = await prisma.user.findUnique({ where: { google_sub: req.user.uid }, select: { id: true } });
        if (actor) {
            logActivity({
                actorId: actor.id,
                action: 'EMPLOYEE_EDITED',
                entityType: 'employee',
                entityId: employee_id,
                description: `Edited employee ${updatedUser.full_name} (${employee_id})`,
            });
        }

        res.status(200).json({ success: true, employee: updatedUser, message: "Employee details stored successfully" });
    } catch (e) {
        console.error('PATCH /employee/:id failed:', e.message);
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
            const target = Array.isArray(e.meta?.target) ? e.meta.target.join(', ') : e.meta?.target;
            if (target?.includes('employee_id')) {
                return res.status(409).json({ success: false, message: 'Employee ID cannot be updated' });
            }
            return res.status(409).json({ message: `Duplicate value for: ${target}` });
        } else if (e instanceof Prisma.PrismaClientKnownRequestError && e.code == 'P2025') {
            return res.status(409).json({ success: false, message: 'Employee not found' })
        }
        res.status(500).json({ error: 'Internal server error', detail: e.message });
    }
})

router.get('/:employee_id', async (req, res) => {
    const { employee_id } = req.params;

    try {
        const employee = await prisma.employee.findUnique({
            where: { employee_id },
            include: {
                compensation_details: {
                    orderBy: { created_at: 'desc' }
                },
                statutory_details: true,
                exit_details: {
                    orderBy: { id: 'desc' },
                    take: 1,
                },
            }
        })

        if (employee == null) {
            res.status(409).json({ success: true, message: "Employee not found" });
            return
        }

        let reporting_manager_name = null;
        let reporting_manager_employee_id = null;
        if (employee.reporting_manager_id) {
            const manager = await prisma.employee.findUnique({
                where: { id: employee.reporting_manager_id },
                select: { full_name: true, employee_id: true },
            });
            if (manager) {
                reporting_manager_name = manager.full_name;
                reporting_manager_employee_id = manager.employee_id;
            }
        }

        res.status(201).json({
            success: true,
            employee: { ...employee, reporting_manager_name, reporting_manager_employee_id },
            message: "Employee details retrieved successfully",
        });
    } catch (e) {
        console.error('GET /employee/:id failed:', e.message);
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code == 'P2025') {
            return res.status(409).json({ success: false, message: 'Employee not found' })
        }
        res.status(500).json({ error: 'Internal server error', message: e.message });
    }
})

const SORTABLE_FIELDS = ['employee_id', 'created_at'];

router.get('/', async (req, res) => {
    try {
        const search = req.query.search;
        const department = req.query.department;
        const status = req.query.status;
        const expat_status = req.query.expat_status;
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const per_page = Math.min(Math.max(parseInt(req.query.per_page, 10) || 10, 1), 100);
        const sort_by = SORTABLE_FIELDS.includes(req.query.sort_by) ? req.query.sort_by : 'created_at';
        const sort_dir = req.query.sort_dir === 'asc' ? 'asc' : 'desc';

        const where = {};
        if (department) where.department = department;
        if (status) where.employment_status = status;
        if (search) where.OR = [
            { full_name: { contains: search, mode: 'insensitive' } },
            { employee_id: { contains: search, mode: 'insensitive' } }
        ];
        if (expat_status) where.expat_status = expat_status;

        const orderBy = { [sort_by]: sort_dir };
        const skip = (page - 1) * per_page;
        const take = per_page;

        const [employees, total] = await Promise.all([
            prisma.employee.findMany({ where, orderBy, skip, take }),
            prisma.employee.count({ where }),
        ]);

        res.status(200).json({
            success: true,
            employees,
            pagination: { page, per_page, total },
            message: 'Employees retrieved successfully',
        });
    } catch (e) {
        console.error('GET /employee failed:', e.message);
        res.status(500).json({ error: 'Internal server error', detail: e.message });
    }
});

// ---------------------------------------------------------------------------
// Employee documents (Railway bucket, presigned-URL flow)
// ---------------------------------------------------------------------------

// Step 1: hand the browser a short-lived presigned PUT URL to upload directly.
router.post('/:employee_id/documents/upload-url', requireAuth, async (req, res) => {
    const { employee_id } = req.params;
    const { document_type, file_name, content_type } = req.body;

    if (!DOCUMENT_TYPES.has(document_type)) {
        return res.status(400).json({ success: false, message: 'Invalid document type' });
    }

    try {
        const employee = await prisma.employee.findUnique({ where: { employee_id } });
        if (employee == null) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        const storage_key = storage.buildKey({ employeeId: employee_id, documentType: document_type, fileName: file_name });
        const upload_url = await storage.getUploadUrl({ key: storage_key, contentType: content_type });

        res.status(200).json({ success: true, upload_url, storage_key });
    } catch (e) {
        console.error('POST /employee/:id/documents/upload-url failed:', e.message);
        res.status(500).json({ error: 'Internal server error', message: e.message });
    }
});

// Step 2: after the browser PUTs the file, record the metadata. One row per
// (employee, document_type) — re-uploading replaces and deletes the old object.
router.post('/:employee_id/documents', requireAuth, async (req, res) => {
    const { employee_id } = req.params;
    const { document_type, file_name, storage_key, content_type, size } = req.body;

    if (!DOCUMENT_TYPES.has(document_type)) {
        return res.status(400).json({ success: false, message: 'Invalid document type' });
    }
    if (!storage_key || !file_name) {
        return res.status(400).json({ success: false, message: 'file_name and storage_key are required' });
    }

    try {
        const employee = await prisma.employee.findUnique({ where: { employee_id } });
        if (employee == null) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        const existing = await prisma.employeeDocument.findUnique({
            where: { employee_id_document_type: { employee_id: employee.id, document_type } },
        });

        const actor = await prisma.user.findUnique({ where: { google_sub: req.user.uid }, select: { id: true } });

        const document = await prisma.employeeDocument.upsert({
            where: { employee_id_document_type: { employee_id: employee.id, document_type } },
            update: { file_name, storage_key, content_type, size, uploaded_by: actor ? actor.id : undefined },
            create: { employee_id: employee.id, document_type, file_name, storage_key, content_type, size, uploaded_by: actor ? actor.id : undefined },
        });

        // Remove the previous object once the new one is recorded.
        if (existing && existing.storage_key && existing.storage_key !== storage_key) {
            storage.deleteObject(existing.storage_key).catch((err) =>
                console.error('Failed to delete replaced object:', err.message));
        }

        if (actor) {
            logActivity({
                actorId: actor.id,
                action: 'DOCUMENT_UPLOADED',
                entityType: 'employee',
                entityId: employee_id,
                description: `Uploaded ${document_type} for ${employee.full_name} (${employee_id})`,
            });
        }

        res.status(201).json({ success: true, document, message: 'Document saved successfully' });
    } catch (e) {
        console.error('POST /employee/:id/documents failed:', e.message);
        res.status(500).json({ error: 'Internal server error', message: e.message });
    }
});

// List a employee's document metadata (forms prefill + view page).
router.get('/:employee_id/documents', requireAuth, async (req, res) => {
    const { employee_id } = req.params;
    try {
        const employee = await prisma.employee.findUnique({ where: { employee_id } });
        if (employee == null) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        const documents = await prisma.employeeDocument.findMany({
            where: { employee_id: employee.id },
            orderBy: { document_type: 'asc' },
        });

        res.status(200).json({ success: true, documents });
    } catch (e) {
        console.error('GET /employee/:id/documents failed:', e.message);
        res.status(500).json({ error: 'Internal server error', message: e.message });
    }
});

// Short-lived presigned GET URL to view/download a stored document.
router.get('/:employee_id/documents/:id/download-url', requireAuth, async (req, res) => {
    const { employee_id, id } = req.params;
    try {
        const employee = await prisma.employee.findUnique({ where: { employee_id } });
        if (employee == null) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        const document = await prisma.employeeDocument.findFirst({
            where: { id: Number(id), employee_id: employee.id },
        });
        if (document == null) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        const url = await storage.getDownloadUrl({ key: document.storage_key });
        res.status(200).json({ success: true, url });
    } catch (e) {
        console.error('GET /employee/:id/documents/:id/download-url failed:', e.message);
        res.status(500).json({ error: 'Internal server error', message: e.message });
    }
});

// Delete a document (object + metadata row).
router.delete('/:employee_id/documents/:id', requireAuth, async (req, res) => {
    const { employee_id, id } = req.params;
    try {
        const employee = await prisma.employee.findUnique({ where: { employee_id } });
        if (employee == null) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        const document = await prisma.employeeDocument.findFirst({
            where: { id: Number(id), employee_id: employee.id },
        });
        if (document == null) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        await prisma.employeeDocument.delete({ where: { id: document.id } });
        storage.deleteObject(document.storage_key).catch((err) =>
            console.error('Failed to delete object:', err.message));

        const actor = await prisma.user.findUnique({ where: { google_sub: req.user.uid }, select: { id: true } });
        if (actor) {
            logActivity({
                actorId: actor.id,
                action: 'DOCUMENT_DELETED',
                entityType: 'employee',
                entityId: employee_id,
                description: `Deleted ${document.document_type} for ${employee.full_name} (${employee_id})`,
            });
        }

        res.status(200).json({ success: true, message: 'Document deleted successfully' });
    } catch (e) {
        console.error('DELETE /employee/:id/documents/:id failed:', e.message);
        res.status(500).json({ error: 'Internal server error', message: e.message });
    }
});

// Manually trigger a reminder job (for testing — the cron only fires at 09:00).
// Body: { job: 'daily' | 'monthly', force?: boolean }. force bypasses dedup.
router.post('/reminders/run', requireAuth, async (req, res) => {
    const { job, force = false } = req.body || {};
    try {
        let summary;
        if (job === 'daily') {
            summary = await runDailyReminders({ force });
        } else if (job === 'monthly') {
            summary = await runMonthlyBirthdayDigest({ force });
        } else {
            return res.status(400).json({ success: false, message: "job must be 'daily' or 'monthly'" });
        }
        res.status(200).json({ success: true, summary });
    } catch (e) {
        console.error('POST /employee/reminders/run failed:', e.message);
        res.status(500).json({ error: 'Internal server error', message: e.message });
    }
});

module.exports = router;
