import { Col, Flex, Row } from "antd"
import type { Employee } from "../../../utils/types/employee";
import EmploymentStatusTag from "../../../utils/components/EmploymentStatusTag";
import ExpatStatusTag from "../../../utils/components/ExpatStatusTag";
import shared from '../../../utils/styles/shared.module.css';

type EmploymentTabContentType = {
    employee: Employee | undefined;
}

const EmploymentTabContent = ({ employee }: EmploymentTabContentType) => {
    return (
        <>
            <div className={shared.cardPanel}>
                <Row className={shared.rowGap}>
                    <Col span={12}>
                        <Flex vertical>
                            <span className={shared.fieldLabel}>Department</span>
                            <span>{employee?.department}</span>
                        </Flex>
                    </Col>
                    <Col span={12}>
                        <Flex vertical>
                            <span className={shared.fieldLabel}>Designation</span>
                            <span>{employee?.designation}</span>
                        </Flex>
                    </Col>
                </Row>
                <Row className={shared.rowGap}>
                    <Col span={12}>
                        <Flex vertical>
                            <span className={shared.fieldLabel}>Reporting Manager</span>
                            <span className={shared.capitalize}>{employee?.reporting_manager_id}</span>
                        </Flex>
                    </Col>
                    <Col span={12}>
                        <Flex vertical>
                            <span className={shared.fieldLabel}>Employment Type</span>
                            <span className={shared.capitalize}>{employee?.employment_type}</span>
                        </Flex>
                    </Col>
                </Row>
                <Row className={shared.rowGap}>
                    <Col span={12}>
                        <Flex vertical>
                            <span className={shared.fieldLabel}>Date of Joining</span>
                            <span>{new Date(employee?.date_of_joining || '').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </Flex>
                    </Col>
                    <Col span={12}>
                        <Flex vertical>
                            <span className={shared.fieldLabel}>Internal Transfer Date</span>
                            <span>{new Date(employee?.internal_transfer_date || '').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </Flex>
                    </Col>
                </Row>
                <Row className={shared.rowGap}>
                    <Col span={12}>
                        <Flex vertical>
                            <span className={shared.fieldLabel}>Expat Status</span>
                            <span className={shared.capitalize}><ExpatStatusTag status = {employee?.expat_status || ''} /></span>
                        </Flex>
                    </Col>
                    <Col span={12}>
                        <Flex vertical>
                            <span className={shared.fieldLabel}>Work Location</span>
                            <span>{employee?.work_location}</span>
                        </Flex>
                    </Col>
                </Row>
                <Row className={shared.rowGap}>
                    <Col span={12}>
                        <Flex vertical>
                            <span className={shared.fieldLabel}>Status</span>
                            <span><EmploymentStatusTag status={employee?.employment_status || ''} /></span>
                        </Flex>
                    </Col>
                    <Col span={12}>
                        <Flex vertical>
                            <span className={shared.fieldLabel}>Source of Hire</span>
                            <span className={shared.capitalize}>{employee?.source_of_hire}</span>
                        </Flex>
                    </Col>
                </Row>
            </div>
        </>
    )

}

export default EmploymentTabContent
