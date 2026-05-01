import { Button, Col, Flex, Input, Row } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import type { Employee } from "./AddEmployee";

type BasicInformationSectionProps = {
    employee: Employee,
    setEmployee: React.Dispatch<React.SetStateAction<Employee>>,
    handleSectionNavigation: (dir: string) => void
}

const StatutorySection = ({ employee, setEmployee, handleSectionNavigation }: BasicInformationSectionProps) => {
    const handleInputChange = (value: string, field: string) => {
        switch (field) {
            case 'pan_number':
                setEmployee({ ...employee, pan_number: value })
                break;
            case 'aadhar_number':
                setEmployee({ ...employee, aadhar_number: value })
                break;
            case 'uan_number':
                setEmployee({ ...employee, uan_number: value })
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
                                <span style={{ margin: 4 }}>PAN Number</span>
                                <Input placeholder="ABCDE1234F" value={employee.pan_number} onChange={(e) => handleInputChange(e.target.value, 'pan_number')} />
                            </Flex>
                        </Col>
                        <Col span={12}>
                            <Flex vertical style={{ marginBottom: 16 }}>
                                <span style={{ margin: 4 }}>Aadhar Number</span>
                                <Input.Password placeholder="0000 0000 0000" value={employee.aadhar_number} onChange={(e) => handleInputChange(e.target.value, 'aadhar_number')} />
                            </Flex>
                        </Col>
                    </Row>
                    <Row gutter={[24, 48]}>
                        <Col span={12}>
                            <Flex vertical style={{ marginBottom: 16 }}>
                                <span style={{ margin: 4 }}>UAN / PF number</span>
                                <Input placeholder="000000000000" value={employee.uan_number} onChange={(e) => handleInputChange(e.target.value, 'uan_number')} />
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

export default StatutorySection;
