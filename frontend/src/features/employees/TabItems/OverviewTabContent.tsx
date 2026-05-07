import { Col, Flex, Row } from "antd"
import type { Employee } from "../../../utils/types/employee";

type OverviewTabContentType = {
    employee: Employee | undefined;
}

const OverviewTabContent = ({ employee }: OverviewTabContentType) => {
    return (
        <>
            <div style={{ background: 'white', padding: '24px', borderColor: '#E6EAEE', borderWidth: 1, borderStyle: 'solid', borderRadius: 12 }}>
                <Row style={{ marginBottom: 24 }}>
                    <Col span={12}>
                        <Flex vertical>
                            <span style={{ color: '#8893A0', textTransform: 'uppercase', fontSize: 12 }} >Full Name</span>
                            <span>{employee?.full_name}</span>
                        </Flex>
                    </Col>
                    <Col span={12}>
                        <Flex vertical>
                            <span style={{ color: '#8893A0', textTransform: 'uppercase', fontSize: 12 }}>Employee ID</span>
                            <span>{employee?.employee_id}</span>
                        </Flex>
                    </Col>
                </Row>
                <Row style={{ marginBottom: 24 }}>
                    <Col span={12}>
                        <Flex vertical>
                            <span style={{ color: '#8893A0', textTransform: 'uppercase', fontSize: 12 }} >Gender</span>
                            <span style={{ textTransform: 'capitalize' }}>{employee?.gender}</span>
                        </Flex>
                    </Col>
                    <Col span={12}>
                        <Flex vertical>
                            <span style={{ color: '#8893A0', textTransform: 'uppercase', fontSize: 12 }} >Date of Birth</span>
                            <span>{new Date(employee?.date_of_birth || '').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </Flex>
                    </Col>
                </Row>
                <Row style={{ marginBottom: 24 }}>
                    <Col span={12}>
                        <Flex vertical>
                            <span style={{ color: '#8893A0', textTransform: 'uppercase', fontSize: 12 }} >Contact Number</span>
                            <span>{employee?.contact_number}</span>
                        </Flex>
                    </Col>
                    <Col span={12}>
                        <Flex vertical>
                            <span style={{ color: '#8893A0', textTransform: 'uppercase', fontSize: 12 }} >Email</span>
                            <span>{employee?.email_id}</span>
                        </Flex>
                    </Col>
                </Row>
                <Row style={{ marginBottom: 24 }}>
                    <Col span={12}>
                        <Flex vertical>
                            <span style={{ color: '#8893A0', textTransform: 'uppercase', fontSize: 12 }} >Address</span>
                            <span>{employee?.address}</span>
                        </Flex>
                    </Col>
                </Row>
                <Row style={{ marginBottom: 24 }}>
                    <Col span={12}>
                        <Flex vertical>
                            <span style={{ color: '#8893A0', textTransform: 'uppercase', fontSize: 12 }} >Emergency Contact Name</span>
                            <span>{employee?.emergency_contact_name}</span>
                        </Flex>
                    </Col>
                    <Col span={12}>
                        <Flex vertical>
                            <span style={{ color: '#8893A0', textTransform: 'uppercase', fontSize: 12 }} >Emergency Contact Number</span>
                            <span>{employee?.emergency_contact_phone}</span>
                        </Flex>
                    </Col>
                </Row>
                <Row style={{ marginBottom: 24 }}>
                    <Col span={12}>
                        <Flex vertical>
                            <span style={{ color: '#8893A0', textTransform: 'uppercase', fontSize: 12 }} >Father's Name</span>
                            <span>{employee?.family_members?.father_name}</span>
                        </Flex>
                    </Col>
                    <Col span={12}>
                        <Flex vertical>
                            <span style={{ color: '#8893A0', textTransform: 'uppercase', fontSize: 12 }} >Mother's Name</span>
                            <span>{employee?.family_members?.mother_name}</span>
                        </Flex>
                    </Col>
                </Row>
                <Row style={{ marginBottom: 24 }}>
                    <Col span={12}>
                        <Flex vertical>
                            <span style={{ color: '#8893A0', textTransform: 'uppercase', fontSize: 12 }} >Spouse's Name</span>
                            <span>{employee?.family_members?.spouse_name}</span>
                        </Flex>
                    </Col>
                    <Col span={12}>
                        <Flex vertical>
                            <span style={{ color: '#8893A0', textTransform: 'uppercase', fontSize: 12 }} >Child 1 Name</span>
                            <span>{employee?.family_members?.child1_name}</span>
                        </Flex>
                    </Col>
                </Row>
                <Row style={{ marginBottom: 24 }}>
                    <Col span={12}>
                        <Flex vertical>
                            <span style={{ color: '#8893A0', textTransform: 'uppercase', fontSize: 12 }} >Child 2 Name</span>
                            <span>{employee?.family_members?.child2_name}</span>
                        </Flex>
                    </Col>
                </Row>
            </div>
        </>
    )

}

export default OverviewTabContent