import { Tag } from "antd"

type ExpatStatusTagType = {
    status: string
}

const ExpatStatusTag = ({ status }: ExpatStatusTagType) => {
    let color = "magenta"
    if (status === 'expat') {
        color = "gold"
    }
    return <Tag color={color} variant='outlined'><span style={{ textTransform: 'capitalize' }}>{status}</span></Tag>
}

export default ExpatStatusTag;