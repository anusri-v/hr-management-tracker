import { Tag } from "antd"
import shared from '../styles/shared.module.css';

type EmploymentTypeTagType = {
    employment_type: string
}

const EmploymentTypeTag = ({ employment_type }: EmploymentTypeTagType) => {
    let color = "grey"
    if (employment_type === 'full-time') {
        color = "cyan"
        employment_type = "Full Time"
    } else if (employment_type === 'intern') {
        color = "gold"
    } else if (employment_type === 'contract') {
        color = "purple"
    }
    return <Tag color={color} variant='outlined'><span className={shared.capitalize}>{employment_type}</span></Tag>
}

export default EmploymentTypeTag;
