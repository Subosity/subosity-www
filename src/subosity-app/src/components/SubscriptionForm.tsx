import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Form, Button } from 'react-bootstrap';
import { Subscription } from '../types';
import { supabase } from '../supabaseClient';
import Select from 'react-select';

export interface SubscriptionFormRef {
    submitForm: () => void;
}

interface Props {
    subscription?: Subscription;
    onSubmit: (data: Partial<Subscription>) => void;
    onCancel: () => void;
}

const SubscriptionForm = forwardRef<SubscriptionFormRef, Props>(({ subscription, onSubmit, onCancel }, ref) => {
    const [providers, setProviders] = useState<any[]>([]);
    const [paymentProviders, setPaymentProviders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Subscription>>({
        providerId: '',
        startDate: '',
        renewalFrequency: 'monthly',
        autoRenewal: false,
        amount: 0,
        paymentProviderId: '',
        paymentDetails: '',
        notes: '',
        isFreeTrial: false,
        ...subscription
    });

    useEffect(() => {
        const fetchProviders = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Fetch both providers in parallel
                const [subscriptionResponse, paymentResponse] = await Promise.all([
                    supabase.from('subscription_provider').select('*'),
                    supabase.from('payment_provider').select('*')
                ]);

                if (subscriptionResponse.error) throw subscriptionResponse.error;
                if (paymentResponse.error) throw paymentResponse.error;

                console.log('Providers from DB:', {
                    subscription: subscriptionResponse.data,
                    payment: paymentResponse.data
                });

                setProviders(subscriptionResponse.data || []);
                setPaymentProviders(paymentResponse.data || []);

            } catch (err) {
                console.error('Error fetching providers:', err);
                setError('Failed to load providers');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProviders();
    }, []);

    // Debug log when providers change
    useEffect(() => {
        console.log('Current payment providers state:', paymentProviders);
    }, [paymentProviders]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Create a copy of form data and handle empty date
        const submissionData = {
            ...formData,
            startDate: formData.startDate || null // Convert empty string to null
        };
        
        onSubmit(submissionData);
    };

    useImperativeHandle(ref, () => ({
        submitForm: () => {
            const submissionData = {
                ...formData,
                startDate: formData.startDate || null
            };
            onSubmit(submissionData);
        }
    }));

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
                <Form.Label>Provider</Form.Label>
                <Select
                    value={providers.find(p => p.id === formData.providerId)}
                    onChange={(option) => {
                        setFormData({
                            ...formData,
                            providerId: option?.id || ''
                        });
                    }}
                    options={providers}
                    getOptionLabel={(option) => option.name}
                    getOptionValue={(option) => option.id}
                    isSearchable={true}
                    isClearable={false}
                    placeholder="Select subscription provider..."
                    formatOptionLabel={provider => (
                        <div className="d-flex align-items-center">
                            <div className="rounded bg-light d-flex align-items-center justify-content-center p-1"
                                 style={{ 
                                     width: '32px', 
                                     height: '32px',
                                     backgroundColor: 'var(--bs-gray-200) !important',
                                     flexShrink: 0
                                 }}>
                                <img
                                    src={provider.icon}
                                    alt={`${provider.name} icon`}
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        objectFit: 'contain'
                                    }}
                                />
                            </div>
                            <span className="ms-2">{provider.name}</span>
                        </div>
                    )}
                    styles={{
                        control: (base) => ({
                            ...base,
                            borderColor: 'var(--bs-border-color)',
                            backgroundColor: 'var(--bs-body-bg)',
                            color: 'var(--bs-body-color)'
                        }),
                        option: (base) => ({
                            ...base,
                            backgroundColor: 'var(--bs-body-bg)',
                            color: 'var(--bs-body-color)',
                            ':hover': {
                                backgroundColor: 'var(--bs-primary)',
                                color: 'white'
                            }
                        }),
                        singleValue: (base) => ({
                            ...base,
                            color: 'var(--bs-body-color)'
                        }),
                        menu: (base) => ({
                            ...base,
                            backgroundColor: 'var(--bs-body-bg)',
                            borderColor: 'var(--bs-border-color)'
                        })
                    }}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                    type="date"
                    value={formData.startDate || ''}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Amount</Form.Label>
                <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                    required
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Renewal Frequency</Form.Label>
                <Form.Select
                    value={formData.renewalFrequency}
                    onChange={(e) => setFormData({ ...formData, renewalFrequency: e.target.value })}
                >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Check
                    type="checkbox"
                    label="Auto Renewal"
                    checked={formData.autoRenewal}
                    onChange={(e) => setFormData({ ...formData, autoRenewal: e.target.checked })}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Check
                    type="checkbox"
                    label="Free Trial"
                    checked={formData.isFreeTrial}
                    onChange={(e) => setFormData({ ...formData, isFreeTrial: e.target.checked })}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Payment Method</Form.Label>
                <Select
                    value={paymentProviders.find(p => p.id === formData.paymentProviderId)}
                    onChange={(option) => {
                        console.log('Selected option:', option); // Debug log
                        setFormData({
                            ...formData,
                            paymentProviderId: option?.id || ''
                        });
                    }}
                    options={paymentProviders}
                    getOptionLabel={(option) => option.name}
                    getOptionValue={(option) => option.id}
                    isSearchable={true}
                    isClearable={false}
                    placeholder="Select payment method..."
                    formatOptionLabel={provider => (
                        <div className="d-flex align-items-center">
                            <div className="rounded bg-light d-flex align-items-center justify-content-center p-1"
                                 style={{ 
                                     width: '32px', 
                                     height: '32px',
                                     backgroundColor: 'var(--bs-gray-200) !important',
                                     flexShrink: 0
                                 }}>
                                <img
                                    src={provider.icon}
                                    alt={`${provider.name} icon`}
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        objectFit: 'contain'
                                    }}
                                />
                            </div>
                            <span className="ms-2">{provider.name}</span>
                        </div>
                    )}
                    styles={{
                        control: (base) => ({
                            ...base,
                            borderColor: 'var(--bs-border-color)',
                            backgroundColor: 'var(--bs-body-bg)',
                            color: 'var(--bs-body-color)'
                        }),
                        option: (base) => ({
                            ...base,
                            backgroundColor: 'var(--bs-body-bg)',
                            color: 'var(--bs-body-color)',
                            ':hover': {
                                backgroundColor: 'var(--bs-primary)',
                                color: 'white'
                            }
                        }),
                        singleValue: (base) => ({
                            ...base,
                            color: 'var(--bs-body-color)'
                        }),
                        menu: (base) => ({
                            ...base,
                            backgroundColor: 'var(--bs-body-bg)',
                            borderColor: 'var(--bs-border-color)'
                        })
                    }}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Payment Details</Form.Label>
                <Form.Control
                    type="text"
                    value={formData.paymentDetails}
                    onChange={(e) => setFormData({ ...formData, paymentDetails: e.target.value })}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
            </Form.Group>
        </Form>
    );
});

export default SubscriptionForm;