import { Button, Col, Flex, Radio, Row, Upload } from "antd";
import { UploadOutlined, SaveOutlined } from '@ant-design/icons';
import type { Employee } from "../../utils/types/employee";
import shared from '../../utils/styles/shared.module.css';
import styles from './OnboardingSection.module.css';

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
            default:
                break;
        }
    }

    return (
        <>
            <Flex vertical className={shared.fullWidth}>
                <Flex vertical className={shared.sectionCard}>
                    <Row gutter={[24, 48]}>
                        <Col span={12}>
                            <Flex vertical className={styles.uploadItem}>
                                <span className={styles.labelMargin}>Offer / Appointment Letter Status</span>
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
                            <Flex vertical className={styles.uploadItem}>
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
                            <Flex vertical className={styles.uploadItem}>
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
                            <Flex vertical className={styles.uploadItem}>
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
                            <Flex vertical className={styles.uploadItem}>
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
                            <Flex vertical className={styles.uploadItem}>
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
                            <Flex vertical className={styles.uploadItem}>
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
                            <Flex vertical className={styles.uploadItem}>
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
                            <Flex vertical className={styles.uploadItem}>
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
                            <Flex vertical className={styles.uploadItem}>
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

                <Flex className={shared.sectionNavBar} justify="space-between">
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
