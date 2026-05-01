import { Button, Flex, Tag } from "antd";
import { ClockCircleOutlined } from '@ant-design/icons';

type AccessPendingPageProps = {
    handleLogout: () => void
}

const AccessPendingPage = ({ handleLogout }: AccessPendingPageProps) => {
    return (
        <Flex style={{ justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#F7F8FA' }}>
            <Flex vertical style={{ background: '#FFFFFF', alignItems: 'center', width: "25%", padding: 60, borderColor: '#EEF1F4', borderWidth: 1, borderRadius: 20, borderStyle: 'solid' }}>
                <Flex
                    justify="center"
                    align="center"
                    style={{
                        width: 56,
                        height: 56,
                        borderRadius: 16,
                        background: '#FFF9E0',
                    }}
                >
                    <ClockCircleOutlined style={{ fontSize: 22, color: '#8A6500' }} />
                </Flex>
                <h2>Waiting for approval</h2>

                <p style={{ fontSize: 14, textAlign: 'center', lineHeight: 1.5 }}>
                    Your request to access the HR portal has been sent to <b>hr-blr@shopup.org</b>. You'll receive an email once an admin approves it.
                </p>

                <Flex justify="space-between" align="center" style={{ minWidth: '100%', background: '#FBFCFD', borderColor: '#EEF1F4', borderWidth: 1, borderRadius: 5, borderStyle: 'solid', padding: '10px 20px', marginTop: 20 }}>
                    <p style={{ fontSize: 12 }}>Request Status</p>
                    <Tag color="orange" variant="filled">Pending</Tag>
                </Flex>
                <Button style={{ marginTop: 40 }} onClick={handleLogout}>Sign Out</Button>
            </Flex>
        </Flex>
    )
}

export default AccessPendingPage;