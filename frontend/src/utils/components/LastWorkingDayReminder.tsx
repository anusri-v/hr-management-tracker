import { Flex } from "antd";
import dayjs from "dayjs";
import type { ReminderType } from "../types/employee";
import { LogoutOutlined } from '@ant-design/icons';
import styles from './Reminder.module.css';

const LastWorkingDayReminder = ({ full_name, date, employee_id }: ReminderType) => {
    const today = dayjs().startOf('day')
    const originalDate = dayjs(date).startOf('day')
    const formattedDate = originalDate.year(today.year())
    const dayDifference = formattedDate.diff(today, 'day')

    return (
        <>
            <Flex className={styles.reminderRow} align="center">
                <Flex style={{ background: "#FDECEB" }} className={styles.reminderIconBox}>
                    <LogoutOutlined className={styles.reminderIcon} style={{ color: "#E55958" }}/>
                </Flex>
                <Flex gap={8} vertical className={styles.reminderInfo}>
                    <span className={styles.reminderHeading}>Last working day - {formattedDate.format("DD MMMM YYYY")} {dayDifference > 0 && `· in ${dayDifference} day${dayDifference === 1 ? '' : 's'}`}</span>
                    <span className={styles.reminderSubtitle}>{full_name} ({employee_id}) </span>
                </Flex>
            </Flex>
        </>
    )

}

export default LastWorkingDayReminder;
