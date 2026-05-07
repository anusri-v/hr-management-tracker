import { Tag } from "antd"

type EmploymentStatusTagType = {
    status: string
}

const EmploymentStatusTag = ({ status }: EmploymentStatusTagType) => {
    let color = "grey"
    if (status === 'active') {
        color = "green"
    } else if (status === 'resigned') {
        color = "red"
    }
    return <Tag color={color} variant='outlined'><span style={{ textTransform: 'capitalize' }}>{status}</span></Tag>
}

export default EmploymentStatusTag;