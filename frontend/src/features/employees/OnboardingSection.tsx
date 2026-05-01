import { Button, Col, Flex, Radio, Row, Upload } from "antd";
import { UploadOutlined, SaveOutlined } from '@ant-design/icons';
import type { Employee } from "./AddEmployee";

type BasicInformationSectionProps = {
    employee: Employee,
    setEmployee: React.Dispatch<React.SetStateAction<Employee>>,
    handleSectionNavigation: (dir: string) => void
}

const OnboardingSection = ({ employee, setEmployee, handleSectionNavigation }: BasicInformationSectionProps) => {
    const handleInputChange = (value: string, field: string) => {
        switch (field) {
            case 'offer_letter_status':
                setEmployee({ ...employee, offer_letter_status: value })
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
                                <span style={{ margin: 4 }}>Offer / Appointment Letter Status</span>
                                <Radio.Group value={employee.offer_letter_status} onChange={(e) => handleInputChange(e.target.value, 'offer_letter_status')}>
                                    <Radio.Button value="pending">Pending</Radio.Button>
                                    <Radio.Button value="sent">Sent</Radio.Button>
                                    <Radio.Button value="signed">Signed</Radio.Button>
                                </Radio.Group>
                            </Flex>
                        </Col>
                    </Row>
                    <Row gutter={[24, 48]}>
                        <Col span={8}>
                            <Flex vertical style={{ marginBottom: 16 }}>
                                <Upload.Dragger>
                                    <Flex vertical gap={8} align="flex-start">
                                        <Flex gap={8}>
                                            <UploadOutlined />
                                            <span>Offer Letter</span>
                                        </Flex>
                                        <span><i>Click to upload (PDF, max 5MB)</i></span>
                                    </Flex>
                                </Upload.Dragger>
                            </Flex>
                        </Col>
                        <Col span={8}>
                            <Flex vertical style={{ marginBottom: 16 }}>
                                <Upload.Dragger>
                                    <Flex vertical gap={8} align="flex-start">
                                        <Flex gap={8}>
                                            <UploadOutlined />
                                            <span>Signed Offer Letter</span>
                                        </Flex>
                                        <span><i>Click to upload (PDF, max 5MB)</i></span>
                                    </Flex>
                                </Upload.Dragger>
                            </Flex>
                        </Col>
                        <Col span={8}>
                            <Flex vertical style={{ marginBottom: 16 }}>
                                <Upload.Dragger>
                                    <Flex vertical gap={8} align="flex-start">
                                        <Flex gap={8}>
                                            <UploadOutlined />
                                            <span>Aadhar Card</span>
                                        </Flex>
                                        <span><i>Click to upload (PDF/JPG/PNG, max 5MB)</i></span>
                                    </Flex>
                                </Upload.Dragger>
                            </Flex>
                        </Col>
                    </Row>

                    <Row gutter={[24, 48]}>
                        <Col span={8}>
                            <Flex vertical style={{ marginBottom: 16 }}>
                                <Upload.Dragger>
                                    <Flex vertical gap={8} align="flex-start">
                                        <Flex gap={8}>
                                            <UploadOutlined />
                                            <span>PAN Card</span>
                                        </Flex>
                                        <span><i>Click to upload (PDF, max 5MB)</i></span>
                                    </Flex>
                                </Upload.Dragger>
                            </Flex>
                        </Col>
                        <Col span={8}>
                            <Flex vertical style={{ marginBottom: 16 }}>
                                <Upload.Dragger>
                                    <Flex vertical gap={8} align="flex-start">
                                        <Flex gap={8}>
                                            <UploadOutlined />
                                            <span>Bank Passbook</span>
                                        </Flex>
                                        <span><i>Click to upload (PDF, max 5MB)</i></span>
                                    </Flex>
                                </Upload.Dragger>
                            </Flex>
                        </Col>
                        <Col span={8}>
                            <Flex vertical style={{ marginBottom: 16 }}>
                                <Upload.Dragger accept=".pdf">
                                    <Flex vertical gap={8} align="flex-start">
                                        <Flex gap={8}>
                                            <UploadOutlined />
                                            <span>Passport</span>
                                        </Flex>
                                        <span><i>Click to upload (PDF/JPG/PNG, max 5MB)</i></span>
                                    </Flex>
                                </Upload.Dragger>
                            </Flex>
                        </Col>
                    </Row>

                    <Row gutter={[24, 48]}>
                        <Col span={8}>
                            <Flex vertical style={{ marginBottom: 16 }}>
                                <Upload.Dragger>
                                    <Flex vertical gap={8} align="flex-start">
                                        <Flex gap={8}>
                                            <UploadOutlined />
                                            <span>Photograph</span>
                                        </Flex>
                                        <span><i>Click to upload (PDF, max 5MB)</i></span>
                                    </Flex>
                                </Upload.Dragger>
                            </Flex>
                        </Col>
                        <Col span={8}>
                            <Flex vertical style={{ marginBottom: 16 }}>
                                <Upload.Dragger>
                                    <Flex vertical gap={8} align="flex-start">
                                        <Flex gap={8}>
                                            <UploadOutlined />
                                            <span>Driving License</span>
                                        </Flex>
                                        <span><i>Click to upload (PDF, max 5MB)</i></span>
                                    </Flex>
                                </Upload.Dragger>
                            </Flex>
                        </Col>
                        <Col span={8}>
                            <Flex vertical style={{ marginBottom: 16 }}>
                                <Upload.Dragger>
                                    <Flex vertical gap={8} align="flex-start">
                                        <Flex gap={8}>
                                            <UploadOutlined />
                                            <span>Other</span>
                                        </Flex>
                                        <span><i>Click to upload (PDF/JPG/PNG, max 5MB)</i></span>
                                    </Flex>
                                </Upload.Dragger>
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
                        Save & Finish
                    </Button>
                </Flex>
            </Flex>
        </>
    );
};

export default OnboardingSection;
