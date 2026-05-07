import { Flex, Button, Typography, Row, Col } from "antd";
import { PlusOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const DashboardPage = () => {
  const navigate = useNavigate();

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
              <span style={{ fontSize: 24, fontWeight: 'bold', marginTop: 8 }}>14</span>
            </Flex>
          </Col>
          <Col className="gutter-row" span={6}>
            <Flex vertical style={{ background: '#FFFFFF', padding: 16, borderRadius: 8, borderColor: '#E6EAEE', borderWidth: 1, borderStyle: 'solid' }}>
              <span style={{ textTransform: 'uppercase', fontSize: 12, color: '#8893A0', letterSpacing: 1 }}>Active</span>
              <span style={{ fontSize: 24, fontWeight: 'bold', marginTop: 8 }}>1</span>
            </Flex>
          </Col>
          <Col className="gutter-row" span={6}>
            <Flex vertical style={{ background: '#FFFFFF', padding: 16, borderRadius: 8, borderColor: '#E6EAEE', borderWidth: 1, borderStyle: 'solid' }}>
              <span style={{ textTransform: 'uppercase', fontSize: 12, color: '#8893A0', letterSpacing: 1 }}>On Resignation</span>
              <span style={{ fontSize: 24, fontWeight: 'bold', marginTop: 8 }}>3</span>
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
