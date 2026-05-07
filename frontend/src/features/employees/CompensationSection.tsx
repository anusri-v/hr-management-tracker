import { Button, Col, Flex, Form, InputNumber, message, Row, Select } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import type { Employee } from "../../utils/types/employee";
import { emptyCompensationDetails } from "../../utils/types/employee";
import { CURRENCY_PREFIX, currencyOptions } from "../../utils/constants/constants";
import { API_URL } from "../../App";

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
        const url = `${API_URL}/employee/${employee.employee_id}/compensation`

        try {
            const res = await fetch(url, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currency: values.currency,
                    salary_ctc: values.salary_ctc,
                }),
            })
            const data = await res.json();

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
            <Flex vertical style={{ width: '100%' }}>
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={initialValues}
                    onFinish={handleCompensationUpdate}
                    onValuesChange={(_, allValues) => syncFormToParent(allValues)}
                    style={{ width: '100%' }}
                >
                    <Flex vertical style={{ background: '#FFFFFF', width: '100%', padding: 24, marginTop: 24, borderRadius: 20, borderColor: '#E6EAEE', borderWidth: 1, borderStyle: 'solid' }}>
                        <Row gutter={[24, 48]}>
                            <Col span={12}>
                                <Form.Item label="Currency" name={"currency"} rules={[{ required: true, message: 'Currency is required' }]}>
                                    <Select placeholder="Select Currency" options={currencyOptions} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Annual CTC" name={"salary_ctc"} rules={[{ required: true, message: 'Annual CTC is required' }]}>
                                    <InputNumber style={{ width: '100%' }} placeholder="0" prefix={prefix} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Flex>

                    <Flex style={{ width: '100%', marginTop: 16, paddingLeft: 16, paddingRight: 16 }} justify="space-between">
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
