import { useEffect, useState } from 'react';
import { Avatar, Flex, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import apiClient from '../../utils/apiClient';
import styles from '../../utils/styles/shared.module.css';
import listStyles from './ActivityLogContent.module.css';

dayjs.extend(relativeTime);

type Actor = {
  id: number;
  name: string;
  email: string;
  picture: string;
};

export type ActivityLog = {
  id: number;
  action: string;
  entity_type: string;
  entity_id: string;
  description: string;
  created_at: string;
  actor: Actor;
};

const ACTION_META: Record<string, { label: string; color: string }> = {
  ACCESS_GRANTED:    { label: 'Access Granted',    color: 'green'   },
  ACCESS_REVOKED:    { label: 'Access Revoked',    color: 'red'     },
  EMPLOYEE_ADDED:    { label: 'Employee Added',    color: 'blue'    },
  EMPLOYEE_EDITED:   { label: 'Employee Edited',   color: 'orange'  },
  EMPLOYEE_RESIGNED: { label: 'Employee Resigned', color: 'volcano' },
};

const AVATAR_COLORS = ['#4ECDC4', '#45B7D1', '#96CEB4', '#5C6BC0', '#EF5350', '#26A69A', '#AB47BC'];

function avatarColor(name: string) {
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[Math.abs(hash)];
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function formatTimestamp(created_at: string) {
  const d = dayjs(created_at);
  const today = dayjs();
  if (d.isSame(today, 'day')) return `Today, ${d.format('HH:mm')}`;
  if (d.isSame(today.subtract(1, 'day'), 'day')) return `Yesterday, ${d.format('HH:mm')}`;
  return d.format('DD MMM YYYY, HH:mm');
}

type Props = {
  dashboardMode?: boolean;
};

const ActivityLogContent = ({ dashboardMode = false }: Props) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = dashboardMode ? 5 : 20;

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  async function fetchLogs(p: number) {
    setLoading(true);
    try {
      const data = await apiClient.get<{ logs: ActivityLog[]; pagination: { total: number } }>(
        `/activity-log?page=${p}&per_page=${perPage}`
      );
      setLogs(data.logs);
      setTotal(data.pagination.total);
    } catch (e) {
      console.error('Failed to fetch activity logs:', e);
    } finally {
      setLoading(false);
    }
  }

  if (dashboardMode) {
    if (loading) return <div className={listStyles.listContainer} />;
    return (
      <Flex vertical className={listStyles.listContainer}>
        {logs.length === 0 && (
          <span className={styles.mutedText} style={{ padding: '16px 24px' }}>No activity yet.</span>
        )}
        {logs.map((log) => {
          const meta = ACTION_META[log.action] ?? { label: log.action, color: 'default' };
          return (
            <Flex key={log.id} align="flex-start" gap={12} className={listStyles.listItem}>
              <Avatar
                size={36}
                style={{ backgroundColor: avatarColor(log.actor.name), flexShrink: 0, fontSize: 13, fontWeight: 600 }}
                src={log.actor.picture || undefined}
              >
                {!log.actor.picture && initials(log.actor.name)}
              </Avatar>
              <Flex vertical gap={4} style={{ flex: 1, minWidth: 0 }}>
                <span className={listStyles.description}>
                  <strong>{log.actor.name}</strong> {log.description.replace(/^(Added employee|Edited employee|Granted access to|Revoked access from|Marked) /i, (m) => m)}
                </span>
                <Flex align="center" gap={8}>
                  <Tag color={meta.color} style={{ margin: 0, fontSize: 11 }}>{meta.label}</Tag>
                  <span className={listStyles.timestamp}>{formatTimestamp(log.created_at)}</span>
                </Flex>
              </Flex>
            </Flex>
          );
        })}
      </Flex>
    );
  }

  const columns = [
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => {
        const meta = ACTION_META[action] ?? { label: action, color: 'default' };
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Performed By',
      key: 'actor',
      render: (_: unknown, log: ActivityLog) => (
        <Flex align="center" gap={10}>
          <Avatar
            size={32}
            src={log.actor.picture || undefined}
            style={{ backgroundColor: avatarColor(log.actor.name), fontSize: 12, fontWeight: 600 }}
          >
            {!log.actor.picture && initials(log.actor.name)}
          </Avatar>
          <Flex vertical>
            <span className={styles.bold}>{log.actor.name}</span>
            <span className={styles.mutedText}>{log.actor.email}</span>
          </Flex>
        </Flex>
      ),
    },
    {
      title: 'When',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (created_at: string) => (
        <Flex vertical>
          <span>{dayjs(created_at).format('DD MMM YYYY, HH:mm')}</span>
          <span className={styles.mutedText}>{dayjs(created_at).fromNow()}</span>
        </Flex>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={logs}
      rowKey="id"
      loading={loading}
      pagination={{
        current: page,
        pageSize: perPage,
        total,
        onChange: setPage,
        showTotal: (t) => `${t} events`,
      }}
    />
  );
};

export default ActivityLogContent;
