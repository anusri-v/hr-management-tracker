import {
  FileOutlined,
  HomeOutlined,
  UserOutlined,
  BellOutlined,
  KeyOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Avatar, Button, Layout, Menu, Flex, Tooltip } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import type { User } from '../../App';
import styles from './Main.module.css';

const { Sider, Header, Content } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
  { key: '/dashboard', icon: <HomeOutlined />, label: 'Dashboard' },
  { key: '/employees', icon: <UserOutlined />, label: 'Employees' },
  { key: '/reminders', icon: <BellOutlined />, label: 'Reminders' },
  { key: '/user-access', icon: <KeyOutlined />, label: 'User Access' },
  { key: '/activity-log', icon: <FileOutlined />, label: 'Activity Log' },
];

type MainProps = {
  user: User,
  handleLogout: () => void
}

const Main = ({ user, handleLogout }: MainProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Layout className={styles.layout}>
      <Sider theme='light'>
        <Flex vertical className={styles.sider}>
          <h2>Shop<span className="shopup-logo-accent">Up</span></h2>
          <Menu
            mode="inline"
            items={items}
            selectedKeys={[location.pathname]}
            onClick={({ key }) => navigate(key)}
          />
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
            <Tooltip title="Logout">
              <Button icon={<LogoutOutlined />} onClick={handleLogout} />
            </Tooltip>
          </Flex>
        </Header>
        <Content className={styles.content}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Main;
