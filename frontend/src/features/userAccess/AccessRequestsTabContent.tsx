import { useEffect, useState } from "react";
import type { User } from "./UserAccessPage";
import apiClient from "../../utils/apiClient";
import { Avatar, Button, Flex, message, Modal, Table } from "antd";
import dayjs from "dayjs";
import { CheckOutlined } from '@ant-design/icons';
import styles from './UserAccess.module.css';

const AccessRequestsTabContent = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        try {
            const data = await apiClient.get<{ count: number, users: User[] }>('/users?status=0&status=2');
            setUsers(data.users);
        } catch (e) {
            console.error('Failed to fetch users: ', e)
            message.error('Internal server error')
        }
    }

    async function handleApprove() {
        if (!selectedUser) return;
        setLoading(true);
        try {
            await apiClient.patch(`/users/${selectedUser.id}/status`, { status: 1 });
            message.success(`${selectedUser.name} has been approved`);
            setSelectedUser(null);
            fetchUsers();
        } catch (e) {
            console.error('Failed to approve user: ', e);
            message.error('Failed to approve user');
        } finally {
            setLoading(false);
        }
    }

    const columns = [
        {
            title: 'User',
            key: 'user',
            render: (_: unknown, user: User) => (
                <Flex align="center" gap={12}>
                    <Avatar src={user.picture} />
                    <Flex vertical>
                        <span className={styles.userName}>{user.name}</span>
                        <span className={styles.userEmail}>{user.email}</span>
                    </Flex>
                </Flex>
            )
        },
        {
            title: 'Requested On',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (created_at: string) => dayjs(created_at).format('DD MMMM YYYY')
        },
        {
            title: 'Last Active',
            dataIndex: 'last_login_at',
            key: 'last_login_at',
            render: (last_login_at: string) => dayjs(last_login_at).fromNow()
        },
        {
            title: 'Revoked On',
            dataIndex: 'revoked_at',
            key: 'revoked_at',
            render: (revoked_at: string) => revoked_at && dayjs(revoked_at).isValid() ? dayjs(revoked_at).format('DD MMMM YYYY') : '-'
        },
        {
            title: 'Revoked By',
            dataIndex: 'revoked_by_name',
            key: 'revoked_by_name',
            render: (revoked_by_name: string) => revoked_by_name ?? '-'
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: unknown, user: User) => (
                <Button type="primary" icon={<CheckOutlined />} onClick={() => setSelectedUser(user)}>Approve</Button>
            )
        }
    ]

    return (
        <>
            <Table columns={columns} dataSource={users} rowKey="id" />

            <Modal
                title="Approve User Access"
                open={!!selectedUser}
                onCancel={() => setSelectedUser(null)}
                onOk={handleApprove}
                okText="Approve"
                okButtonProps={{ loading }}
            >
                {selectedUser && (
                    <p>Are you sure you want to approve access for <strong>{selectedUser.name}</strong> ({selectedUser.email})?</p>
                )}
            </Modal>
        </>
    )
}

export default AccessRequestsTabContent;
