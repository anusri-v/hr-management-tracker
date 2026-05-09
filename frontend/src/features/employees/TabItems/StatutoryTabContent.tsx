import { Col, Flex, Row } from "antd"
import type { Employee } from "../../../utils/types/employee";
import shared from '../../../utils/styles/shared.module.css';

type StatutoryTabContentType = {
    employee: Employee | undefined;
}

const StatutoryTabContent = ({ employee }: StatutoryTabContentType) => {
    return (
        <>
            <div className={shared.cardPanel}>
                <Row className={shared.rowGap}>
                    <Col span={12}>
                        <Flex vertical>
                            <span className={shared.fieldLabel}>PAN Number</span>
                            <span>{employee?.statutory_details[0]?.pan_number || "-"}</span>
                        </Flex>
                    </Col>
                    <Col span={12}>
                        <Flex vertical>
                            <span className={shared.fieldLabel}>Aadhar Number</span>
                            <span>{employee?.statutory_details[0]?.aadhar_number || "-"}</span>
                        </Flex>
                    </Col>
                </Row>
                <Row className={shared.rowGap}>
                    <Col span={12}>
                        <Flex vertical>
                            <span className={shared.fieldLabel}>UAN / PF Number</span>
                            <span>{employee?.statutory_details[0]?.pf_number || "-"}</span>
                        </Flex>
                    </Col>
                </Row>
            </div>
        </>
    )

}

export default StatutoryTabContent
