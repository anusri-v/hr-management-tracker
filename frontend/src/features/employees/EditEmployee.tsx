import { Button, Flex, message, Spin, Steps } from "antd";
import { useEffect, useState } from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";
import BasicInformationSection from "./BasicInformationSection";
import EmploymentSection from "./EmploymentSection";
import RecruitmentSection from "./RecruitmentSection";
import CompensationSection from "./CompensationSection";
import StatutorySection from "./StatutorySection";
import OnboardingSection from "./OnboardingSection";
import { useNavigate, useParams } from "react-router-dom";
import { emptyEmployee, type Employee } from "../../utils/types/employee";
import apiClient from "../../utils/apiClient";
import styles from './EditEmployee.module.css';

const items = [
    { title: 'Part 1', content: 'Basic Information' },
    { title: 'Part 2', content: 'Employment' },
    { title: 'Part 3', content: 'Recruitment' },
    { title: 'Part 4', content: 'Compensation' },
    { title: 'Part 5', content: 'Statutory' },
    { title: 'Part 6', content: 'Onboarding & Docs' },
];


const EditEmployee = () => {
    const navigate = useNavigate();
    const { employeeId } = useParams<{ employeeId: string }>();
    const [step, setStep] = useState(0)
    const [employee, setEmployee] = useState<Employee>(emptyEmployee())
    const [loading, setLoading] = useState(true)

    console.log("[EditEmployee render]", { loading, employeeId, employee })

    useEffect(() => {
        if (employeeId) handleGetEmployeeData();
    }, [employeeId])

    async function handleGetEmployeeData() {
        try {
            const data = await apiClient.get<{ success: boolean; message: string; employee: Employee }>(`/employee/${employeeId}`);
            console.log("[EditEmployee API response]", data)

            if (!data.success) {
                message.error(data.message ?? 'Something went wrong')
                return
            }

            setEmployee({ ...data.employee })
            message.success(data.message)
        } catch (e) {
            console.error('Update failed: ', e)
            message.error('Internal server error')
        } finally {
            setLoading(false)
        }
    }

    const handleSectionNavigation = (dir: string) => {
        if (dir === "prev") {
            setStep(step - 1)
        } else {
            setStep(step + 1)
            if (step >= items.length - 1) {
                message.success("Employee Created Successfully!")
                navigate('/employees')
            }
        }
    }

    const handleRenderContent = () => {
        const sectionKey = employee.id ?? 'empty';
        switch (step) {
            case 0:
                return <BasicInformationSection key={sectionKey} employee={employee} setEmployee={setEmployee} handleSectionNavigation={handleSectionNavigation} />
            case 1:
                return <EmploymentSection key={sectionKey} employee={employee} setEmployee={setEmployee} handleSectionNavigation={handleSectionNavigation} />
            case 2:
                return <RecruitmentSection key={sectionKey} employee={employee} setEmployee={setEmployee} handleSectionNavigation={handleSectionNavigation} />
            case 3:
                return <CompensationSection key={sectionKey} employee={employee} setEmployee={setEmployee} handleSectionNavigation={handleSectionNavigation} />
            case 4:
                return <StatutorySection key={sectionKey} employee={employee} setEmployee={setEmployee} handleSectionNavigation={handleSectionNavigation} />
            case 5:
                return <OnboardingSection key={sectionKey} employee={employee} setEmployee={setEmployee} handleSectionNavigation={handleSectionNavigation} />
            default:
                break;
        }
    }

    if (loading) {
        return <Flex justify="center" align="center" className={styles.loadingWrapper}><Spin /></Flex>
    }

    return (
        <>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => { navigate(`/employees/view/${employeeId}`) }}>Back</Button>
            <h1>Edit Employee</h1>
            <Steps size="small" items={items} current={step} />

            <Flex>
                {handleRenderContent()}
            </Flex>
        </>
    );
};

export default EditEmployee;
