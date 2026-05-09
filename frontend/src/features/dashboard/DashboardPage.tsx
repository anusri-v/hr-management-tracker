import { Flex, Button, Typography, Row, Col, message } from "antd";
import { ArrowRightOutlined, AuditOutlined, BellOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import apiClient from "../../utils/apiClient";
import { useEffect, useState } from "react";
import RemindersContent from "../reminders/RemindersContent";
import styles from './DashboardPage.module.css';
import ActivityLogContent from "../activityLog/ActivityLogContent";

const { Title } = Typography;

type EmployeeSummaryType = {
  totalEmployees: number,
  activeEmployees: number,
  resignedEmployees: number,
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const [employeeSummary, setEmployeeSummary] = useState<EmployeeSummaryType>({
    totalEmployees: 0,
    activeEmployees: 0,
    resignedEmployees: 0,
  })

  useEffect(() => {
    handleEmployeeSummary()
    console.log("Employee Summary: ", employeeSummary);

  }, [])

  async function handleEmployeeSummary() {
    try {
      const data = await apiClient.get<{ success: boolean; message: string; summary: { total: number; active: number; resigned: number } }>('/employee/summary');
      if (!data.success) {
        message.error(data.message ?? 'Something went wrong')
        return
      }

      setEmployeeSummary({
        totalEmployees: data.summary.total,
        activeEmployees: data.summary.active,
        resignedEmployees: data.summary.resigned,
      })
    } catch (e) {
      console.error('Failed to fetch employee summary: ', e)
      message.error('Internal server error')
    }
  }

  return (
    <>
      <Flex vertical>
        <Flex justify="space-between" align='baseline'>
          <Title level={3} className={styles.pageTitle}>Dashboard</Title>
          <Flex gap={8}>
            <Button icon={<UserOutlined />} onClick={() => { navigate('/employees') }} >View Employees</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { navigate('/employees/add') }}>Add Employee</Button>
          </Flex>
        </Flex>

        <Row gutter={16} className={styles.statsRow}>
          <Col className="gutter-row" span={6}>
            <Flex vertical className={styles.statCard}>
              <span className={styles.statLabel}>Total Employees</span>
              <span className={styles.statValue}>{employeeSummary.totalEmployees}</span>
            </Flex>
          </Col>
          <Col className="gutter-row" span={6}>
            <Flex vertical className={styles.statCard}>
              <span className={styles.statLabel}>Active</span>
              <span className={styles.statValue}>{employeeSummary.activeEmployees}</span>
            </Flex>
          </Col>
          <Col className="gutter-row" span={6}>
            <Flex vertical className={styles.statCard}>
              <span className={styles.statLabel}>On Resignation</span>
              <span className={styles.statValue}>{employeeSummary.resignedEmployees}</span>
            </Flex>
          </Col>
          <Col className="gutter-row" span={6}>
            <Flex vertical className={styles.statCard}>
              <span className={styles.statLabel}>Open Access Requests</span>
              <span className={styles.statValue}>5</span>
            </Flex>
          </Col>
        </Row>

        <Flex>
          <Flex vertical className={styles.remindersPanel}>
            <Flex justify="space-between" align="center" className={styles.remindersHeader}>
              <Flex gap={8}>
                <BellOutlined className={styles.bellIcon} />
                <Flex vertical gap={8} className={styles.remindersInfo}>
                  <span className={styles.remindersTitle}>Reminders</span>
                  Upcoming events, birthdays, and milestones
                </Flex>
              </Flex>
              <Flex gap={8}>
                <Button type="link" onClick={() => { navigate('/reminders') }}>
                  <span className={styles.viewAllText}>
                    View all
                  </span>

                  <ArrowRightOutlined />
                </Button>
              </Flex>
            </Flex>
            <Flex>
              <RemindersContent />
            </Flex>
          </Flex>

          <Flex vertical className={styles.activityPanel}>
            <Flex justify="space-between" align="center" className={styles.remindersHeader}>
              <Flex gap={8}>
                <AuditOutlined className={styles.bellIcon} />
                <Flex vertical gap={8} className={styles.remindersInfo}>
                  <span className={styles.remindersTitle}>Recent activity</span>
                  Latest changes in the portal
                </Flex>
              </Flex>
              <Button type="link" onClick={() => { navigate('/activity-log') }}>
                <span className={styles.viewAllText}>View all</span>
                <ArrowRightOutlined />
              </Button>
            </Flex>
            <ActivityLogContent dashboardMode />
          </Flex>
        </Flex>
      </Flex>
    </>
  );
};

export default DashboardPage;
