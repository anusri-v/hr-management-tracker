import { Button, Col, Flex, Form, Input, message, Row } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { useState } from "react";
import type { Employee } from "../../utils/types/employee";
import { emptyStatutoryDetails } from "../../utils/types/employee";
import apiClient from "../../utils/apiClient";
import shared from '../../utils/styles/shared.module.css';

type BasicInformationSectionProps = {
    employee: Employee,
    setEmployee: React.Dispatch<React.SetStateAction<Employee>>,
    handleSectionNavigation: (dir: string) => void
}

type StatutoryFormValues = {
    bank_name: string;
    account_number: string;
    ifsc_code: string;
    pan_number: string;
    aadhar_number: string;
    pf_number: string;
}

const StatutorySection = ({ employee, setEmployee, handleSectionNavigation }: BasicInformationSectionProps) => {
    const [form] = Form.useForm<StatutoryFormValues>();

    const statutory = employee.statutory_details[0];

    const initialValues: StatutoryFormValues = {
        bank_name: statutory?.bank_name ?? '',
        account_number: statutory?.account_number ?? '',
        ifsc_code: statutory?.ifsc_code ?? '',
        pan_number: statutory?.pan_number ?? '',
        aadhar_number: statutory?.aadhar_number ?? '',
        pf_number: statutory?.pf_number ?? '',
    }

    const syncFormToParent = (values: StatutoryFormValues) => {
        setEmployee((prev) => ({
            ...prev,
            statutory_details: [
                {
                    ...(prev.statutory_details[0] ?? emptyStatutoryDetails()),
                    bank_name: values.bank_name,
                    account_number: values.account_number,
                    ifsc_code: values.ifsc_code,
                    pan_number: values.pan_number,
                    aadhar_number: values.aadhar_number,
                    pf_number: values.pf_number,
                },
                ...prev.statutory_details.slice(1),
            ],
        }));
    };

    const [saving, setSaving] = useState(false);

    async function handleStatutoryUpdate(values: StatutoryFormValues) {
        setSaving(true);
        try {
            const data = await apiClient.post<{ success: boolean; message: string }>(
                `/employee/${employee.employee_id}/statutory`,
                {
                    bank_name: values.bank_name,
                    account_number: values.account_number,
                    ifsc_code: values.ifsc_code,
                    pan_number: values.pan_number,
                    aadhar_number: values.aadhar_number,
                    pf_number: values.pf_number,
                },
            );

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
                    onFinish={handleStatutoryUpdate}
                    onValuesChange={(_, allValues) => syncFormToParent(allValues)}
                    className={shared.fullWidth}
                >
                    <Flex vertical className={shared.sectionCard}>
                        <Row gutter={[24, 48]}>
                            <Col span={12}>
                                <Form.Item label="Bank Name" name={"bank_name"}>
                                    <Input placeholder="Bank Name" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Account Number" name={"account_number"}>
                                    <Input placeholder="Account Number" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={[24, 48]}>
                            <Col span={12}>
                                <Form.Item label="IFSC Code" name={"ifsc_code"}>
                                    <Input placeholder="IFSC Code" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="PAN Number" name={"pan_number"} rules={[{ required: true, message: 'PAN Number is required' }]}>
                                    <Input placeholder="ABCDE1234F" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={[24, 48]}>
                            <Col span={12}>
                                <Form.Item label="Aadhar Number" name={"aadhar_number"} rules={[{ required: true, message: 'Aadhar Number is required' }]}>
                                    <Input.Password placeholder="0000 0000 0000" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="UAN / PF number" name={"pf_number"} rules={[{ required: true, message: 'Aadhar Number is required' }]}>
                                    <Input placeholder="000000000000" />
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

export default StatutorySection;
