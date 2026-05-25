import { useEffect, useState } from "react";
import { Button, Col, Empty, Flex, message, Row, Spin } from "antd";
import { FileTextOutlined, EyeOutlined } from "@ant-design/icons";
import apiClient from "../../../utils/apiClient";
import type { EmployeeDocument } from "../../../utils/types/documents";
import { DOCUMENT_LABELS, ONBOARDING_DOCUMENT_TYPES, EXIT_DOCUMENT_TYPES } from "../../../utils/types/documents";
import shared from '../../../utils/styles/shared.module.css';

type Props = {
    employeeId?: string;
};

const DocumentsTabContent = ({ employeeId }: Props) => {
    const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (employeeId) loadDocuments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [employeeId]);

    async function loadDocuments() {
        setLoading(true);
        try {
            const data = await apiClient.get<{ success: boolean; documents: EmployeeDocument[] }>(
                `/employee/${employeeId}/documents`,
            );
            if (data.success) setDocuments(data.documents);
        } catch (e) {
            console.error('Failed to load documents:', e);
        } finally {
            setLoading(false);
        }
    }

    const handleView = async (doc: EmployeeDocument) => {
        try {
            const data = await apiClient.get<{ success: boolean; url: string }>(
                `/employee/${employeeId}/documents/${doc.id}/download-url`,
            );
            if (data.success) window.open(data.url, "_blank", "noopener,noreferrer");
        } catch (e) {
            console.error("Failed to get download URL:", e);
            message.error("Could not open document");
        }
    };

    const byType = (type: string) => documents.find((d) => d.document_type === type);

    const renderGroup = (title: string, types: readonly string[]) => {
        const present = types.filter((t) => byType(t));
        if (present.length === 0) return null;
        return (
            <div className={shared.cardPanel}>
                <span className={shared.fieldLabel}>{title}</span>
                <Row gutter={[24, 16]} className={shared.rowGap}>
                    {present.map((type) => {
                        const doc = byType(type)!;
                        return (
                            <Col span={12} key={type}>
                                <Flex gap={8} align="center" justify="space-between">
                                    <Flex gap={6} align="center" style={{ minWidth: 0 }}>
                                        <FileTextOutlined />
                                        <Flex vertical style={{ minWidth: 0 }}>
                                            <span>{DOCUMENT_LABELS[type] ?? type}</span>
                                            <span className={shared.mutedText} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {doc.file_name}
                                            </span>
                                        </Flex>
                                    </Flex>
                                    <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(doc)}>
                                        View
                                    </Button>
                                </Flex>
                            </Col>
                        );
                    })}
                </Row>
            </div>
        );
    };

    if (loading) {
        return <Flex justify="center" align="center" style={{ minHeight: 200 }}><Spin /></Flex>;
    }

    if (documents.length === 0) {
        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No documents uploaded" />;
    }

    return (
        <>
            {renderGroup('Onboarding Documents', ONBOARDING_DOCUMENT_TYPES)}
            {renderGroup('Exit Documents', EXIT_DOCUMENT_TYPES)}
        </>
    );
};

export default DocumentsTabContent;
