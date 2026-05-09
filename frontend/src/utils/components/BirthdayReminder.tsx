import { Flex } from "antd";
import dayjs from "dayjs";
import type { ReminderType } from "../types/employee";
import { SmileOutlined } from '@ant-design/icons';
import styles from './Reminder.module.css';

const BirthdayReminder = ({ full_name, date, employee_id }: ReminderType) => {
    const today = dayjs().startOf('day')
    const originalDate = dayjs(date).startOf('day')
    const formattedDate = originalDate.year(today.year())
    const dayDifference = formattedDate.diff(today, 'day')
    const yearDifference = today.diff(originalDate, 'year')
    const heading = dayDifference === 0 ? 'Birthday today!' : 'Upcoming Birthday'

    return (
        <>
            <Flex className={styles.reminderRow} align="center">
                <Flex style={{ background: "#FFF9E0" }} className={styles.reminderIconBox}>
                    <SmileOutlined className={styles.reminderIcon} style={{ color: "#8A6500" }}/>
                </Flex>
                <Flex gap={8} vertical className={styles.reminderInfo}>
                    <span className={styles.reminderHeading}>{heading} - {formattedDate.format("DD MMMM YYYY")} {dayDifference > 0 && `· in ${dayDifference} day${dayDifference === 1 ? '' : 's'}`}</span>
                    <span className={styles.reminderSubtitle}>{full_name} ({employee_id}) turns {yearDifference} </span>
                </Flex>
            </Flex>
        </>
    )

}

export default BirthdayReminder;
