import { Button, Col, Flex, Form, InputNumber, message, Row, Select } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import type { Employee } from "../../utils/types/employee";
import { emptyCompensationDetails } from "../../utils/types/employee";
import { CURRENCY_PREFIX, currencyOptions } from "../../utils/constants/constants";
import apiClient from "../../utils/apiClient";
import shared from '../../utils/styles/shared.module.css';

type BasicInformationSectionProps = {
    employee: Employee,
    setEmployee: React.Dispatch<React.SetStateAction<Employee>>,
    handleSectionNavigation: (dir: string) => void
}

type CompensationFormValues = {
    currency: string;
    salary_ctc: string;
}

const CompensationSection = ({ employee, setEmployee, handleSectionNavigation }: BasicInformationSectionProps) => {
    const [form] = Form.useForm<CompensationFormValues>();

    const selectedCurrency = Form.useWatch('currency', form);
    const prefix = CURRENCY_PREFIX[selectedCurrency] ?? '';

    const compensation = employee.compensation_details[0];

    const initialValues: CompensationFormValues = {
        currency: compensation?.currency ?? '',
        salary_ctc: compensation?.salary_ctc ?? '',
    };

    const syncFormToParent = (values: CompensationFormValues) => {
        setEmployee((prev) => ({
            ...prev,
            compensation_details: [
                {
                    ...(prev.compensation_details[0] ?? emptyCompensationDetails()),
                    currency: values.currency,
                    salary_ctc: values.salary_ctc,
                },
                ...prev.compensation_details.slice(1),
            ],
        }));
    };

    async function handleCompensationUpdate(values: CompensationFormValues) {
        try {
            const data = await apiClient.post<{ success: boolean; message: string }>(
                `/employee/${employee.employee_id}/compensation`,
                { currency: values.currency, salary_ctc: values.salary_ctc },
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
        }
    }

    return (
        <>
            <Flex vertical className={shared.fullWidth}>
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={initialValues}
                    onFinish={handleCompensationUpdate}
                    onValuesChange={(_, allValues) => syncFormToParent(allValues)}
                    className={shared.fullWidth}
                >
                    <Flex vertical className={shared.sectionCard}>
                        <Row gutter={[24, 48]}>
                            <Col span={12}>
                                <Form.Item label="Currency" name={"currency"} rules={[{ required: true, message: 'Currency is required' }]}>
                                    <Select placeholder="Select Currency" options={currencyOptions} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Annual CTC" name={"salary_ctc"} rules={[{ required: true, message: 'Annual CTC is required' }]}>
                                    <InputNumber className={shared.fullWidth} placeholder="0" prefix={prefix} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Flex>

                    <Flex className={shared.sectionNavBar} justify="space-between">
                        <Button onClick={() => { handleSectionNavigation('prev') }}>Previous</Button>
                        <Flex gap={16}>
                            <Button onClick={() => { handleSectionNavigation('next') }}>Next</Button>
                            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                                Save & Next
                            </Button>
                        </Flex>
                    </Flex>
                </Form>
            </Flex>
        </>
    );
};

export default CompensationSection;
