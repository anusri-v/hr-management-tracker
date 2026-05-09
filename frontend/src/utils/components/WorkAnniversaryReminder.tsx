import { Flex } from "antd";
import dayjs from "dayjs";
import type { ReminderType } from "../types/employee";
import { CalendarOutlined } from '@ant-design/icons';
import styles from './Reminder.module.css';

const WorkAnniversaryReminder = ({ full_name, date, employee_id }: ReminderType) => {
    const today = dayjs().startOf('day')
    const originalDate = dayjs(date).startOf('day')
    const formattedDate = originalDate.year(today.year())
    const dayDifference = formattedDate.diff(today, 'day')
    const yearDifference = formattedDate.diff(originalDate, 'year')
    const heading = dayDifference === 0 ? 'Work Anniversary today!' : 'Upcoming Work Anniversary'

    return (
        <>
            <Flex className={styles.reminderRow} align="center">
                <Flex style={{ background: "#DFF3F1" }} className={styles.reminderIconBox}>
                    <CalendarOutlined className={styles.reminderIcon} style={{ color: "#207A78" }}/>
                </Flex>
                <Flex gap={8} vertical className={styles.reminderInfo}>
                    <span className={styles.reminderHeading}>{heading} - {formattedDate.format("DD MMMM YYYY")} {dayDifference > 0 && `· in ${dayDifference} day${dayDifference === 1 ? '' : 's'}`} </span>
                    <span className={styles.reminderSubtitle}>{full_name} ({employee_id}) joined {yearDifference} yrs ago</span>
                </Flex>
            </Flex>
        </>
    )

}

export default WorkAnniversaryReminder;
