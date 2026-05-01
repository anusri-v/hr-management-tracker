import { Button } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";

const EmployeesPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <h1>Employees</h1>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => { navigate('/employees/add')}}>Add Employee</Button>
    </>
  );
};

export default EmployeesPage;
