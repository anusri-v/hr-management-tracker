import { Tag } from "antd"
import shared from '../styles/shared.module.css';

type ExpatStatusTagType = {
    status: string
}

const ExpatStatusTag = ({ status }: ExpatStatusTagType) => {
    let color = "magenta"
    if (status === 'expat') {
        color = "gold"
    }
    return <Tag color={color} variant='outlined'><span className={shared.capitalize}>{status}</span></Tag>
}

export default ExpatStatusTag;
