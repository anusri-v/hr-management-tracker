export const DATE_FORMAT = "YYYY-MM-DD";

export const departmentOptions = [
    { label: 'Engineering', value: 'Engineering' },
    { label: 'Product', value: 'Product' },
    { label: 'Design', value: 'Design' },
    { label: 'People Ops', value: 'People Ops' },
    { label: 'Finance', value: 'Finance' },
    { label: 'Marketing', value: 'Marketing' },
    { label: 'Sales', value: 'Sales' },
    { label: 'Operations', value: 'Operations' },
];

export const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Resigned', value: 'resigned' },
    { label: 'Inactive', value: 'inactive' },
]

export const currencyOptions = [
    { label: 'INR - Indian Rupee', value: 'inr' },
    { label: 'QAR - Qatari Riyal', value: 'qar' },
    { label: 'AED - UAE Dirham', value: 'aed' },
    { label: 'BDT - Bangladeshi Taka', value: 'bdt' },
    { label: 'USD - US Dollar', value: 'usd' },
];

export const CURRENCY_PREFIX: Record<string, string> = {
    inr: '₹',
    qar: '﷼',
    aed: 'د.إ',
    bdt: '৳',
    usd: '$',
};

export const workLocationOption = [
    { label: 'Bengaluru - India', value: 'Bengaluru - India' },
    { label: 'Doha - Qatar', value: 'Doha - Qatar' },
    { label: 'Dubai - UAE', value: 'Dubai - UAE' },
    { label: 'Riyad - Saudi Arabia', value: 'Riyad - Saudi Arabia' },
    { label: 'Dhaka - Bangladesh', value: 'Dhaka - Bangladesh' },
    { label: 'Remote - India', value: 'Remote - India' },
];

export const expatOptions = [
    { label: 'Native', value: 'native' },
    { label: 'Expat', value: 'expat' },
]