import { Button, Flex, Tag } from "antd";
import { LockOutlined } from '@ant-design/icons';
import styles from './AccessStatus.module.css';

type AccessRevokedPageProps = {
    handleLogout: () => void
}

const AccessRevokedPage = ({ handleLogout }: AccessRevokedPageProps) => {
    return (
        <Flex className={styles.page}>
            <Flex vertical className={styles.card}>
                <Flex justify="center" align="center" className={styles.iconBadgeRevoked}>
                    <LockOutlined className={styles.iconRevoked} />
                </Flex>
                <h2>Your access has been revoked</h2>

                <p className={styles.body}>
                    You no longer have access to the HR portal. If you believe this is a mistake, you can request access again.
                </p>

                <Flex justify="space-between" align="center" className={styles.statusRow}>
                    <p className={styles.statusLabel}>Request Status</p>
                    <Tag color="red" variant="filled">Revoked</Tag>
                </Flex>

                <Flex justify="space-around" align="center" className={styles.actions}>
                    <Button onClick={handleLogout}>Sign Out</Button>
                    <Button type="primary">Request Access Again</Button>
                </Flex>
            </Flex>
        </Flex>
    )
}

export default AccessRevokedPage;
