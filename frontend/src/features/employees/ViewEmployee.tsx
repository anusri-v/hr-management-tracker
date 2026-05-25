import { Button, Flex, message, Spin, Tabs, type TabsProps } from "antd"
import apiClient from "../../utils/apiClient"
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined, TeamOutlined, PushpinOutlined, CalendarOutlined, EditOutlined, LogoutOutlined } from '@ant-design/icons';
import EmploymentStatusTag from "../../utils/components/EmploymentStatusTag";
import EmploymentTypeTag from "../../utils/components/EmploymentTypeTag";
import OverviewTabContent from "./TabItems/OverviewTabContent";
import EmploymentTabContent from "./TabItems/EmploymentTabContent";
import StatutoryTabContent from "./TabItems/StatutoryTabContent";
import CompensationTabContent from "./TabItems/CompensationTabContent";
import type { Employee } from "../../utils/types/employee";
import ExpatStatusTag from "../../utils/components/ExpatStatusTag";
import ResignationModal from "./ResignationModal";
import ExitDetailsTabContent from "./TabItems/ExitDetailsTabContent";
import DocumentsTabContent from "./TabItems/DocumentsTabContent";
import styles from './ViewEmployee.module.css';

const ViewEmployee = () => {
    const navigate = useNavigate();
    const { employeeId } = useParams<{ employeeId: string }>();
    const [employee, setEmployee] = useState<Employee>()
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<string>('1');
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (employeeId) handleGetEmployeeData();
    }, [employeeId])

    async function handleGetEmployeeData() {
        setLoading(true);
        try {
            const data = await apiClient.get<{ success: boolean; message: string; employee: Employee }>(`/employee/${employeeId}`);
            if (!data.success) {
                message.error(data.message ?? 'Something went wrong')
                return
            }

            setEmployee({ ...data.employee })
            if (data.employee.employment_status === 'resigned') setActiveTab('6');

            message.success(data.message)
        } catch (e) {
            console.error('Update failed: ', e)
            message.error('Internal server error')
        } finally {
            setLoading(false)
        }
    }

    const items: TabsProps['items'] = [
        {
            key: '1',
            label: 'Overview',
            children: <OverviewTabContent employee={employee} />,
        },
        {
            key: '2',
            label: 'Employment',
            children: <EmploymentTabContent employee={employee} />,
        },
        {
            key: '3',
            label: 'Compensation',
            children: <CompensationTabContent employee={employee} />,
        },
        {
            key: '4',
            label: 'Statutory',
            children: <StatutoryTabContent employee={employee} />,
        },
        {
            key: '5',
            label: 'Documents',
            children: <DocumentsTabContent employeeId={employeeId} />,
        }
    ];

    if (employee?.employment_status === 'resigned') {
        items.push({
            key: '6',
            label: 'Exit Details',
            children: <ExitDetailsTabContent employee={employee} onUpdate={handleGetEmployeeData} />,
        })
    }

    const handleModalOpen = () => {
        setModalOpen(true);
    }

    const handleModalClose = () => {
        setModalOpen(false);
    }

    if (loading) {
        return <Flex justify="center" align="center" style={{ minHeight: '60vh' }}><Spin size="large" /></Flex>
    }

    return (
        <>
            <Flex justify="space-between">
                <Button type='text' icon={<ArrowLeftOutlined />} onClick={() => { navigate('/employees') }}>Back</Button>
                <Flex gap={16}>
                    {employee?.employment_status !== 'resigned' && <Button type='default' onClick={() => handleModalOpen()} danger icon={<LogoutOutlined />} >Mark as Resigned</Button>}
                    <Button type='primary' icon={<EditOutlined />} onClick={() => { navigate(`/employees/edit/${employeeId}`) }} >Edit Details</Button>
                </Flex>
            </Flex>

            <Flex vertical className={styles.employeeHeader}>
                <Flex gap={16} align='center'>
                    <span className={styles.employeeName}>{employee?.full_name}</span>
                    <EmploymentStatusTag status={employee?.employment_status || ''} />
                    <EmploymentTypeTag employment_type={employee?.employment_type || ''} />
                    <ExpatStatusTag status={employee?.expat_status || ''} />
                </Flex>
                <Flex gap={24} className={styles.detailsRow}>
                    <Flex gap={8}>
                        <TeamOutlined /><span>{employee?.designation}</span>
                        <span>·</span>
                        <span>{employee?.department}</span>
                    </Flex>

                    <Flex gap={8}>
                        <PushpinOutlined /><span>{employee?.work_location}</span></Flex>
                    <Flex gap={8}>
                        <CalendarOutlined />
                        <span>Joined {new Date(employee?.date_of_joining || '').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </Flex>

                    <Flex gap={8}>
                        <span>{employee?.employee_id}</span></Flex>
                </Flex>
            </Flex>
            <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />

            <ResignationModal
                open={modalOpen}
                employee={employee}
                onClose={handleModalClose}
                onSuccess={handleGetEmployeeData}
            />
        </>
    )
}

export default ViewEmployee;
