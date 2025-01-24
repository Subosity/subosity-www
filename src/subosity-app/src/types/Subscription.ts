export interface Subscription {
    id: string;
    providerId: string;
    providerName: string;
    providerIcon: string;
    startDate: string | null;
    renewalFrequency: string;
    autoRenewal: boolean;
    amount: number;
    paymentProviderId: string;
    paymentProviderName: string;
    paymentProviderIcon: string;
    paymentDetails: string;
    notes?: string;
    isFreeTrial: boolean;
}