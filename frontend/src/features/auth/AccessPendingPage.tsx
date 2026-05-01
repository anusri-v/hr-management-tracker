import { Button, Flex, Tag } from "antd";
import { ClockCircleOutlined } from '@ant-design/icons';
import styles from './AccessStatus.module.css';

type AccessPendingPageProps = {
    handleLogout: () => void
}

const AccessPendingPage = ({ handleLogout }: AccessPendingPageProps) => {
    return (
        <Flex className={styles.page}>
            <Flex vertical className={styles.card}>
                <Flex justify="center" align="center" className={styles.iconBadgePending}>
                    <ClockCircleOutlined className={styles.iconPending} />
                </Flex>
                <h2>Waiting for approval</h2>

                <p className={styles.body}>
                    Your request to access the HR portal has been sent to <b>hr-blr@shopup.org</b>. 
                    You'll receive an email once an admin approves it.
                </p>

                <Flex justify="space-between" align="center" className={styles.statusRow}>
                    <p className={styles.statusLabel}>Request Status</p>
                    <Tag color="orange" variant="filled">Pending</Tag>
                </Flex>
                <Button className={styles.signOut} onClick={handleLogout}>Sign Out</Button>
            </Flex>
        </Flex>
    )
}

export default AccessPendingPage;
