import { useState } from "react";
import { Button, Flex, message, Upload } from "antd";
import type { UploadProps } from "antd";
import { UploadOutlined, FileTextOutlined, EyeOutlined } from "@ant-design/icons";
import apiClient from "../../../utils/apiClient";
import type { EmployeeDocument } from "../../../utils/types/documents";
import { DOCUMENT_LABELS } from "../../../utils/types/documents";

const MAX_SIZE_MB = 5;

type Props = {
    employeeId: string;
    documentType: string;
    existing?: EmployeeDocument;
    accept?: string;
    onUploaded?: (doc: EmployeeDocument) => void;
};

// Single, reusable document uploader. Runs the presigned-URL flow:
//   1. ask our API for a presigned PUT URL
//   2. PUT the file straight to the bucket
//   3. tell our API to record the metadata
// Used by onboarding, resignation, and anywhere else documents are uploaded.
const DocumentUploadField = ({ employeeId, documentType, existing, accept = ".pdf,.jpg,.jpeg,.png", onUploaded }: Props) => {
    const [uploading, setUploading] = useState(false);
    const [current, setCurrent] = useState<EmployeeDocument | undefined>(existing);

    const label = DOCUMENT_LABELS[documentType] ?? documentType;

    const beforeUpload = (file: File) => {
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            message.error(`${file.name} exceeds the ${MAX_SIZE_MB}MB limit`);
            return Upload.LIST_IGNORE;
        }
        return true;
    };

    const customRequest: UploadProps["customRequest"] = async (options) => {
        const file = options.file as File;
        setUploading(true);
        try {
            const presign = await apiClient.post<{ success: boolean; upload_url: string; storage_key: string; message?: string }>(
                `/employee/${employeeId}/documents/upload-url`,
                { document_type: documentType, file_name: file.name, content_type: file.type || "application/octet-stream" },
            );
            if (!presign.success) throw new Error(presign.message ?? "Could not get upload URL");

            await apiClient.uploadToUrl(presign.upload_url, file);

            const saved = await apiClient.post<{ success: boolean; document: EmployeeDocument; message?: string }>(
                `/employee/${employeeId}/documents`,
                {
                    document_type: documentType,
                    file_name: file.name,
                    storage_key: presign.storage_key,
                    content_type: file.type || "application/octet-stream",
                    size: file.size,
                },
            );
            if (!saved.success) throw new Error(saved.message ?? "Could not save document");

            setCurrent(saved.document);
            onUploaded?.(saved.document);
            message.success(`${label} uploaded`);
            options.onSuccess?.(saved.document);
        } catch (e) {
            console.error("Document upload failed:", e);
            message.error(`Failed to upload ${label}`);
            options.onError?.(e as Error);
        } finally {
            setUploading(false);
        }
    };

    const handleView = async () => {
        if (!current) return;
        try {
            const data = await apiClient.get<{ success: boolean; url: string }>(
                `/employee/${employeeId}/documents/${current.id}/download-url`,
            );
            if (data.success) window.open(data.url, "_blank", "noopener,noreferrer");
        } catch (e) {
            console.error("Failed to get download URL:", e);
            message.error("Could not open document");
        }
    };

    return (
        <Flex vertical gap={8}>
            <Upload
                accept={accept}
                showUploadList={false}
                maxCount={1}
                beforeUpload={beforeUpload}
                customRequest={customRequest}
            >
                <Button icon={<UploadOutlined />} loading={uploading} block>
                    {current ? `Replace ${label}` : label}
                </Button>
            </Upload>
            {current && (
                <Flex gap={8} align="center" justify="space-between">
                    <Flex gap={6} align="center" style={{ minWidth: 0 }}>
                        <FileTextOutlined />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {current.file_name}
                        </span>
                    </Flex>
                    <Button type="link" size="small" icon={<EyeOutlined />} onClick={handleView}>
                        View
                    </Button>
                </Flex>
            )}
        </Flex>
    );
};

export default DocumentUploadField;
