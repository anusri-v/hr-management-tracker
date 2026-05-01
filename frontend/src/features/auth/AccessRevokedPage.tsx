import { Button, Flex, Tag } from "antd";
import { LockOutlined } from '@ant-design/icons';

type AccessRevokedPageProps = {
    handleLogout: () => void
}

const AccessRevokedPage = ({ handleLogout }: AccessRevokedPageProps) => {
    return (
        <Flex style={{ justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#F7F8FA' }}>
            <Flex vertical style={{ background: '#FFFFFF', alignItems: 'center', width: "25%", padding: '60px', borderColor: '#EEF1F4', borderWidth: '1px', borderRadius: '20px', borderStyle: 'solid' }}>
                <Flex
                    justify="center"
                    align="center"
                    style={{
                        width: 56,
                        height: 56,
                        borderRadius: 16,
                        background: '#FDECEB',
                    }}
                >
                    <LockOutlined style={{ fontSize: 22, color: '#E55958' }} />
                </Flex>
                <h2>Your access has been revoked</h2>

                <p style={{ fontSize: '14px', textAlign: 'center', lineHeight: 1.5 }}>
                    You no longer have access to the HR portal. If you believe this is a mistake, you can request access again.
                </p>

                <Flex justify="space-between" align="center" style={{ minWidth: '100%', background: '#FBFCFD', borderColor: '#EEF1F4', borderWidth: '1px', borderRadius: '5px', borderStyle: 'solid', padding: '10px 20px', marginTop: '20px' }}>
                    <p style={{ fontSize: '12px' }}>Request Status</p>
                    <Tag color="red" variant="filled">Revoked</Tag>
                </Flex>

                <Flex justify="space-around" align="center" style={{ minWidth: '100%', marginTop: '40px' }}>
                    <Button onClick={handleLogout}>Sign Out</Button>
                    <Button type="primary">Request Access Again</Button>
                </Flex>
            </Flex>
        </Flex>
    )
}

export default AccessRevokedPage;