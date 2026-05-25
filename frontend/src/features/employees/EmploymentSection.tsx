import { Button, Col, DatePicker, Flex, Form, Input, message, Radio, Row, Select } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import type { Employee } from "../../utils/types/employee";
import apiClient from "../../utils/apiClient";
import { DATE_FORMAT, departmentOptions, workLocationOption } from "../../utils/constants/constants";
import shared from '../../utils/styles/shared.module.css';

type BasicInformationSectionProps = {
    employee: Employee,
    setEmployee: React.Dispatch<React.SetStateAction<Employee>>,
    handleSectionNavigation: (dir: string) => void
}

type EmploymentFormValues = {
    department: string;
    designation: string;
    reporting_manager_employee_id: string | null;
    employment_type: string;
    date_of_joining: Dayjs | null;
    internal_transfer_date: Dayjs | null;
    work_location: string;
    expat_status: string | null;
}

type ManagerOption = { label: string; value: string };

const EmploymentSection = ({ employee, setEmployee, handleSectionNavigation }: BasicInformationSectionProps) => {
    const [form] = Form.useForm<EmploymentFormValues>();
    const [allManagers, setAllManagers] = useState<ManagerOption[]>([]);
    const [managerLoading, setManagerLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const managerOptions = allManagers.filter(e => e.value !== employee.employee_id);

    useEffect(() => {
        fetchManagers();
    }, []);

    async function fetchManagers() {
        setManagerLoading(true);
        try {
            const data = await apiClient.get<{ employees: { employee_id: string; full_name: string }[] }>('/employee?per_page=1000');
            const options = (data.employees ?? []).map(e => ({ label: `${e.full_name} (${e.employee_id})`, value: e.employee_id }));
            setAllManagers(options);
        } catch {
            // non-critical, select will just be empty
        } finally {
            setManagerLoading(false);
        }
    }

    const initialValues: EmploymentFormValues = {
        department: employee.department ?? '',
        designation: employee.designation ?? '',
        reporting_manager_employee_id: employee.reporting_manager_employee_id ?? null,
        employment_type: employee.employment_type ?? '',
        date_of_joining: employee.date_of_joining ? dayjs(employee.date_of_joining, DATE_FORMAT) : null,
        internal_transfer_date: employee.internal_transfer_date ? dayjs(employee.internal_transfer_date, DATE_FORMAT) : null,
        work_location: employee.work_location ?? '',
        expat_status: employee.expat_status ?? 'native',
    };

    const syncFormToParent = (values: EmploymentFormValues) => {
        setEmployee((prev) => ({
            ...prev,
            department: values.department,
            designation: values.designation,
            employment_type: values.employment_type,
            date_of_joining: values.date_of_joining ? values.date_of_joining?.format(DATE_FORMAT) : '',
            internal_transfer_date: values.internal_transfer_date ? values.internal_transfer_date.format(DATE_FORMAT) : null,
            work_location: values.work_location,
            expat_status: values.expat_status,
        }));
    };

    async function handleEmployeeUpdate(values: EmploymentFormValues) {
        const employeeInfo = {
            department: values.department,
            designation: values.designation,
            reporting_manager_employee_id: values.reporting_manager_employee_id ?? undefined,
            employment_type: values.employment_type,
            date_of_joining: values.date_of_joining ? values.date_of_joining.format(DATE_FORMAT) : '',
            internal_transfer_date: values.internal_transfer_date ? values.internal_transfer_date.format(DATE_FORMAT) : null,
            work_location: values.work_location,
            expat_status: values.expat_status,
        }

        setSaving(true);
        try {
            const data = await apiClient.patch<{ success: boolean; message: string }>(`/employee/${employee.employee_id}`, { employeeInfo });

            if (!data.success) {
                message.error(data.message ?? 'Something went wrong')
                return
            }

            message.success(data.message)
            handleSectionNavigation('next')
        } catch (e) {
            console.error('Update failed: ', e)
            message.error('Internal server error')
        } finally {
            setSaving(false);
        }
    }

    return (
        <>
            <Flex vertical className={shared.fullWidth}>
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={initialValues}
                    onFinish={handleEmployeeUpdate}
                    onValuesChange={(_, allValues) => syncFormToParent(allValues)}
                    className={shared.fullWidth}
                >
                    <Flex vertical className={shared.sectionCard}>
                        <Row gutter={[24, 48]}>
                            <Col span={12}>
                                <Form.Item label="Department" name={"department"} rules={[{ required: true, message: 'Department is required' }]}>
                                    <Select placeholder="Select Department" options={departmentOptions} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Designation" name={"designation"} rules={[{ required: true, message: 'Designation is required' }]}>
                                    <Input placeholder="Designation" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={[24, 48]}>
                            <Col span={12}>
                                <Form.Item label="Reporting Manager" name={"reporting_manager_employee_id"}>
                                    <Select
                                        placeholder="Select Reporting Manager"
                                        options={managerOptions}
                                        loading={managerLoading}
                                        showSearch
                                        allowClear
                                        filterOption={(input, option) =>
                                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                        }
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Employment Type" name={"employment_type"} rules={[{ required: true, message: 'Employment Type is required' }]}>
                                    <Radio.Group>
                                        <Radio.Button value="full-time">Full Time</Radio.Button>
                                        <Radio.Button value="intern">Intern</Radio.Button>
                                        <Radio.Button value="contract">Contract</Radio.Button>
                                    </Radio.Group>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={[24, 48]}>
                            <Col span={12}>
                                <Form.Item label="Date of Joining" name={"date_of_joining"} rules={[{ required: true, message: 'Date of Joining is required' }]} >
                                    <DatePicker format={DATE_FORMAT} className={shared.fullWidth} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Internal Transfer Date" name={"internal_transfer_date"} >
                                    <DatePicker format={DATE_FORMAT} className={shared.fullWidth} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={[24, 48]}>
                            <Col span={12}>
                                <Form.Item label="Expat Status" name={"expat_status"} >
                                    <Radio.Group defaultValue={"native"}>
                                        <Radio.Button value="native">Native</Radio.Button>
                                        <Radio.Button value="expat">Expat</Radio.Button>
                                    </Radio.Group>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Work Location" name={"work_location"} rules={[{ required: true, message: 'Work Location is required' }]} >
                                    <Select placeholder="Select Work Location" options={workLocationOption} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Flex>

                    <Flex className={shared.sectionNavBar} justify="space-between">
                        <Button onClick={() => { handleSectionNavigation('prev') }}>Previous</Button>
                        <Flex gap={16}>
                            <Button onClick={() => { handleSectionNavigation('next') }}>Next</Button>
                            <Button type="primary" htmlType="submit" loading={saving} icon={<SaveOutlined />}>
                                Save & Next
                            </Button>
                        </Flex>
                    </Flex>
                </Form>
            </Flex>
        </>
    );
};

export default EmploymentSection;
