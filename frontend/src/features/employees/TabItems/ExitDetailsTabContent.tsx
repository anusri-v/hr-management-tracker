import { Button, Flex, Progress } from "antd";
import type { Employee } from "../../../utils/types/employee";
import dayjs from 'dayjs';
import { useState } from "react";
import ResignationModal from "../ResignationModal";

type ExitDetailsTabContentType = {
    employee: Employee | undefined;
    onUpdate?: () => void;
}

const ExitDetailsTabContent = ({ employee, onUpdate }: ExitDetailsTabContentType) => {
    const [modalOpen, setModalOpen] = useState<boolean>(false);

    const exitDetails = employee?.exit_details?.[0]
    const resignedDate = dayjs(exitDetails?.created_at)
    const lastWorkingDate = dayjs(exitDetails?.last_working_day)
    const currentDate = dayjs(new Date())
    const noticePeriod = lastWorkingDate.diff(resignedDate, 'day')
    const daysUntilLastWorkingDate = lastWorkingDate.diff(currentDate, 'day')
    const percent = (1 - (daysUntilLastWorkingDate / noticePeriod)) * 100

    const resignedDateStr = resignedDate.format('DD MMM YYYY');
    const lastWorkingDateStr = lastWorkingDate.format('DD MMM YYYY');

    const handleModalOpen = () => {
        setModalOpen(true);
    }

    const handleModalClose = () => {
        setModalOpen(false);
    }

    return (
        <>
            <Flex vertical style={{ background: '#FCEEEA', borderWidth: 1, borderStyle: 'solid', borderRadius: 10, borderColor: '#E55958', padding: 20 }}>
                <span style={{ textTransform: 'uppercase', letterSpacing: 1, color: '#E55958', fontWeight: 'bold', fontSize: 12, padding: '12px 0px' }}>Serving notice</span>

                <span style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}><span style={{ color: '#E55958' }}>{daysUntilLastWorkingDate}</span> days until last working day</span>
                <Progress percent={percent} strokeColor={"#E55958"} showInfo={false} />
                <Flex justify='space-between' style={{ marginTop: 16 }}>
                    <Flex vertical>
                        <span style={{ color: "#8893A0", textTransform: 'uppercase', fontSize: 12, letterSpacing: 0.75 }}>Resigned</span>
                        <span style={{ fontSize: 12, fontWeight: 'bold' }}>{resignedDateStr}</span>
                    </Flex>

                    <Flex vertical>
                        <span style={{ color: "#8893A0", textTransform: 'uppercase', fontSize: 12, letterSpacing: 0.75 }}>Last Working Day</span>
                        <span style={{ fontSize: 12, fontWeight: 'bold' }}>{lastWorkingDateStr}</span>
                    </Flex>
                </Flex>

                <Flex justify='space-between' style={{ background: '#FEF9F7', padding: 16, marginTop: 16, borderColor: '#FEF9F8', borderRadius: 8, borderStyle: 'solid', borderWidth: 1 }}>
                    <Flex vertical>
                        <span style={{ color: "#8893A0", textTransform: 'uppercase', fontSize: 12, letterSpacing: 0.75 }}>Last Working Day</span>
                        <span style={{ fontSize: 12, fontWeight: 'bold' }}>{lastWorkingDateStr}</span>
                    </Flex>

                    <Flex vertical>
                        <span style={{ color: "#8893A0", textTransform: 'uppercase', fontSize: 12, letterSpacing: 0.75 }}>Exit reason</span>
                        <span style={{ fontSize: 12, fontWeight: 'bold' }}>{exitDetails?.exit_reason}</span>
                    </Flex>

                    <Flex vertical>
                        <span style={{ color: "#8893A0", textTransform: 'uppercase', fontSize: 12, letterSpacing: 0.75 }}>Notice period</span>
                        <span style={{ fontSize: 12, fontWeight: 'bold' }}>{noticePeriod} Days</span>
                    </Flex>

                    <Flex vertical>
                        <span style={{ color: "#8893A0", textTransform: 'uppercase', fontSize: 12, letterSpacing: 0.75 }}>Full & Final Settlement Status</span>
                        <span style={{ fontSize: 12, fontWeight: 'bold', textTransform: 'capitalize' }}>{exitDetails?.final_settlement_status}</span>
                    </Flex>

                    <Button onClick={() => handleModalOpen()}>Edit</Button>
                </Flex>
            </Flex>

            <ResignationModal
                open={modalOpen}
                employee={employee}
                onClose={handleModalClose}
                onSuccess={onUpdate}
            />
        </>
    )
}

export default ExitDetailsTabContent;