import { useEffect, useState } from "react";
import type { User } from "./UserAccessPage";
import apiClient from "../../utils/apiClient";
import { Avatar, Button, Flex, message, Modal, Table } from "antd";
import dayjs from "dayjs";
import type { AppUser } from "../../App";
import styles from './UserAccess.module.css';

const ActiveUsersTabContent = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
        apiClient.get<{ user: AppUser }>('/me').then(data => setCurrentUser(data.user));
    }, []);

    async function fetchUsers() {
        try {
            const data = await apiClient.get<{ count: number, users: User[] }>('/users?status=1');
            setUsers(data.users);
        } catch (e) {
            console.error('Failed to fetch users: ', e)
            message.error('Internal server error')
        }
    }

    async function handleRevoke() {
        if (!selectedUser) return;
        setLoading(true);
        try {
            await apiClient.patch(`/users/${selectedUser.id}/status`, { status: 2 });
            message.success(`${selectedUser.name} has been revoked`);
            setSelectedUser(null);
            fetchUsers();
        } catch (e) {
            console.error('Failed to revoke user: ', e);
            message.error('Failed to revoke user');
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
            title: 'Added On',
            dataIndex: 'authorized_at',
            key: 'authorized_at',
            render: (authorized_at: string) => authorized_at && dayjs(authorized_at).isValid() ? dayjs(authorized_at).format('DD MMMM YYYY') : '-'
        },
        {
            title: 'Added By',
            dataIndex: 'authorized_by_name',
            key: 'authorized_by_name',
            render: (authorized_by_name: string) => authorized_by_name ?? '-'
        },
        {
            title: 'Last Active',
            dataIndex: 'last_login_at',
            key: 'last_login_at',
            render: (last_login_at: string) => dayjs(last_login_at).fromNow()
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: unknown, user: User) => {
                if (user.id === currentUser?.id) return null;
                return <Button danger onClick={() => setSelectedUser(user)}>Revoke</Button>;
            }
        }
    ]

    return (
        <>
            <Table columns={columns} dataSource={users} rowKey="id" />

            <Modal
                title="Revoke User Access"
                open={!!selectedUser}
                onCancel={() => setSelectedUser(null)}
                onOk={handleRevoke}
                okText="Revoke"
                okButtonProps={{ danger: true, loading }}
            >
                {selectedUser && (
                    <p>Are you sure you want to revoke access for <strong>{selectedUser.name}</strong> ({selectedUser.email})?</p>
                )}
            </Modal>
        </>
    )
}

export default ActiveUsersTabContent;
