export interface Subscription {
    id: string;
    providerId: string;
    providerName: string;
    providerDescription: string;
    providerCategory: string;
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
    state: 'trial' | 'active' | 'canceled' | 'expired' | 'paused';
    nickname?: string;
}