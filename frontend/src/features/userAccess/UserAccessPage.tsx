import { Tabs, type TabsProps } from "antd";
import { useState } from "react";
import ActiveUsersTabContent from "./ActiveUsersTabContent";
import AccessRequestsTabContent from "./AccessRequestsTabContent";

export type User = {
  id: number,
  email: string,
  name: string,
  picture: string,
  status: number,
  last_login_at: string,
  authorized_by?: string,
  authorized_at?: string,
  created_at: string,
  authorized_by_name?: string,
  revoked_by_name?: string,
}

const UserAccessPage = () => {
  const [activeTab, setActiveTab] = useState<string>('1');

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Active Users',
      children: <ActiveUsersTabContent />
    },
    {
      key: '2',
      label: 'Access Requests',
      children: <AccessRequestsTabContent />
    }
  ];

  return (
    <>
      <h1>User Access</h1>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />
    </>
  );
};

export default UserAccessPage;
