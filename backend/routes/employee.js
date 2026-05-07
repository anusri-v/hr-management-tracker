const express = require('express');
const { Prisma } = require('@prisma/client');

const router = express.Router();
const prisma = require('../lib/prisma');

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
            const target = Array.isArray(e.meta?.target) ? e.meta.target.join(', ') : e.meta?.target;
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
            const target = Array.isArray(e.meta?.target) ? e.meta.target.join(', ') : e.meta?.target;
            return res.status(409).json({ success: false, message: 'Employee not found' })
        }
        res.status(500).json({ error: 'Internal server error', message: e.message });
    }
})

router.post('/', async (req, res) => {
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
            family_members
        } = employeeInfo;

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
                family_members
            },
        });

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

router.patch('/:employee_id', async (req, res) => {
    const { employee_id } = req.params;
    const { employeeInfo } = req.body;

    try {
        const updatedUser = await prisma.employee.update({
            where: {
                employee_id: employee_id
            },
            data: {
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
            }
        })

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
            const target = Array.isArray(e.meta?.target) ? e.meta.target.join(', ') : e.meta?.target;
            return res.status(409).json({ success: false, message: 'Employee not found' })
        }
        res.status(500).json({ error: 'Internal server error', detail: e.message });
    }
})

router.get('/:employee_id', async (req, res) => {
    const { employee_id } = req.params;

    try {
        const employee = await prisma.employee.findUnique({
            where: {
                employee_id
            },
            include: {
                compensation_details: {
                    orderBy: { created_at: 'desc' }
                },
                statutory_details: true
            }
        })

        if (employee == null) {
            res.status(409).json({ success: true, message: "Employee not found" });
            return
        }

        res.status(201).json({ success: true, employee: employee, message: "Employee details retrieved successfully" });
    } catch (e) {
        console.error('GET /employee/:id failed:', e.message);
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code == 'P2025') {
            const target = Array.isArray(e.meta?.target) ? e.meta.target.join(', ') : e.meta?.target;
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

module.exports = router;

