import { Button, Col, DatePicker, Flex, Input, Radio, Row } from "antd";
import TextArea from "antd/es/input/TextArea";
import { SaveOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { Employee } from "./AddEmployee";

const DOB_FORMAT = "YYYY-MM-DD";

type BasicInformationSectionProps = {
    employee: Employee,
    setEmployee: React.Dispatch<React.SetStateAction<Employee>>,
    handleSectionNavigation: (dir: string) => void
}

const BasicInformationSection = ({ employee, setEmployee, handleSectionNavigation }: BasicInformationSectionProps) => {
    const handleInputChange = (value: string, field: string) => {
        switch (field) {
            case 'employee_id':
                setEmployee({ ...employee, employee_id: value })
                break;
            case 'full_name':
                setEmployee({ ...employee, full_name: value })
                break;
            case 'gender':
                setEmployee({ ...employee, gender: value })
                break;
            case 'dob':
                setEmployee({ ...employee, date_of_birth: value })
                break;
            case 'contact_number':
                setEmployee({ ...employee, contact_number: value })
                break;
            case 'email_id':
                setEmployee({ ...employee, email_id: value })
                break;
            case 'address':
                setEmployee({ ...employee, address: value })
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
                                <span style={{ margin: 4 }}>Employee ID<span style={{ color: 'red' }}> *</span></span>
                                <Input placeholder="Employee ID" value={employee.employee_id} onChange={(e) => handleInputChange(e.target.value, 'employee_id')} />
                            </Flex>
                        </Col>
                        <Col span={12}>
                            <Flex vertical style={{ marginBottom: 16 }}>
                                <span style={{ margin: 4 }}>Full Name<span style={{ color: 'red' }}> *</span></span>
                                <Input placeholder="Full Name" value={employee.full_name} onChange={(e) => handleInputChange(e.target.value, 'full_name')} />
                            </Flex>
                        </Col>
                    </Row>
                    <Row gutter={[24, 48]}>
                        <Col span={12}>
                            <Flex vertical style={{ marginBottom: 16 }}>
                                <span style={{ margin: 4 }}>Gender<span style={{ color: 'red' }}> *</span></span>
                                <Radio.Group defaultValue="prefer-not-to-say" value={employee.gender} onChange={(e) => handleInputChange(e.target.value, 'gender')}>
                                    <Radio.Button value="female">Female</Radio.Button>
                                    <Radio.Button value="male">Male</Radio.Button>
                                    <Radio.Button value="non-binary">Non-binary</Radio.Button>
                                    <Radio.Button value="prefer-not-to-say">Prefer not to say</Radio.Button>
                                </Radio.Group>
                            </Flex>
                        </Col>
                        <Col span={12}>
                            <Flex vertical style={{ marginBottom: 16 }}>
                                <span style={{ margin: 4 }}>Date of Birth<span style={{ color: 'red' }}> *</span></span>
                                <DatePicker
                                    value={employee.date_of_birth ? dayjs(employee.date_of_birth, DOB_FORMAT) : null}
                                    format={DOB_FORMAT}
                                    onChange={(_, dateString) => handleInputChange(dateString as string, 'dob')}
                                />
                            </Flex>
                        </Col>
                    </Row>
                    <Row gutter={[24, 48]}>
                        <Col span={12}>
                            <Flex vertical style={{ marginBottom: 16 }}>
                                <span style={{ margin: 4 }}>Contact Number<span style={{ color: 'red' }}> *</span></span>
                                <Input placeholder="Contact Number" value={employee.contact_number} onChange={(e) => handleInputChange(e.target.value, 'contact_number')} />
                            </Flex>
                        </Col>
                        <Col span={12}>
                            <Flex vertical style={{ marginBottom: 16 }}>
                                <span style={{ margin: 4 }}>Email ID<span style={{ color: 'red' }}> *</span></span>
                                <Input placeholder="Email ID" value={employee.email_id} onChange={(e) => handleInputChange(e.target.value, 'email_id')} />
                            </Flex>
                        </Col>
                    </Row>
                    <Row gutter={[24, 48]}>
                        <Col span={24}>
                            <Flex vertical style={{ marginBottom: 16 }}>
                                <span style={{ margin: 4 }}>Address<span style={{ color: 'red' }}> *</span></span>
                                <TextArea rows={4} value={employee.address} onChange={(e) => handleInputChange(e.target.value, 'address')} />
                            </Flex>
                        </Col>
                    </Row>
                </Flex>

                <Flex style={{ width: '100%', marginTop: 16, paddingLeft: 16, paddingRight: 16 }} justify="space-between">
                    <Button disabled>Previous</Button>
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

export default BasicInformationSection;
