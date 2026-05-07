import { Col, Flex, Row } from "antd"
import type { Employee } from "../../../utils/types/employee";

type StatutoryTabContentType = {
    employee: Employee | undefined;
}

const StatutoryTabContent = ({ employee }: StatutoryTabContentType) => {
    return (
        <>
            <div style={{ background: 'white', padding: '24px', borderColor: '#E6EAEE', borderWidth: 1, borderStyle: 'solid', borderRadius: 12 }}>
                <Row style={{ marginBottom: 24 }}>
                    <Col span={12}>
                        <Flex vertical>
                            <span style={{ color: '#8893A0', textTransform: 'uppercase', fontSize: 12 }} >PAN Number</span>
                            <span>{employee?.statutory_details[0]?.pan_number || "-"}</span>
                        </Flex>
                    </Col>
                    <Col span={12}>
                        <Flex vertical>
                            <span style={{ color: '#8893A0', textTransform: 'uppercase', fontSize: 12 }}>Aadhar Number</span>
                            <span>{employee?.statutory_details[0]?.aadhar_number || "-"}</span>
                        </Flex>
                    </Col>
                </Row>
                <Row style={{ marginBottom: 24 }}>
                    <Col span={12}>
                        <Flex vertical>
                            <span style={{ color: '#8893A0', textTransform: 'uppercase', fontSize: 12 }} >UAN / PF Number</span>
                            <span>{employee?.statutory_details[0]?.pf_number || "-"}</span>
                        </Flex>
                    </Col>
                    
                </Row>
            </div>
        </>
    )

}

export default StatutoryTabContent