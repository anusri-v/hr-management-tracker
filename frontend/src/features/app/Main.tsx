import React from 'react';
import {
  FileOutlined,
  HomeOutlined,
  UserOutlined,
  BellOutlined,
  KeyOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Avatar, Button, Layout, Menu, Flex } from 'antd';
import type { User } from '../../App';
import styles from './Main.module.css';

const { Sider, Header } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem('Dashboard', '1', <HomeOutlined />),
  getItem('Employees', '2', <UserOutlined />),
  getItem('Reminders', '3', <BellOutlined />),
  getItem('User Access', '4', <KeyOutlined />),
  getItem('Activity Log', '5', <FileOutlined />),
];

type MainProps = {
  user: User,
  handleLogout: () => void
}

const Main = ({ user, handleLogout }: MainProps) => {
  return (
    <Layout className={styles.layout}>
      <Sider theme='light'>
        <Flex vertical className={styles.sider}>
          <h2>Shop<span className="shopup-logo-accent">Up</span></h2>
          <Menu defaultSelectedKeys={['1']} mode="inline" items={items} />
        </Flex>
      </Sider>

      <Layout>
        <Header className={styles.header}>
          <Flex align="center" gap={12}>
            <Flex vertical align="end" className={styles.userInfo}>
              <span className={styles.userName}>{user.name}</span>
              <span className={styles.userEmail}>{user.email}</span>
            </Flex>
            <Avatar src={user.picture} size={32}>
              {user.name?.[0]?.toUpperCase()}
            </Avatar>
            <Button icon={<LogoutOutlined />} onClick={handleLogout} />
          </Flex>
        </Header>
      </Layout>
    </Layout>
  )
}

export default Main;
