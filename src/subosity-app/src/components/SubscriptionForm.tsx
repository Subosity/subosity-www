import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';
import { Subscription } from '../types';
import { supabase } from '../supabaseClient';
import Select from 'react-select';

// Update SubscriptionFormRef interface
export interface SubscriptionFormRef {
    submitForm: () => void;
    isValid: boolean;
}

interface Props {
    subscription?: Subscription;
    onSubmit: (data: Partial<Subscription>) => void;
    onCancel: () => void;
}

const frequencyOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
];

interface ValidationErrors {
    providerId?: string;
    startDate?: string;
    amount?: string;
    paymentProviderId?: string;
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

    const [isValid, setIsValid] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [validated, setValidated] = useState(false);

    const validateForm = (data: Partial<Subscription>): ValidationErrors => {
        const newErrors: ValidationErrors = {};
        
        if (!data.providerId) {
            newErrors.providerId = 'Please select a provider';
        }
        
        if (!data.startDate) {
            newErrors.startDate = 'Please select a start date';
        }
        
        if (!data.amount || data.amount <= 0) {
            newErrors.amount = 'Please enter a valid amount';
        }
        
        if (!data.paymentProviderId) {
            newErrors.paymentProviderId = 'Please select a payment method';
        }
        
        return newErrors;
    };

    useEffect(() => {
        const newErrors = validateForm(formData);
        setErrors(newErrors);
        setIsValid(Object.keys(newErrors).length === 0);
    }, [formData]);

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
        setValidated(true);
        const newErrors = validateForm(formData);
        setErrors(newErrors);
        
        if (Object.keys(newErrors).length === 0) {
            onSubmit(formData);
        }
    };

    const handleFieldTouch = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    useImperativeHandle(ref, () => ({
        submitForm: () => {
            setValidated(true);
            if (isValid) {
                onSubmit(formData);
            }
        },
        isValid
    }));

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
                <Form.Label>
                    Subscription Provider <span className="text-danger">*</span>
                </Form.Label>
                <Select
                    value={providers.find(p => p.id === formData.providerId)}
                    onChange={(option) => {
                        setFormData({
                            ...formData,
                            providerId: option?.id || ''
                        });
                        handleFieldTouch('providerId');
                    }}
                    onBlur={() => handleFieldTouch('providerId')}
                    required
                    isInvalid={validated && !formData.providerId}
                    options={providers}
                    getOptionLabel={(option) => option.name}
                    getOptionValue={(option) => option.id}
                    isSearchable={true}
                    isClearable={false}
                    placeholder="Select subscription provider..."
                    formatOptionLabel={provider => (
                        <div className="d-flex align-items-center justify-content-between w-100">
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
                            <span style={{ 
                                color: 'var(--bs-body-color)',
                                opacity: 0.5,
                                fontSize: '0.75em'
                            }}>
                                {provider.category}
                            </span>
                        </div>
                    )}
                    filterOption={(option, input) => {
                        const searchInput = input.toLowerCase();
                        return (
                            option.data.name.toLowerCase().includes(searchInput) ||
                            (option.data.category && option.data.category.toLowerCase().includes(searchInput))
                        );
                    }}
                    styles={{
                        control: (base) => ({
                            ...base,
                            backgroundColor: 'var(--bs-body-bg)',
                            borderColor: validated && errors.providerId ? 'var(--bs-danger)' : 'var(--bs-border-color)',
                            '&:hover': {
                                borderColor: validated && errors.providerId ? 'var(--bs-danger)' : 'var(--bs-border-color)'
                            }
                        }),
                        input: (base) => ({
                            ...base,
                            color: 'var(--bs-body-color)'
                        }),
                        placeholder: (base) => ({
                            ...base,
                            color: 'var(--bs-body-color)',
                            opacity: 0.5
                        }),
                        option: (base, { isFocused }) => ({
                            ...base,
                            backgroundColor: isFocused ? 'var(--bs-primary)' : 'var(--bs-body-bg)',
                            color: isFocused ? 'white' : 'var(--bs-body-color)',
                            ':active': {
                                backgroundColor: 'var(--bs-primary)'
                            }
                        }),
                        menu: (base) => ({
                            ...base,
                            backgroundColor: 'var(--bs-body-bg)',
                            borderColor: 'var(--bs-border-color)'
                        }),
                        singleValue: (base) => ({
                            ...base,
                            color: 'var(--bs-body-color)'
                        })
                    }}
                />
                {validated && errors.providerId && (
                    <div className="text-danger small mt-1">{errors.providerId}</div>
                )}
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>
                    Start Date <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                    type="date"
                    value={formData.startDate || ''}
                    onChange={(e) => {
                        setFormData({ ...formData, startDate: e.target.value });
                        handleFieldTouch('startDate');
                    }}
                    onBlur={() => handleFieldTouch('startDate')}
                    required
                    isInvalid={validated && !formData.startDate}
                    placeholder="Select start date"
                    style={{
                        backgroundColor: 'var(--bs-body-bg)',
                        color: 'var(--bs-body-color)',
                        borderColor: validated && errors.startDate ? 'var(--bs-danger)' : 'var(--bs-border-color)'
                    }}
                />
                {validated && errors.startDate && (
                    <div className="text-danger small mt-1">{errors.startDate}</div>
                )}
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>
                    Amount per Period <span className="text-danger">*</span>
                </Form.Label>
                <InputGroup hasValidation>
                    <InputGroup.Text style={{
                        backgroundColor: 'var(--bs-body-bg)',
                        color: 'var(--bs-body-color)',
                        borderColor: 'var(--bs-border-color)'
                    }}>$</InputGroup.Text>
                    <Form.Control
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                        required
                        isInvalid={validated && (!formData.amount || formData.amount <= 0)}
                        style={{
                            backgroundColor: 'var(--bs-body-bg)',
                            color: 'var(--bs-body-color)',
                            borderColor: 'var(--bs-border-color)'
                        }}
                    />
                    <Form.Control.Feedback type="invalid">
                        Please enter a valid amount
                    </Form.Control.Feedback>
                </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Renewal Frequency</Form.Label>
                <Select
                    value={frequencyOptions.find(f => f.value === formData.renewalFrequency)}
                    onChange={(option) => {
                        setFormData({
                            ...formData,
                            renewalFrequency: option?.value || 'monthly'
                        });
                    }}
                    options={frequencyOptions}
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
                <Form.Label>
                    Payment Method <span className="text-danger">*</span>
                </Form.Label>
                <Select
                    value={paymentProviders.find(p => p.id === formData.paymentProviderId)}
                    onChange={(option) => {
                        console.log('Selected option:', option); // Debug log
                        setFormData({
                            ...formData,
                            paymentProviderId: option?.id || ''
                        });
                        handleFieldTouch('paymentProviderId');
                    }}
                    onBlur={() => handleFieldTouch('paymentProviderId')}
                    required
                    isInvalid={validated && !formData.paymentProviderId}
                    options={paymentProviders}
                    getOptionLabel={(option) => option.name}
                    getOptionValue={(option) => option.id}
                    isSearchable={true}
                    isClearable={false}
                    placeholder="Select payment method..."
                    formatOptionLabel={provider => (
                        <div className="d-flex align-items-center justify-content-between w-100">
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
                            <span style={{ 
                                color: 'var(--bs-body-color)',
                                opacity: 0.6,
                                fontSize: '0.875em'
                            }}>
                                {provider.category}
                            </span>
                        </div>
                    )}
                    filterOption={(option, input) => {
                        const searchInput = input.toLowerCase();
                        return (
                            option.data.name.toLowerCase().includes(searchInput) ||
                            (option.data.category && option.data.category.toLowerCase().includes(searchInput))
                        );
                    }}
                    styles={{
                        control: (base) => ({
                            ...base,
                            backgroundColor: 'var(--bs-body-bg)',
                            borderColor: validated && errors.paymentProviderId ? 'var(--bs-danger)' : 'var(--bs-border-color)',
                            '&:hover': {
                                borderColor: validated && errors.paymentProviderId ? 'var(--bs-danger)' : 'var(--bs-border-color)'
                            }
                        }),
                        input: (base) => ({
                            ...base,
                            color: 'var(--bs-body-color)'
                        }),
                        placeholder: (base) => ({
                            ...base,
                            color: 'var(--bs-body-color)',
                            opacity: 0.5
                        }),
                        option: (base, { isFocused }) => ({
                            ...base,
                            backgroundColor: isFocused ? 'var(--bs-primary)' : 'var(--bs-body-bg)',
                            color: isFocused ? 'white' : 'var(--bs-body-color)',
                            ':active': {
                                backgroundColor: 'var(--bs-primary)'
                            }
                        }),
                        menu: (base) => ({
                            ...base,
                            backgroundColor: 'var(--bs-body-bg)',
                            borderColor: 'var(--bs-border-color)'
                        }),
                        singleValue: (base) => ({
                            ...base,
                            color: 'var(--bs-body-color)'
                        })
                    }}
                />
                {validated && errors.paymentProviderId && (
                    <div className="text-danger small mt-1">{errors.paymentProviderId}</div>
                )}
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Payment Details</Form.Label>
                <Form.Control
                    type="text"
                    value={formData.paymentDetails || ''}
                    onChange={(e) => setFormData({ ...formData, paymentDetails: e.target.value })}
                    placeholder="Enter payment details (e.g., last 4 digits of card)"
                    style={{
                        backgroundColor: 'var(--bs-body-bg)',
                        color: 'var(--bs-body-color)',
                        borderColor: 'var(--bs-border-color)'
                    }}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add any notes about this subscription..."
                    style={{
                        backgroundColor: 'var(--bs-body-bg)',
                        color: 'var(--bs-body-color)',
                        borderColor: 'var(--bs-border-color)'
                    }}
                />
            </Form.Group>

            {/* Update parent components to receive isValid state */}
            <div style={{ display: 'none' }}>
                <input
                    type="submit"
                    ref={ref}
                    disabled={!isValid}
                />
            </div>
        </Form>
    );
});

export default SubscriptionForm;