import { Flex, Button, Typography, Row, Col, message } from "antd";
import { PlusOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import apiClient from "../../utils/apiClient";
import { useEffect, useState } from "react";

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
          <Title level={3} style={{ fontWeight: 'bold' }}>Dashboard</Title>
          <Flex gap={8}>
            <Button icon={<UserOutlined />} onClick={() => { navigate('/employees') }} >View Employees</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { navigate('/employees/add') }}>Add Employee</Button>
          </Flex>
        </Flex>

        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col className="gutter-row" span={6}>
            <Flex vertical style={{ background: '#FFFFFF', padding: 16, borderRadius: 8, borderColor: '#E6EAEE', borderWidth: 1, borderStyle: 'solid' }}>
              <span style={{ textTransform: 'uppercase', fontSize: 12, color: '#8893A0', letterSpacing: 1 }}>Total Employees</span>
              <span style={{ fontSize: 24, fontWeight: 'bold', marginTop: 8 }}>{employeeSummary.totalEmployees}</span>
            </Flex>
          </Col>
          <Col className="gutter-row" span={6}>
            <Flex vertical style={{ background: '#FFFFFF', padding: 16, borderRadius: 8, borderColor: '#E6EAEE', borderWidth: 1, borderStyle: 'solid' }}>
              <span style={{ textTransform: 'uppercase', fontSize: 12, color: '#8893A0', letterSpacing: 1 }}>Active</span>
              <span style={{ fontSize: 24, fontWeight: 'bold', marginTop: 8 }}>{employeeSummary.activeEmployees}</span>
            </Flex>
          </Col>
          <Col className="gutter-row" span={6}>
            <Flex vertical style={{ background: '#FFFFFF', padding: 16, borderRadius: 8, borderColor: '#E6EAEE', borderWidth: 1, borderStyle: 'solid' }}>
              <span style={{ textTransform: 'uppercase', fontSize: 12, color: '#8893A0', letterSpacing: 1 }}>On Resignation</span>
              <span style={{ fontSize: 24, fontWeight: 'bold', marginTop: 8 }}>{employeeSummary.resignedEmployees}</span>
            </Flex>
          </Col>
          <Col className="gutter-row" span={6}>
            <Flex vertical style={{ background: '#FFFFFF', padding: 16, borderRadius: 8, borderColor: '#E6EAEE', borderWidth: 1, borderStyle: 'solid' }}>
              <span style={{ textTransform: 'uppercase', fontSize: 12, color: '#8893A0', letterSpacing: 1 }}>Open Access Requests</span>
              <span style={{ fontSize: 24, fontWeight: 'bold', marginTop: 8 }}>5</span>
            </Flex>
          </Col>
        </Row>
      </Flex>
    </>
  );
};

export default DashboardPage;
