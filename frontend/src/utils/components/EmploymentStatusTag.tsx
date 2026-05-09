import { Tag } from "antd"
import shared from '../styles/shared.module.css';

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
    return <Tag color={color} variant='outlined'><span className={shared.capitalize}>{status}</span></Tag>
}

export default EmploymentStatusTag;
