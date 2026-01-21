export type Student = {
    id: string;
    name: string;
    class: string;
    status: 'ACTIVE' | 'ARCHIVED';
    balance_status: 'CLEAR' | 'DUE';
};

export type Family = {
    id: string;
    father_name: string;
    phone: string;
    total_due: number; // Negative means they owe money
    children: Student[];
};
