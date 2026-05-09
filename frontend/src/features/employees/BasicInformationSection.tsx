import { Button, Col, DatePicker, Flex, Form, Input, message, Radio, Row } from "antd";
import TextArea from "antd/es/input/TextArea";
import { SaveOutlined } from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import type { Employee } from "../../utils/types/employee";
import apiClient from "../../utils/apiClient";
import { DATE_FORMAT } from "../../utils/constants/constants";

type BasicInformationSectionProps = {
    employee: Employee,
    setEmployee: React.Dispatch<React.SetStateAction<Employee>>,
    handleSectionNavigation: (dir: string) => void
}

type BasicInfoFormValues = {
    employee_id: string;
    full_name: string;
    gender: string;
    date_of_birth: Dayjs | null;
    contact_number: string;
    email_id: string;
    address: string;
    emergency_contact_name: string;
    emergency_contact_number: string;
    father_name: string;
    mother_name: string;
    spouse_name: string;
    child1_name: string;
    child2_name: string;
}

const BasicInformationSection = ({ employee, setEmployee, handleSectionNavigation }: BasicInformationSectionProps) => {
    const [form] = Form.useForm<BasicInfoFormValues>();

    const initialValues: BasicInfoFormValues = {
        employee_id: employee.employee_id,
        full_name: employee.full_name,
        gender: employee.gender || 'prefer-not-to-say',
        date_of_birth: employee.date_of_birth ? dayjs(employee.date_of_birth, DATE_FORMAT) : null,
        contact_number: employee.contact_number,
        email_id: employee.email_id,
        address: employee.address,
        emergency_contact_name: employee.emergency_contact_name ?? '',
        emergency_contact_number: employee.emergency_contact_phone ?? '',
        father_name: employee.family_members?.father_name ?? '',
        mother_name: employee.family_members?.mother_name ?? '',
        spouse_name: employee.family_members?.spouse_name ?? '',
        child1_name: employee.family_members?.child1_name ?? '',
        child2_name: employee.family_members?.child2_name ?? '',
    };

    const isEditMode = employee.id !== undefined;

    const syncFormToParent = (values: BasicInfoFormValues) => {
        setEmployee((prev) => ({
            ...prev,
            employee_id: values.employee_id ?? '',
            full_name: values.full_name ?? '',
            gender: values.gender ?? '',
            date_of_birth: values.date_of_birth ? values.date_of_birth.format(DATE_FORMAT) : '',
            contact_number: values.contact_number ?? '',
            email_id: values.email_id ?? '',
            address: values.address ?? '',
            emergency_contact_name: values.emergency_contact_name ?? '',
            emergency_contact_phone: values.emergency_contact_number ?? '',
            family_members: {
                father_name: values.father_name ?? '',
                mother_name: values.mother_name ?? '',
                spouse_name: values.spouse_name ?? '',
                child1_name: values.child1_name ?? '',
                child2_name: values.child2_name ?? '',
            },
        }));
    };

    async function handleEmployeeSave(values: BasicInfoFormValues) {
        const employeeInfo = {
            employee_id: values.employee_id,
            full_name: values.full_name,
            gender: values.gender,
            date_of_birth: values.date_of_birth ? values.date_of_birth.format(DATE_FORMAT) : '',
            contact_number: values.contact_number,
            email_id: values.email_id,
            address: values.address,
            emergency_contact_name: values.emergency_contact_name,
            emergency_contact_phone: values.emergency_contact_number,
            family_members: {
                father_name: values.father_name ?? null,
                mother_name: values.mother_name ?? null,
                spouse_name: values.spouse_name ?? null,
                child1_name: values.child1_name ?? null,
                child2_name: values.child2_name ?? null,
            },
        };

        try {
            const data = await (isEditMode
                ? apiClient.patch<{ success: boolean; message: string; employee: Employee }>(`/employee/${employee.employee_id}`, { employeeInfo })
                : apiClient.post<{ success: boolean; message: string; employee: Employee }>('/employee', { employeeInfo }));

            if (!data.success) {
                message.error(data.message ?? 'Something went wrong');
                return;
            }

            setEmployee((prev) => ({ ...prev, id: data.employee.id }));
            message.success(data.message);
            handleSectionNavigation('next');
        } catch (e) {
            console.error('Save failed:', e);
            message.error('Internal server error');
        }
    }

    return (
        <Flex vertical style={{ width: '100%' }}>
            <Form
                form={form}
                layout="vertical"
                initialValues={initialValues}
                onFinish={handleEmployeeSave}
                onValuesChange={(_, allValues) => syncFormToParent(allValues)}
                style={{ width: '100%' }}
            >
                <Flex vertical style={{ background: '#FFFFFF', width: '100%', padding: 24, marginTop: 24, borderRadius: 20, borderColor: '#E6EAEE', borderWidth: 1, borderStyle: 'solid' }}>
                    <Row gutter={[24, 0]}>
                        <Col span={12}>
                            <Form.Item
                                label="Employee ID"
                                name="employee_id"
                                rules={[{ required: true, message: 'Employee ID is required' }]}
                            >
                                <Input disabled={isEditMode} placeholder="Employee ID" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Full Name"
                                name="full_name"
                                rules={[{ required: true, message: 'Full Name is required' }]}
                            >
                                <Input placeholder="Full Name" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[24, 0]}>
                        <Col span={12}>
                            <Form.Item
                                label="Gender"
                                name="gender"
                                rules={[{ required: true, message: 'Gender is required' }]}
                            >
                                <Radio.Group>
                                    <Radio.Button value="female">Female</Radio.Button>
                                    <Radio.Button value="male">Male</Radio.Button>
                                    <Radio.Button value="prefer-not-to-say">Prefer not to say</Radio.Button>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Date of Birth"
                                name="date_of_birth"
                                rules={[{ required: true, message: 'Date of Birth is required' }]}
                            >
                                <DatePicker format={DATE_FORMAT} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[24, 0]}>
                        <Col span={12}>
                            <Form.Item
                                label="Contact Number"
                                name="contact_number"
                                rules={[{ required: true, message: 'Contact Number is required' }, { len: 10, message: 'Phone number should be 10 digits' }]}
                            >
                                <Input placeholder="Contact Number" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Email ID"
                                name="email_id"
                                rules={[
                                    { required: true, message: 'Email ID is required' },
                                    { type: 'email', message: 'Enter a valid email' },
                                ]}
                            >
                                <Input placeholder="Email ID" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[24, 0]}>
                        <Col span={24}>
                            <Form.Item
                                label="Address"
                                name="address"
                                rules={[{ required: true, message: 'Address is required' }]}
                            >
                                <TextArea rows={4} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[24, 0]}>
                        <Col span={12}>
                            <Form.Item
                                label="Emergency Contact Name"
                                name="emergency_contact_name"
                            >
                                <Input placeholder="Emergency Contact Name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Emergency Contact Number"
                                name="emergency_contact_number"
                            >
                                <Input placeholder="Emergency Contact Number" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[24, 0]}>
                        <Col span={12}>
                            <Form.Item label="Father's Name" name="father_name">
                                <Input placeholder="Father's Name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Mother's Name" name="mother_name">
                                <Input placeholder="Mother's Name" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[24, 0]}>
                        <Col span={12}>
                            <Form.Item label="Spouse's Name" name="spouse_name">
                                <Input placeholder="Spouse's Name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Child 1 Name" name="child1_name">
                                <Input placeholder="Child 1 Name" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[24, 0]}>
                        <Col span={12}>
                            <Form.Item label="Child 2 Name" name="child2_name">
                                <Input placeholder="Child 2 Name" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Flex>

                <Flex style={{ width: '100%', marginTop: 16, paddingLeft: 16, paddingRight: 16 }} justify="space-between">
                    <Button htmlType="button" disabled>Previous</Button>
                    <Flex gap={16}>
                        {isEditMode && <Button onClick={() => { handleSectionNavigation('next') }}>Next</Button>}
                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                            Save & Next
                        </Button>
                    </Flex>
                </Flex>
            </Form>
        </Flex>
    );
};

export default BasicInformationSection;
