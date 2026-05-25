import { useEffect, useState } from "react";
import { Button, Col, Flex, Radio, Row } from "antd";
import { SaveOutlined } from '@ant-design/icons';
import apiClient from "../../utils/apiClient";
import type { Employee } from "../../utils/types/employee";
import type { EmployeeDocument } from "../../utils/types/documents";
import { ONBOARDING_DOCUMENT_TYPES } from "../../utils/types/documents";
import DocumentUploadField from "./documents/DocumentUploadField";
import shared from '../../utils/styles/shared.module.css';
import styles from './OnboardingSection.module.css';

type BasicInformationSectionProps = {
    employee: Employee,
    setEmployee: React.Dispatch<React.SetStateAction<Employee>>,
    handleSectionNavigation: (dir: string) => void
}

const OnboardingSection = ({ employee, setEmployee, handleSectionNavigation }: BasicInformationSectionProps) => {
    const [documents, setDocuments] = useState<Record<string, EmployeeDocument>>({});

    useEffect(() => {
        if (employee.employee_id) loadDocuments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [employee.employee_id]);

    async function loadDocuments() {
        try {
            const data = await apiClient.get<{ success: boolean; documents: EmployeeDocument[] }>(
                `/employee/${employee.employee_id}/documents`,
            );
            if (data.success) {
                const byType: Record<string, EmployeeDocument> = {};
                data.documents.forEach((doc) => { byType[doc.document_type] = doc; });
                setDocuments(byType);
            }
        } catch (e) {
            console.error('Failed to load documents:', e);
        }
    }

    const handleUploaded = (doc: EmployeeDocument) => {
        setDocuments((prev) => ({ ...prev, [doc.document_type]: doc }));
    };

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
                        {ONBOARDING_DOCUMENT_TYPES.map((type) => (
                            <Col span={8} key={type}>
                                <Flex vertical className={styles.uploadItem}>
                                    <DocumentUploadField
                                        employeeId={employee.employee_id}
                                        documentType={type}
                                        existing={documents[type]}
                                        onUploaded={handleUploaded}
                                    />
                                </Flex>
                            </Col>
                        ))}
                    </Row>
                </Flex>

                <Flex className={shared.sectionNavBar} justify="space-between">
                    <Button onClick={() => { handleSectionNavigation('prev') }}>Previous</Button>
                    <Button type="primary" onClick={() => {
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
