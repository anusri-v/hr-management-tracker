import { useEffect, useState } from "react";
import { Button, DatePicker, Flex, Form, message, Modal, Radio, Select } from "antd";
import { type Dayjs } from "dayjs";
import dayjs from "dayjs";
import apiClient from "../../utils/apiClient";
import type { Employee } from "../../utils/types/employee";
import type { EmployeeDocument } from "../../utils/types/documents";
import { EXIT_DOCUMENT_TYPES } from "../../utils/types/documents";
import DocumentUploadField from "./documents/DocumentUploadField";
import { DATE_FORMAT, exitReasons } from "../../utils/constants/constants";
import shared from '../../utils/styles/shared.module.css';
import styles from './ResignationModal.module.css';

type ResignationFormValues = {
    last_working_day: Dayjs | null;
    exit_reason: string | null;
    settlement_status: string;
}

type Props = {
    open: boolean;
    employee: Employee | undefined;
    onClose: () => void;
    onSuccess?: () => void;
}

const ResignationModal = ({ open, employee, onClose, onSuccess }: Props) => {
    const [form] = Form.useForm<ResignationFormValues>();
    const [documents, setDocuments] = useState<Record<string, EmployeeDocument>>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open && employee?.employee_id) loadDocuments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, employee?.employee_id]);

    async function loadDocuments() {
        if (!employee?.employee_id) return;
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
            console.error('Failed to load exit documents:', e);
        }
    }

    const handleUploaded = (doc: EmployeeDocument) => {
        setDocuments((prev) => ({ ...prev, [doc.document_type]: doc }));
    };

    const existingExit = employee?.exit_details?.[0];

    const initialValues: ResignationFormValues = {
        last_working_day: existingExit?.last_working_day ? dayjs(existingExit.last_working_day) : null,
        exit_reason: existingExit?.exit_reason ?? null,
        settlement_status: existingExit?.final_settlement_status ?? 'pending',
    };

    const handleClose = () => {
        form.resetFields();
        onClose();
    };

    const handleFinish = async (values: ResignationFormValues) => {
        if (!employee?.employee_id) return;

        setSubmitting(true);
        try {
            const data = await apiClient.post<{ success: boolean; message: string }>(
                `/employee/${employee.employee_id}/exit_details`,
                {
                    last_working_day: values.last_working_day?.format(DATE_FORMAT) ?? null,
                    exit_reason: values.exit_reason,
                    final_settlement_status: values.settlement_status,
                },
            );
            if (!data.success) {
                message.error(data.message ?? 'Something went wrong');
                return;
            }
            message.success(data.message);
            handleClose();
            onSuccess?.();
        } catch (e) {
            console.error('exit_details submit failed:', e);
            message.error('Internal server error');
        } finally {
            setSubmitting(false);
        }
    };

    const title = existingExit ? "Edit Resignation Details" : "Mark as Resigned";
    const confirmLabel = existingExit ? "Save Changes" : "Confirm Resignation";

    return (
        <Modal
            open={open}
            title={title}
            onCancel={handleClose}
            footer={[
                <Button key="back" onClick={handleClose}>Cancel</Button>,
                <Button key="submit" danger loading={submitting} onClick={() => form.submit()}>{confirmLabel}</Button>,
            ]}
        >
            <Flex vertical>
                <Flex className={styles.employeeLabel}>
                    {employee?.full_name} | {employee?.employee_id}
                </Flex>

                <Form
                    form={form}
                    layout="vertical"
                    initialValues={initialValues}
                    onFinish={handleFinish}
                    className={shared.fullWidth}
                >
                    <Form.Item
                        label="Last Working Day"
                        name="last_working_day"
                        rules={[{ required: true, message: 'Last Working Day is required' }]}
                    >
                        <DatePicker format={DATE_FORMAT} className={shared.fullWidth} />
                    </Form.Item>

                    <Form.Item
                        label="Exit Reason"
                        name="exit_reason"
                        rules={[{ required: true, message: 'Exit Reason is required' }]}
                    >
                        <Select options={exitReasons} />
                    </Form.Item>

                    <Form.Item
                        label="Full & final settlement status"
                        name="settlement_status"
                    >
                        <Radio.Group>
                            <Radio.Button value="pending">Pending</Radio.Button>
                            <Radio.Button value="in-progress">In Progress</Radio.Button>
                            <Radio.Button value="cleared">Cleared</Radio.Button>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item label="Exit Documents">
                        {employee?.employee_id ? (
                            <Flex vertical gap={16}>
                                {EXIT_DOCUMENT_TYPES.map((type) => (
                                    <DocumentUploadField
                                        key={type}
                                        employeeId={employee.employee_id}
                                        documentType={type}
                                        existing={documents[type]}
                                        onUploaded={handleUploaded}
                                    />
                                ))}
                            </Flex>
                        ) : null}
                    </Form.Item>
                </Form>
            </Flex>
        </Modal>
    );
};

export default ResignationModal;
