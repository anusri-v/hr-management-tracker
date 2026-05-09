import { Button, Flex, Progress } from "antd";
import type { Employee } from "../../../utils/types/employee";
import dayjs from 'dayjs';
import { useState } from "react";
import ResignationModal from "../ResignationModal";
import shared from '../../../utils/styles/shared.module.css';
import styles from './ExitDetailsTabContent.module.css';

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
            <Flex vertical className={styles.exitBanner}>
                <span className={styles.exitBannerLabel}>Serving notice</span>

                <span className={styles.exitBannerHeading}><span className={styles.exitHighlight}>{daysUntilLastWorkingDate}</span> days until last working day</span>
                <Progress percent={percent} strokeColor={"#E55958"} showInfo={false} />
                <Flex justify='space-between' className={styles.exitBannerDates}>
                    <Flex vertical>
                        <span className={shared.fieldLabelSpaced}>Resigned</span>
                        <span className={styles.smallBold}>{resignedDateStr}</span>
                    </Flex>

                    <Flex vertical>
                        <span className={shared.fieldLabelSpaced}>Last Working Day</span>
                        <span className={styles.smallBold}>{lastWorkingDateStr}</span>
                    </Flex>
                </Flex>

                <Flex justify='space-between' className={styles.exitInfoBox}>
                    <Flex vertical>
                        <span className={shared.fieldLabelSpaced}>Last Working Day</span>
                        <span className={styles.smallBold}>{lastWorkingDateStr}</span>
                    </Flex>

                    <Flex vertical>
                        <span className={shared.fieldLabelSpaced}>Exit reason</span>
                        <span className={styles.smallBold}>{exitDetails?.exit_reason}</span>
                    </Flex>

                    <Flex vertical>
                        <span className={shared.fieldLabelSpaced}>Notice period</span>
                        <span className={styles.smallBold}>{noticePeriod} Days</span>
                    </Flex>

                    <Flex vertical>
                        <span className={shared.fieldLabelSpaced}>Full & Final Settlement Status</span>
                        <span className={styles.smallBoldCapitalize}>{exitDetails?.final_settlement_status}</span>
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
