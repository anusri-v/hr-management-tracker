import { Button, Col, DatePicker, Flex, Input, Radio, Row, Select } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { Employee } from "./AddEmployee";

const DOB_FORMAT = "YYYY-MM-DD";

const departmentOptions = [
    { label: 'Engineering', value: 'Engineering' },
    { label: 'Product', value: 'Product' },
    { label: 'Design', value: 'Design' },
    { label: 'People Ops', value: 'People Ops' },
    { label: 'Finance', value: 'Finance' },
    { label: 'Marketing', value: 'Marketing' },
    { label: 'Sales', value: 'Sales' },
    { label: 'Operations', value: 'Operations' },
];

type BasicInformationSectionProps = {
    employee: Employee,
    setEmployee: React.Dispatch<React.SetStateAction<Employee>>,
    handleSectionNavigation: (dir: string) => void
}

const EmploymentSection = ({ employee, setEmployee, handleSectionNavigation }: BasicInformationSectionProps) => {
    const handleInputChange = (value: string, field: string) => {
        switch (field) {
            case 'department':
                setEmployee({ ...employee, department: value })
                break;
            case 'designation':
                setEmployee({ ...employee, designation: value })
                break;
            case 'reporting_manager':
                setEmployee({ ...employee, reporting_manager: value })
                break;
            case 'employment_type':
                setEmployee({ ...employee, employment_type: value })
                break;
            case 'date_of_joining':
                setEmployee({ ...employee, date_of_joining: value })
                break;
            case 'work_location':
                setEmployee({ ...employee, work_location: value })
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
                                <span style={{ margin: 4 }}>Department<span style={{ color: 'red' }}> *</span></span>
                                <Select
                                    placeholder="Select Department"
                                    value={employee.department || undefined}
                                    onChange={(value) => handleInputChange(value, 'department')}
                                    options={departmentOptions}
                                />
                            </Flex>
                        </Col>
                        <Col span={12}>
                            <Flex vertical style={{ marginBottom: 16 }}>
                                <span style={{ margin: 4 }}>Designation<span style={{ color: 'red' }}> *</span></span>
                                <Input placeholder="Designation" value={employee.designation} onChange={(e) => handleInputChange(e.target.value, 'designation')} />
                            </Flex>
                        </Col>
                    </Row>
                    <Row gutter={[24, 48]}>
                        <Col span={12}>
                            <Flex vertical style={{ marginBottom: 16 }}>
                                <span style={{ margin: 4 }}>Reporting Manager<span style={{ color: 'red' }}> *</span></span>
                                <Input placeholder="Reporting Manager" value={employee.reporting_manager} onChange={(e) => handleInputChange(e.target.value, 'reporting_manager')} />
                            </Flex>
                        </Col>
                        <Col span={12}>
                            <Flex vertical style={{ marginBottom: 16 }}>
                                <span style={{ margin: 4 }}>Employment Type<span style={{ color: 'red' }}> *</span></span>
                                <Radio.Group value={employee.employment_type} onChange={(e) => handleInputChange(e.target.value, 'employment_type')}>
                                    <Radio.Button value="full-time">Full Time</Radio.Button>
                                    <Radio.Button value="intern">Intern</Radio.Button>
                                    <Radio.Button value="contract">Contract</Radio.Button>
                                </Radio.Group>
                            </Flex>
                        </Col>
                    </Row>
                    <Row gutter={[24, 48]}>
                        <Col span={12}>
                            <Flex vertical style={{ marginBottom: 16 }}>
                                <span style={{ margin: 4 }}>Date of Joining<span style={{ color: 'red' }}> *</span></span>
                                <DatePicker
                                    value={employee.date_of_joining ? dayjs(employee.date_of_joining, DOB_FORMAT) : null}
                                    format={DOB_FORMAT}
                                    onChange={(_, dateString) => handleInputChange(dateString as string, 'date_of_joining')}
                                />
                            </Flex>
                        </Col>
                        <Col span={12}>
                            <Flex vertical style={{ marginBottom: 16 }}>
                                <span style={{ margin: 4 }}>Work Location<span style={{ color: 'red' }}> *</span></span>
                                <Input placeholder="Work Location" value={employee.work_location} onChange={(e) => handleInputChange(e.target.value, 'work_location')} />
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

export default EmploymentSection;
