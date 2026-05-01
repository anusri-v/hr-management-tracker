import { Button, Col, DatePicker, Flex, Input, Radio, Row } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { Employee } from "./AddEmployee";

const DOB_FORMAT = "YYYY-MM-DD";

type BasicInformationSectionProps = {
    employee: Employee,
    setEmployee: React.Dispatch<React.SetStateAction<Employee>>,
    handleSectionNavigation: (dir: string) => void
}

const RecruitmentSection = ({ employee, setEmployee, handleSectionNavigation }: BasicInformationSectionProps) => {
    const handleInputChange = (value: string, field: string) => {
        switch (field) {
            case 'source_of_hire':
                setEmployee({ ...employee, source_of_hire: value })
                break;
            case 'offer_letter_date':
                setEmployee({ ...employee, offer_letter_date: value })
                break;
            case 'interview_date':
                setEmployee({ ...employee, interview_date: value })
                break;
            case 'interview_panel':
                setEmployee({ ...employee, interview_panel: value })
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
                                <span style={{ margin: 4 }}>Source of hire<span style={{ color: 'red' }}> *</span></span>
                                <Radio.Group value={employee.source_of_hire} onChange={(e) => handleInputChange(e.target.value, 'source_of_hire')}>
                                    <Radio.Button value="referral">Referral</Radio.Button>
                                    <Radio.Button value="campus">Campus</Radio.Button>
                                    <Radio.Button value="consultant">Consultant</Radio.Button>
                                    <Radio.Button value="direct">Direct</Radio.Button>
                                </Radio.Group>
                            </Flex>
                        </Col>
                        <Col span={12}>
                            <Flex vertical style={{ marginBottom: 16 }}>
                                <span style={{ margin: 4 }}>Offer Letter Date<span style={{ color: 'red' }}> *</span></span>
                                <DatePicker
                                    value={employee.offer_letter_date ? dayjs(employee.offer_letter_date, DOB_FORMAT) : null}
                                    format={DOB_FORMAT}
                                    onChange={(_, dateString) => handleInputChange(dateString as string, 'offer_letter_date')}
                                />
                            </Flex>
                        </Col>
                    </Row>
                    <Row gutter={[24, 48]}>
                        <Col span={12}>
                            <Flex vertical style={{ marginBottom: 16 }}>
                                <span style={{ margin: 4 }}>Interview Date</span>
                                <DatePicker
                                    value={employee.interview_date ? dayjs(employee.interview_date, DOB_FORMAT) : null}
                                    format={DOB_FORMAT}
                                    onChange={(_, dateString) => handleInputChange(dateString as string, 'interview_date')}
                                />
                            </Flex>
                        </Col>
                        <Col span={12}>
                            <Flex vertical style={{ marginBottom: 16 }}>
                                <span style={{ margin: 4 }}>Interview Panel</span>
                                <Input placeholder="Interview Panel" value={employee.interview_panel} onChange={(e) => handleInputChange(e.target.value, 'interview_panel')} />
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

export default RecruitmentSection;
