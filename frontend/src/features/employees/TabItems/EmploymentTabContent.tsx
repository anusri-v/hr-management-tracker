import { Col, Flex, Row } from "antd"
import type { Employee } from "../../../utils/types/employee";
import EmploymentStatusTag from "../../../utils/components/EmploymentStatusTag";
import ExpatStatusTag from "../../../utils/components/ExpatStatusTag";

type EmploymentTabContentType = {
    employee: Employee | undefined;
}

const EmploymentTabContent = ({ employee }: EmploymentTabContentType) => {
    return (
        <>
            <div style={{ background: 'white', padding: '24px', borderColor: '#E6EAEE', borderWidth: 1, borderStyle: 'solid', borderRadius: 12 }}>
                <Row style={{ marginBottom: 24 }}>
                    <Col span={12}>
                        <Flex vertical>
                            <span style={{ color: '#8893A0', textTransform: 'uppercase', fontSize: 12 }} >Department</span>
                            <span>{employee?.department}</span>
                        </Flex>
                    </Col>
                    <Col span={12}>
                        <Flex vertical>
                            <span style={{ color: '#8893A0', textTransform: 'uppercase', fontSize: 12 }}>Designation</span>
                            <span>{employee?.designation}</span>
                        </Flex>
                    </Col>
                </Row>
                <Row style={{ marginBottom: 24 }}>
                    <Col span={12}>
                        <Flex vertical>
                            <span style={{ color: '#8893A0', textTransform: 'uppercase', fontSize: 12 }} >Reporting Manager</span>
                            <span style={{ textTransform: 'capitalize' }}>{employee?.reporting_manager_id}</span>
                        </Flex>
                    </Col>
                    <Col span={12}>
                        <Flex vertical>
                            <span style={{ color: '#8893A0', textTransform: 'uppercase', fontSize: 12 }} >Employment Type</span>
                            <span style={{ textTransform: 'capitalize' }}>{employee?.employment_type}</span>
                        </Flex>
                    </Col>
                </Row>
                <Row style={{ marginBottom: 24 }}>
                    <Col span={12}>
                        <Flex vertical>
                            <span style={{ color: '#8893A0', textTransform: 'uppercase', fontSize: 12 }} >Date of Joining</span>
                            <span>{new Date(employee?.date_of_joining || '').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </Flex>
                    </Col>
                    <Col span={12}>
                        <Flex vertical>
                            <span style={{ color: '#8893A0', textTransform: 'uppercase', fontSize: 12 }} >Internal Transfer Date</span>
                            <span>{new Date(employee?.internal_transfer_date || '').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </Flex>
                    </Col>
                </Row>
                <Row style={{ marginBottom: 24 }}>
                    <Col span={12}>
                        <Flex vertical>
                            <span style={{ color: '#8893A0', textTransform: 'uppercase', fontSize: 12 }} >Expat Status</span>
                            <span style={{ textTransform: 'capitalize' }}><ExpatStatusTag status = {employee?.expat_status || ''} /></span>
                        </Flex>
                    </Col>
                    <Col span={12}>
                        <Flex vertical>
                            <span style={{ color: '#8893A0', textTransform: 'uppercase', fontSize: 12 }} >Work Location</span>
                            <span>{employee?.work_location}</span>
                        </Flex>
                    </Col>
                </Row>
                <Row style={{ marginBottom: 24 }}>
                    <Col span={12}>
                        <Flex vertical>
                            <span style={{ color: '#b8bcc0', textTransform: 'uppercase', fontSize: 12 }} >Status</span>
                            <span><EmploymentStatusTag status={employee?.employment_status || ''} /></span>
                        </Flex>
                    </Col>
                    <Col span={12}>
                        <Flex vertical>
                            <span style={{ color: '#8893A0', textTransform: 'uppercase', fontSize: 12 }} >Source of Hire</span>
                            <span style={{ textTransform: 'capitalize' }}>{employee?.source_of_hire}</span>
                        </Flex>
                    </Col>
                </Row>
            </div>
        </>
    )

}

export default EmploymentTabContent