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

// Update ValidationErrors interface
interface ValidationErrors {
    providerId?: string;
    amount?: string;
    paymentProviderId?: string;
    // Remove startDate
}

const commonInputStyles = {
    backgroundColor: 'var(--bs-body-bg)',
    color: 'var(--bs-body-color)',
    borderColor: 'var(--bs-border-color)'
};

const commonPlaceholderStyles = {
    opacity: 0.5,
    color: 'var(--bs-body-color)'
};

const selectStyles = {
    control: (base: any) => ({
        ...base,
        ...commonInputStyles
    }),
    input: (base: any) => ({
        ...base,
        color: 'var(--bs-body-color)'
    }),
    placeholder: (base: any) => ({
        ...base,
        ...commonPlaceholderStyles
    }),
    option: (base: any) => ({
        ...base,
        backgroundColor: 'var(--bs-body-bg)',
        color: 'var(--bs-body-color)',
        ':hover': {
            backgroundColor: 'var(--bs-primary)',
            color: 'white'
        }
    }),
    menu: (base: any) => ({
        ...base,
        backgroundColor: 'var(--bs-body-bg)',
        borderColor: 'var(--bs-border-color)'
    }),
    singleValue: (base: any) => ({
        ...base,
        color: 'var(--bs-body-color)'
    })
};

interface TouchedFields {
    [key: string]: boolean;
}

const SubscriptionForm = forwardRef<SubscriptionFormRef, Props>(({ subscription, onSubmit, onCancel }, ref) => {
    // Add touched state
    const [touched, setTouched] = useState<TouchedFields>({});
    
    const [providers, setProviders] = useState<any[]>([]);
    const [paymentProviders, setPaymentProviders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Subscription>>({
        providerId: subscription?.providerId || '',
        nickname: subscription?.nickname || '',  // Verify this line exists
        startDate: subscription?.startDate || '',
        autoRenewal: subscription?.autoRenewal || false,
        renewalFrequency: subscription?.renewalFrequency || 'monthly',
        amount: subscription?.amount || 0,
        paymentProviderId: subscription?.paymentProviderId || '',
        paymentDetails: subscription?.paymentDetails || '',
        notes: subscription?.notes || '',
        isFreeTrial: subscription?.isFreeTrial || false
    });

    const [isValid, setIsValid] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [validated, setValidated] = useState(false);

    // Update validateForm function
    const validateForm = (data: Partial<Subscription>): ValidationErrors => {
        const newErrors: ValidationErrors = {};
        
        if (!data.providerId) {
            newErrors.providerId = 'Please select a provider';
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

    // Update handleSubmit function
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidated(true);
        const newErrors = validateForm(formData);
        setErrors(newErrors);
        
        if (Object.keys(newErrors).length === 0) {
            // Transform empty date string to null before submitting
            const submissionData = {
                ...formData,
                startDate: formData.startDate || null
            };
            onSubmit(submissionData);
        }
    };

    const handleFieldTouch = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    // Update useImperativeHandle
    useImperativeHandle(ref, () => ({
        submitForm: () => {
            setValidated(true);
            if (isValid) {
                const submissionData = {
                    ...formData,
                    startDate: formData.startDate || null
                };
                onSubmit(submissionData);
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
                    styles={selectStyles}
                />
                {validated && errors.providerId && (
                    <div className="text-danger small mt-1">{errors.providerId}</div>
                )}
            </Form.Group>

            {/* Update Start Date field */}
            <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                    type="date"
                    value={formData.startDate || ''}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    placeholder="Select start date"
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>
                    Amount per Period <span className="text-danger">*</span>
                </Form.Label>
                <InputGroup hasValidation>
                    <InputGroup.Text style={commonInputStyles}>
                        $
                    </InputGroup.Text>
                    <Form.Control
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                        required
                        isInvalid={validated && (!formData.amount || formData.amount <= 0)}
                        style={{
                            ...commonInputStyles,
                            '::placeholder': commonPlaceholderStyles
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
                    styles={selectStyles}
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
                        setFormData(prev => ({
                            ...prev,
                            paymentProviderId: option?.id || '',
                            // Only set paymentDetails if it's empty
                            paymentDetails: !prev.paymentDetails ? option?.name || '' : prev.paymentDetails
                        }));
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
                                <div className="rounded d-flex align-items-center justify-content-center p-1"
                                     style={{ 
                                         width: '32px', 
                                         height: '32px',
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
                                fontSize: '0.875em',
                                opacity: 0.6
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
                    styles={selectStyles}
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
                    placeholder="Optional: Enter payment details (e.g., last 4 digits of card)"
                    style={{
                        backgroundColor: 'var(--bs-body-bg)',
                        color: 'var(--bs-body-color)',
                        borderColor: 'var(--bs-border-color)',
                        '::placeholder': {
                            color: 'var(--bs-body-color)',
                            opacity: 0.5
                        }
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
                    placeholder="Optional: Add any notes about this subscription..."
                    style={{
                        backgroundColor: 'var(--bs-body-bg)',
                        color: 'var(--bs-body-color)',
                        borderColor: 'var(--bs-border-color)',
                        '::placeholder': {
                            color: 'var(--bs-body-color)',
                            opacity: 0.5
                        }
                    }}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Nickname</Form.Label>
                <Form.Control
                    type="text"
                    value={formData.nickname || ''}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    placeholder="Optional: Distinguish between subscriptions (e.g., 'Personal', 'Family')"
                    style={{
                        backgroundColor: 'var(--bs-body-bg)',
                        color: 'var(--bs-body-color)',
                        borderColor: 'var(--bs-border-color)',
                        '::placeholder': {
                            color: 'var(--bs-body-color)',
                            opacity: 0.5
                        }
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