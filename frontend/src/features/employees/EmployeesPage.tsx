import { Button, Flex, Input, message, Select, Table, Tag, Typography } from "antd";
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../App";
import { useEffect, useState } from "react";
import { departmentOptions, expatOptions, statusOptions } from "../../utils/constants/constants";
import EmploymentStatusTag from "../../utils/components/EmploymentStatusTag";
import ExpatStatusTag from "../../utils/components/ExpatStatusTag";

const { Title } = Typography

const SEARCH_DEBOUNCE_MS = 300;

const EmployeesPage = () => {
  const navigate = useNavigate();
  const [employeeData, setEmployeeDate] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [department, setDepartment] = useState<string | undefined>(undefined);
  const [expatStatus, setExpatStatus] = useState<string | undefined>(undefined);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [search])

  useEffect(() => {
    handleEmployeeDataFetch()
  }, [debouncedSearch, status, department, expatStatus])

  async function handleEmployeeDataFetch() {
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (status) params.set('status', status);
      if (department) params.set('department', department);
      if (expatStatus) params.set('expat_status', expatStatus);

      const qs = params.toString();
      const url = `${API_URL}/employee${qs ? `?${qs}` : ''}`

      const res = await fetch(url, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await res.json();
      console.log("GET employees result", data);
      setEmployeeDate(data.employees);

    } catch (e) {
      console.error('Failed to fetch employee data: ', e)
      message.error('Failed to fetch employee data')
    }
  }

  const columns = [
    {
      title: 'Employee ID',
      dataIndex: 'employee_id',
      key: 'employee_id',
      render: (employee_id: string) => {
        return <Button type='link' style={{ color: '#3CB5B0' }} onClick={() => navigate(`/employees/view/${employee_id}`)}>
          {employee_id}
        </Button>
      }
    },
    {
      title: 'Employee Name',
      dataIndex: 'full_name',
      key: 'full_name',
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Designation',
      dataIndex: 'designation',
      key: 'designation',
    },
    {
      title: 'Date of Joining',
      dataIndex: 'date_of_joining',
      key: 'date_of_joining',
      render: (date: string) => {
        if (date === null) {
          return
        }
        const d = new Date(date);
        return <span>{`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`}</span>
      }
    },
    {
      title: 'Status',
      dataIndex: 'employment_status',
      key: 'employment_status',
      render: (employment_status: string) => { return <EmploymentStatusTag status={employment_status} /> }
    },
    {
      title: 'Expat Status',
      dataIndex: 'expat_status',
      key: 'expat_status',
      render: (expat_status: string) => { return <ExpatStatusTag status={expat_status} /> }
    },
  ];

  return (
    <>
      <Flex justify="space-between" align='baseline'>
        <Title level={3} style={{ fontWeight: 'bold' }}>Employees</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { navigate('/employees/add') }}>Add Employee</Button>
      </Flex>

      <Flex gap={8} style={{ marginBottom: 16, marginTop: 16 }}>
        <Input
          placeholder="Search by Employee ID or Name"
          prefix={<SearchOutlined />}
          style={{ width: 320 }}
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          style={{ width: 200 }}
          placeholder="Status"
          options={statusOptions}
          allowClear
          value={status}
          onChange={(val) => setStatus(val)}
        />
        <Select
          style={{ width: 200 }}
          placeholder="Department"
          options={departmentOptions}
          allowClear
          value={department}
          onChange={(val) => setDepartment(val)}
        />
        <Select
          style={{ width: 200 }}
          placeholder="Expat Status"
          options={expatOptions}
          allowClear
          value={expatStatus}
          onChange={(val) => setExpatStatus(val)}
        />
      </Flex>

      <Table dataSource={employeeData} columns={columns} />
    </>
  );
};

export default EmployeesPage;
