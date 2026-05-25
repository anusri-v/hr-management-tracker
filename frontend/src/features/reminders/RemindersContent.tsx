import { Empty, Flex, message } from "antd";
import { useState, useEffect } from "react";
import apiClient from "../../utils/apiClient";
import BirthdayReminder from "../../utils/components/BirthdayReminder";
import LastWorkingDayReminder from "../../utils/components/LastWorkingDayReminder";
import ThreeMilestoneReminder from "../../utils/components/ThreeMilestoneReminder";
import WorkAnniversaryReminder from "../../utils/components/WorkAnniversaryReminder";
import type { ReminderType } from "../../utils/types/employee";
import styles from './RemindersContent.module.css';

const RemindersContent = () => {

    const [reminders, setReminders] = useState<ReminderType[]>([]);

    useEffect(() => {
        handleReminderData()
    }, [])

    async function handleReminderData() {
        try {
            const data = await apiClient.get<{ success: boolean; reminders: ReminderType[]; total: number }>(`/employee/reminders`);
            if (!data.success) {
                message.error('Something went wrong')
                return
            }
            setReminders(data.reminders)
        } catch (e) {
            console.error('Failed to fetch reminders: ', e)
            message.error('Internal server error')
        }
    }

    const handleReminderRender = (reminder: ReminderType) => {
        if (reminder.type === 'birthday') {
            return <BirthdayReminder type={reminder.type} full_name={reminder.full_name} date={reminder.date} employee_id={reminder.employee_id} />
        } else if (reminder.type === 'work_anniversary') {
            return <WorkAnniversaryReminder type={reminder.type} full_name={reminder.full_name} date={reminder.date} employee_id={reminder.employee_id} />
        } else if (reminder.type === 'last_working_day') {
            return <LastWorkingDayReminder type={reminder.type} full_name={reminder.full_name} date={reminder.date} employee_id={reminder.employee_id} />
        } else if (reminder.type === 'three_month_milestone') {
            return <ThreeMilestoneReminder type={reminder.type} full_name={reminder.full_name} date={reminder.date} employee_id={reminder.employee_id} />
        }
        else {
            <></>
        }
    }

    return (
        <>
            <Flex vertical className={styles.reminderList}>
                {reminders.length === 0
                    ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No upcoming reminders" />
                    : reminders.map((reminder, idx) => (
                        <div key={`${reminder.type}-${reminder.employee_id}-${idx}`}>
                            {handleReminderRender(reminder)}
                        </div>
                    ))}
            </Flex>
        </>
    );

}

export default RemindersContent
