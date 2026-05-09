import { Flex } from "antd";
import dayjs from "dayjs";
import type { ReminderType } from "../types/employee";
import { StarOutlined } from '@ant-design/icons';
import styles from './Reminder.module.css';

const ThreeMilestoneReminder = ({ full_name, date, employee_id }: ReminderType) => {
    const today = dayjs().startOf('day')
    const originalDate = dayjs(date).startOf('day')
    const formattedDate = originalDate.year(today.year())
    const dayDifference = formattedDate.diff(today, 'day')

    return (
        <>
            <Flex className={styles.reminderRow} align="center">
                <Flex style={{ background: "#EEE9FE" }} className={styles.reminderIconBox}>
                    <StarOutlined className={styles.reminderIcon} style={{ color: "#5B4CDB" }}/>
                </Flex>
                <Flex gap={8} vertical className={styles.reminderInfo}>
                    <span className={styles.reminderHeading}>3-month milestone - {formattedDate.format("DD MMMM YYYY")} {dayDifference > 0 && `· in ${dayDifference} day${dayDifference === 1 ? '' : 's'}`}</span>
                    <span className={styles.reminderSubtitle}>{full_name} ({employee_id}) completes 3 months</span>
                </Flex>
            </Flex>
        </>
    )

}

export default ThreeMilestoneReminder;
