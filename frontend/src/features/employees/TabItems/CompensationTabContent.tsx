import { Col, Empty, Flex, Progress, Row, Tag } from "antd"
import type { Employee } from "../../../utils/types/employee";

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
                <Flex vertical gap={12} style={{ width: '100%' }}>
                    {breakdown.map((element: BreakdownItem, idx: number) => (
                        <Flex key={element.label ?? idx} vertical gap={4}>
                            <Flex justify="space-between">
                                <span>{element.label}</span>
                                <span>{element.amount?.toLocaleString('en-IN')} <span style={{ color: '#8893A0', fontSize: 12 }}>{element.percent}%</span></span>
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
            <Row style={{ background: 'white', padding: '24px', borderColor: '#E6EAEE', borderWidth: 1, borderStyle: 'solid', borderRadius: 12, marginBottom: 16 }}>
                <Col span={8}>
                    <Flex vertical>
                        <Flex gap={8} align='baseline'>
                            <span style={{ color: '#8893A0', textTransform: 'uppercase', fontSize: 12 }} >Current CTC</span>
                            <Tag color={"magenta"}>{comp?.currency}</Tag>
                        </Flex>
                        <span style={{ fontSize: 40, fontWeight: 'bold' }}>{comp?.salary_ctc || "-"}</span>
                        <span style={{ color: '#8893A0', fontSize: 12 }}>Effective from: {new Date(comp?.effective_from || '').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </Flex>
                </Col>
                <Col span={16}>
                    <Flex style={{ width: '100%' }} align="center" justify='center'>
                        {handleBreakdownData()}
                    </Flex>
                </Col>
            </Row>
            <div style={{ background: 'white', padding: '24px', borderColor: '#E6EAEE', borderWidth: 1, borderStyle: 'solid', borderRadius: 12 }}>
                <Row style={{ marginBottom: 24 }}>
                    <Col span={12}>
                        <Flex vertical>
                            <span style={{ color: '#8893A0', textTransform: 'uppercase', fontSize: 12 }} >Bank Name</span>
                            <span>{employee?.statutory_details[0]?.bank_name || "-"}</span>
                        </Flex>
                    </Col>
                    <Col span={12}>
                        <Flex vertical>
                            <span style={{ color: '#8893A0', textTransform: 'uppercase', fontSize: 12 }}>Account Number</span>
                            <span>{employee?.statutory_details[0]?.account_number || "-"}</span>
                        </Flex>
                    </Col>
                </Row>
                <Row style={{ marginBottom: 24 }}>
                    <Col span={12}>
                        <Flex vertical>
                            <span style={{ color: '#8893A0', textTransform: 'uppercase', fontSize: 12 }} >IFSC Code</span>
                            <span>{employee?.statutory_details[0]?.ifsc_code || "-"}</span>
                        </Flex>
                    </Col>

                </Row>
            </div>
        </>
    )
}

export default CompensationTabContent;