import { Button, DatePicker, Flex, Form, message, Modal, Radio, Select, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { type Dayjs } from "dayjs";
import dayjs from "dayjs";
import { API_URL } from "../../App";
import type { Employee } from "../../utils/types/employee";
import { DATE_FORMAT, exitReasons } from "../../utils/constants/constants";

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

        try {
            const res = await fetch(`${API_URL}/employee/${employee.employee_id}/exit_details`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    last_working_day: values.last_working_day?.format(DATE_FORMAT) ?? null,
                    exit_reason: values.exit_reason,
                    final_settlement_status: values.settlement_status,
                }),
            });
            const data = await res.json();
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
                <Button key="submit" danger onClick={() => form.submit()}>{confirmLabel}</Button>,
            ]}
        >
            <Flex vertical>
                <Flex style={{ textTransform: 'uppercase', color: '#8893A0', marginBottom: 16, letterSpacing: 1, fontSize: 12 }}>
                    {employee?.full_name} | {employee?.employee_id}
                </Flex>

                <Form
                    form={form}
                    layout="vertical"
                    initialValues={initialValues}
                    onFinish={handleFinish}
                    style={{ width: '100%' }}
                >
                    <Form.Item
                        label="Last Working Day"
                        name="last_working_day"
                        rules={[{ required: true, message: 'Last Working Day is required' }]}
                    >
                        <DatePicker format={DATE_FORMAT} style={{ width: '100%' }} />
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
                        <Flex vertical gap={16}>
                            <Upload style={{ width: '100%' }}>
                                <Button style={{ width: '100%' }} icon={<UploadOutlined />}>No Dues Form</Button>
                            </Upload>
                            <Upload style={{ width: '100%' }}>
                                <Button style={{ width: '100%' }} icon={<UploadOutlined />}>Exit Interview Form</Button>
                            </Upload>
                            <Upload style={{ width: '100%' }}>
                                <Button style={{ width: '100%' }} icon={<UploadOutlined />}>Resignation Acceptance Letter</Button>
                            </Upload>
                        </Flex>
                    </Form.Item>
                </Form>
            </Flex>
        </Modal>
    );
};

export default ResignationModal;
