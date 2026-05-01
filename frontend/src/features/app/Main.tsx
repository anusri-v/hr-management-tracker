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
  console.log(user);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme='light'>
        <Flex vertical style={{ height: '100%', alignItems: 'center' }}>
          <h2>Shop<span style={{ color: '#FFD43B' }}>Up</span></h2>
          <Menu defaultSelectedKeys={['1']} mode="inline" items={items} />
        </Flex>
      </Sider>

      <Layout>
        <Header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            background: '#fff',
            color: '#000',
            padding: '0 24px',
          }}
        >
          <Flex align="center" gap={12}>
            <Flex vertical align="end" style={{ lineHeight: 1.2 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</span>
              <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.6)' }}>{user.email}</span>
            </Flex>
            <Avatar src={user.picture} size={32}>
              {user.name?.[0]?.toUpperCase()}
            </Avatar>
            <Button icon={<LogoutOutlined />} onClick={handleLogout} />
          </Flex>
        </Header>
      </Layout>
    </Layout >
  )
}

export default Main;