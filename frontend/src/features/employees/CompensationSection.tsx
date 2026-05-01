import { Button, Col, Flex, Input, InputNumber, Row, Select } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import type { Employee } from "./AddEmployee";
import { useState } from "react";

const currencyOptions = [
    { label: 'INR - Indian Rupee', value: 'inr' },
    { label: 'QAR - Qatari Riyal', value: 'qar' },
    { label: 'AED - UAE Dirham', value: 'aed' },
    { label: 'BDT - Bangladeshi Taka', value: 'bdt' },
    { label: 'USD - US Dollar', value: 'usd' },
];

type BasicInformationSectionProps = {
    employee: Employee,
    setEmployee: React.Dispatch<React.SetStateAction<Employee>>,
    handleSectionNavigation: (dir: string) => void
}

const CompensationSection = ({ employee, setEmployee, handleSectionNavigation }: BasicInformationSectionProps) => {
    const [currency, setCurrency] = useState("₹");
    const handleInputChange = (value: string, field: string) => {
        switch (field) {
            case 'currency':
                setEmployee({ ...employee, currency: value })
                handleCurrencyPrefix(value)
                break;
            case 'ctc':
                setEmployee({ ...employee, ctc: value })
                break;
            case 'bank_name':
                setEmployee({ ...employee, bank_name: value })
                break;
            case 'account_number':
                setEmployee({ ...employee, account_number: value })
                break;
            case 'ifsc_code':
                setEmployee({ ...employee, ifsc_code: value })
                break;
            default:
                break;
        }
    }

    const handleCurrencyPrefix = (currency: string) => {
        switch (currency) {
            case 'inr':
                setCurrency('₹')
                break;
            case 'qar':
                setCurrency('﷼')
                break;
            case 'aed':
                setCurrency('د.إ')
                break;
            case 'bdt':
                setCurrency('৳')
                break;
            case 'usd':
                setCurrency('$')
                break;
            default:
                break;
        }
    }

    return (
        <>
            <Flex vertical style={{ width: '100%' }}>
                <Flex vertical style={{ background: '#FFFFFF', width: '100%', padding: 24, marginTop: 24, borderRadius: 20, borderColor: '#E6EAEE', borderWidth: 1, borderStyle: 'solid' }}>
                    <Row gutter={[24, 48]}>
                        <Col span={12}>
                            <Flex vertical style={{ marginBottom: 16 }}>
                                <span style={{ margin: 4 }}>Currency<span style={{ color: 'red' }}> *</span></span>
                                <Select
                                    placeholder="Select Currency"
                                    value={employee.currency || undefined}
                                    onChange={(value) => handleInputChange(value, 'currency')}
                                    options={currencyOptions}
                                />
                            </Flex>
                        </Col>
                        <Col span={12}>
                            <Flex vertical style={{ marginBottom: 16 }}>
                                <span style={{ margin: 4 }}>Annual CTC<span style={{ color: 'red' }}> *</span></span>
                                <InputNumber style={{ width: '100%' }} placeholder="0" prefix={currency} value={employee.ctc} onChange={(e) => handleInputChange(e || '', 'ctc')} />
                            </Flex>
                        </Col>
                    </Row>
                    <Row gutter={[24, 48]}>
                        <Col span={12}>
                            <Flex vertical style={{ marginBottom: 16 }}>
                                <span style={{ margin: 4 }}>Bank Name</span>
                                <Input placeholder="Bank Name" value={employee.bank_name} onChange={(e) => handleInputChange(e.target.value, 'bank_name')} />
                            </Flex>
                        </Col>
                        <Col span={12}>
                            <Flex vertical style={{ marginBottom: 16 }}>
                                <span style={{ margin: 4 }}>Account Number</span>
                                <Input placeholder="Account Number" value={employee.account_number} onChange={(e) => handleInputChange(e.target.value, 'account_number')} />
                            </Flex>
                        </Col>
                    </Row>
                    <Row gutter={[24, 48]}>
                        <Col span={12}>
                            <Flex vertical style={{ marginBottom: 16 }}>
                                <span style={{ margin: 4 }}>IFSC Code</span>
                                <Input placeholder="IFSC Code" value={employee.ifsc_code} onChange={(e) => handleInputChange(e.target.value, 'ifsc_code')} />
                            </Flex>
                        </Col>
                    </Row>
                </Flex>

                <Flex style={{ width: '100%', marginTop: 16, paddingLeft: 16, paddingRight: 16 }} justify="space-between">
                    <Button onClick={() => { handleSectionNavigation('prev') }}>Previous</Button>
                    <Button type="primary" onClick={() => {
                        console.log("Employee Submit: ", employee);
                        handleSectionNavigation('next')
                    }} icon={<SaveOutlined />}>
                        Save & Next
                    </Button>
                </Flex>
            </Flex>
        </>
    );
};

export default CompensationSection;
