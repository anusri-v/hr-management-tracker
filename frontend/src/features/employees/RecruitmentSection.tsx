import { Button, Col, DatePicker, Flex, Form, Input, message, Radio, Row } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import type { Employee } from "../../utils/types/employee";
import apiClient from "../../utils/apiClient";
import { DATE_FORMAT } from "../../utils/constants/constants";
import shared from '../../utils/styles/shared.module.css';

type BasicInformationSectionProps = {
    employee: Employee,
    setEmployee: React.Dispatch<React.SetStateAction<Employee>>,
    handleSectionNavigation: (dir: string) => void
}

type RecruitmentFormValues = {
    source_of_hire: string;
    offer_letter_date: Dayjs | null;
    interview_date: Dayjs | null;
    interview_panel: string;
}

const RecruitmentSection = ({ employee, setEmployee, handleSectionNavigation }: BasicInformationSectionProps) => {
    const [form] = Form.useForm<RecruitmentFormValues>();

    const initialValues: RecruitmentFormValues = {
        source_of_hire: employee.source_of_hire ?? '',
        offer_letter_date: employee.offer_letter_date ? dayjs(employee.offer_letter_date, DATE_FORMAT) : null,
        interview_date: employee.interview_date ? dayjs(employee.interview_date, DATE_FORMAT) : null,
        interview_panel: employee.interview_panel ?? '',
    };

    const syncFormToParent = (values: RecruitmentFormValues) => {
        setEmployee((prev) => ({
            ...prev,
            source_of_hire: values.source_of_hire,
            offer_letter_date: values.offer_letter_date ? values.offer_letter_date.format(DATE_FORMAT) : "",
            interview_date: values.interview_date ? values.interview_date.format(DATE_FORMAT) : "",
            interview_panel: values.interview_panel,
        }));
    };

    const [saving, setSaving] = useState(false);

    async function handleEmployeeUpdate(values: RecruitmentFormValues) {
        const employeeInfo = {
            source_of_hire: values.source_of_hire,
            offer_letter_date: values.offer_letter_date ? values.offer_letter_date.format(DATE_FORMAT) : "",
            interview_date: values.interview_date ? values.interview_date.format(DATE_FORMAT) : "",
            interview_panel: values.interview_panel,
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
                                <Form.Item label="Source of Hire" name={"source_of_hire"} rules={[{ required: true, message: 'Source of Hire is required' }]}>
                                    <Radio.Group>
                                        <Radio.Button value="referral">Referral</Radio.Button>
                                        <Radio.Button value="campus">Campus</Radio.Button>
                                        <Radio.Button value="consultant">Consultant</Radio.Button>
                                        <Radio.Button value="direct">Direct</Radio.Button>
                                    </Radio.Group>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Offer Letter Date" name={"offer_letter_date"} rules={[{ required: true, message: 'Offer Letter Date is required' }]}>
                                    <DatePicker format={DATE_FORMAT} className={shared.fullWidth} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={[24, 48]}>
                            <Col span={12}>
                                <Form.Item label="Interview Date" name={"interview_date"} >
                                    <DatePicker format={DATE_FORMAT} className={shared.fullWidth} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Interview Panel" name={"interview_panel"} >
                                    <Input placeholder="Interview Panel" />
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

export default RecruitmentSection;
