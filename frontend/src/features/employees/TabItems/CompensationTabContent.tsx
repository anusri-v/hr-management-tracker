import { Col, Empty, Flex, Progress, Row, Tag } from "antd"
import type { Employee } from "../../../utils/types/employee";
import shared from '../../../utils/styles/shared.module.css';
import styles from './CompensationTabContent.module.css';

type CompensationTabContentType = {
    employee: Employee | undefined;
}

type BreakdownItem = {
    label: string;
    amount: number;
    percent: number;
};


const CompensationTabContent = ({ employee }: CompensationTabContentType) => {
    const raw = employee?.compensation_details[0]?.breakdown
    const breakdown = raw ? JSON.parse(raw) : []

    const comp = employee?.compensation_details?.[0]
    // const breakdown = []

    const handleBreakdownData = () => {
        if (breakdown?.length === 0) {
            return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={"No Salary Breakdown Data"} />
        } else {
            return (
                <Flex vertical gap={12} className={shared.fullWidth}>
                    {breakdown.map((element: BreakdownItem, idx: number) => (
                        <Flex key={element.label ?? idx} vertical gap={4}>
                            <Flex justify="space-between">
                                <span>{element.label}</span>
                                <span>{element.amount?.toLocaleString('en-IN')} <span className={styles.percentText}>{element.percent}%</span></span>
                            </Flex>
                            <Progress strokeColor={"#3CB5B0"} percent={element.percent} showInfo={false} />
                        </Flex>
                    ))}
                </Flex>
            )
        }
    }

    return (
        <>
            <Row className={`${shared.cardPanel} ${styles.ctcCard}`}>
                <Col span={8}>
                    <Flex vertical>
                        <Flex gap={8} align='baseline'>
                            <span className={shared.fieldLabel}>Current CTC</span>
                            <Tag color={"magenta"}>{comp?.currency}</Tag>
                        </Flex>
                        <span className={styles.ctcAmount}>{comp?.salary_ctc || "-"}</span>
                        <span className={shared.mutedText}>Effective from: {new Date(comp?.effective_from || '').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </Flex>
                </Col>
                <Col span={16}>
                    <Flex className={shared.fullWidth} align="center" justify='center'>
                        {handleBreakdownData()}
                    </Flex>
                </Col>
            </Row>
            <div className={shared.cardPanel}>
                <Row className={shared.rowGap}>
                    <Col span={12}>
                        <Flex vertical>
                            <span className={shared.fieldLabel}>Bank Name</span>
                            <span>{employee?.statutory_details[0]?.bank_name || "-"}</span>
                        </Flex>
                    </Col>
                    <Col span={12}>
                        <Flex vertical>
                            <span className={shared.fieldLabel}>Account Number</span>
                            <span>{employee?.statutory_details[0]?.account_number || "-"}</span>
                        </Flex>
                    </Col>
                </Row>
                <Row className={shared.rowGap}>
                    <Col span={12}>
                        <Flex vertical>
                            <span className={shared.fieldLabel}>IFSC Code</span>
                            <span>{employee?.statutory_details[0]?.ifsc_code || "-"}</span>
                        </Flex>
                    </Col>

                </Row>
            </div>
        </>
    )
}

export default CompensationTabContent;
