interface Subscription {
    id: string;
    name: string;
    icon: string; // base64
    startDate: string;
    renewalFrequency: 'monthly' | 'yearly' | 'quarterly';
    autoRenewal: boolean;
    paymentIcon: string;
    paymentDetails: string;
    notes?: string;
}