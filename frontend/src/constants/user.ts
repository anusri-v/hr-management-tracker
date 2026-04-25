export const USER_STATUS = {
    PENDING: 0,
    ACTIVE:  1,
    REVOKED: 2,
} as const;

export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];