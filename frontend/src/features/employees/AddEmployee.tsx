import { Button, Flex, message, Steps } from "antd";
import { useState } from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";
import BasicInformationSection from "./BasicInformationSection";
import EmploymentSection from "./EmploymentSection";
import RecruitmentSection from "./RecruitmentSection";
import CompensationSection from "./CompensationSection";
import StatutorySection from "./StatutorySection";
import OnboardingSection from "./OnboardingSection";
import { useNavigate } from "react-router-dom";

export type Employee = {
    full_name: string;
    employee_id: string;
    gender: string;
    date_of_birth: string;
    contact_number: string;
    email_id: string;
    address: string;
    department: string;
    designation: string;
    date_of_joining: string;
    reporting_manager: string;
    employment_type: string;
    work_location: string;
    source_of_hire: string;
    offer_letter_date: string;
    interview_date: string;
    interview_panel: string;
    currency: string;
    ctc: string;
    bank_name: string;
    account_number: string;
    ifsc_code: string;
    pan_number: string;
    aadhar_number: string;
    uan_number: string;
    offer_letter_status: string;
}

const items = [
    { title: 'Part 1', content: 'Basic Information' },
    { title: 'Part 2', content: 'Employment' },
    { title: 'Part 3', content: 'Recruitment' },
    { title: 'Part 4', content: 'Compensation' },
    { title: 'Part 5', content: 'Statutory' },
    { title: 'Part 6', content: 'Onboarding & Docs' },
];

const AddEmployee = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0)
    const [employee, setEmployee] = useState<Employee>({
        full_name: '', employee_id: '', gender: '', date_of_birth: '',
        contact_number: '', email_id: '', address: '', department: '', designation: '',
        date_of_joining: '', reporting_manager: '', employment_type: '', work_location: '',
        source_of_hire: '', offer_letter_date: '', interview_date: '', interview_panel: '',
        currency: '', ctc: '', bank_name: '', account_number: '',
        ifsc_code: '', pan_number: '', aadhar_number: '', uan_number: '', offer_letter_status: '',
    })

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
        switch (step) {
            case 0:
                return <BasicInformationSection employee={employee} setEmployee={setEmployee} handleSectionNavigation={handleSectionNavigation} />
            case 1:
                return <EmploymentSection employee={employee} setEmployee={setEmployee} handleSectionNavigation={handleSectionNavigation} />
            case 2:
                return <RecruitmentSection employee={employee} setEmployee={setEmployee} handleSectionNavigation={handleSectionNavigation} />
            case 3:
                return <CompensationSection employee={employee} setEmployee={setEmployee} handleSectionNavigation={handleSectionNavigation} />
            case 4:
                return <StatutorySection employee={employee} setEmployee={setEmployee} handleSectionNavigation={handleSectionNavigation} />
            case 5:
                return <OnboardingSection employee={employee} setEmployee={setEmployee} handleSectionNavigation={handleSectionNavigation} />
            default:
                break;
        }
    }

    return (
        <>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => { navigate('/employees') }}>Back</Button>
            <h1>Add New Employee</h1>
            <Steps size="small" items={items} current={step} />

            <Flex>
                {handleRenderContent()}
            </Flex>
        </>
    );
};

export default AddEmployee;
