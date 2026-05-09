import { Col, Flex, Row } from "antd"
import type { Employee } from "../../../utils/types/employee";
import shared from '../../../utils/styles/shared.module.css';

type OverviewTabContentType = {
    employee: Employee | undefined;
}

const OverviewTabContent = ({ employee }: OverviewTabContentType) => {
    return (
        <>
            <div className={shared.cardPanel}>
                <Row className={shared.rowGap}>
                    <Col span={12}>
                        <Flex vertical>
                            <span className={shared.fieldLabel}>Full Name</span>
                            <span>{employee?.full_name}</span>
                        </Flex>
                    </Col>
                    <Col span={12}>
                        <Flex vertical>
                            <span className={shared.fieldLabel}>Employee ID</span>
                            <span>{employee?.employee_id}</span>
                        </Flex>
                    </Col>
                </Row>
                <Row className={shared.rowGap}>
                    <Col span={12}>
                        <Flex vertical>
                            <span className={shared.fieldLabel}>Gender</span>
                            <span className={shared.capitalize}>{employee?.gender}</span>
                        </Flex>
                    </Col>
                    <Col span={12}>
                        <Flex vertical>
                            <span className={shared.fieldLabel}>Date of Birth</span>
                            <span>{new Date(employee?.date_of_birth || '').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </Flex>
                    </Col>
                </Row>
                <Row className={shared.rowGap}>
                    <Col span={12}>
                        <Flex vertical>
                            <span className={shared.fieldLabel}>Contact Number</span>
                            <span>{employee?.contact_number}</span>
                        </Flex>
                    </Col>
                    <Col span={12}>
                        <Flex vertical>
                            <span className={shared.fieldLabel}>Email</span>
                            <span>{employee?.email_id}</span>
                        </Flex>
                    </Col>
                </Row>
                <Row className={shared.rowGap}>
                    <Col span={12}>
                        <Flex vertical>
                            <span className={shared.fieldLabel}>Address</span>
                            <span>{employee?.address}</span>
                        </Flex>
                    </Col>
                </Row>
                <Row className={shared.rowGap}>
                    <Col span={12}>
                        <Flex vertical>
                            <span className={shared.fieldLabel}>Emergency Contact Name</span>
                            <span>{employee?.emergency_contact_name}</span>
                        </Flex>
                    </Col>
                    <Col span={12}>
                        <Flex vertical>
                            <span className={shared.fieldLabel}>Emergency Contact Number</span>
                            <span>{employee?.emergency_contact_phone}</span>
                        </Flex>
                    </Col>
                </Row>
                <Row className={shared.rowGap}>
                    <Col span={12}>
                        <Flex vertical>
                            <span className={shared.fieldLabel}>Father's Name</span>
                            <span>{employee?.family_members?.father_name}</span>
                        </Flex>
                    </Col>
                    <Col span={12}>
                        <Flex vertical>
                            <span className={shared.fieldLabel}>Mother's Name</span>
                            <span>{employee?.family_members?.mother_name}</span>
                        </Flex>
                    </Col>
                </Row>
                <Row className={shared.rowGap}>
                    <Col span={12}>
                        <Flex vertical>
                            <span className={shared.fieldLabel}>Spouse's Name</span>
                            <span>{employee?.family_members?.spouse_name}</span>
                        </Flex>
                    </Col>
                    <Col span={12}>
                        <Flex vertical>
                            <span className={shared.fieldLabel}>Child 1 Name</span>
                            <span>{employee?.family_members?.child1_name}</span>
                        </Flex>
                    </Col>
                </Row>
                <Row className={shared.rowGap}>
                    <Col span={12}>
                        <Flex vertical>
                            <span className={shared.fieldLabel}>Child 2 Name</span>
                            <span>{employee?.family_members?.child2_name}</span>
                        </Flex>
                    </Col>
                </Row>
            </div>
        </>
    )

}

export default OverviewTabContent
