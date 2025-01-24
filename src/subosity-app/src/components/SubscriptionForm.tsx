import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { Subscription } from '../types';
import { supabase } from '../supabaseClient';

interface Props {
    subscription?: Subscription;
    onSubmit: (data: Partial<Subscription>) => void;
    onCancel: () => void;
}

const SubscriptionForm: React.FC<Props> = ({ subscription, onSubmit, onCancel }) => {
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

                // Get user's auth session
                const { data: { user } } = await supabase.auth.getUser();

                // Get providers - both public and user owned
                const { data: subscriptionProviders, error: subError } = await supabase
                    .from('subscription_provider')
                    .select('*');

                if (subError) throw subError;

                // Get payment providers - both public and user owned
                const { data: paymentMethods, error: payError } = await supabase
                    .from('payment_provider')
                    .select('*');

                if (payError) throw payError;

                setProviders(subscriptionProviders || []);
                setPaymentProviders(paymentMethods || []);
            } catch (err) {
                console.error('Error fetching providers:', err);
                setError('Failed to load providers');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProviders();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Create a copy of form data and handle empty date
        const submissionData = {
            ...formData,
            startDate: formData.startDate || null // Convert empty string to null
        };
        
        onSubmit(submissionData);
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
                <Form.Label>Provider</Form.Label>
                <Form.Select
                    value={formData.providerId}
                    onChange={(e) => setFormData({ ...formData, providerId: e.target.value })}
                    required
                >
                    <option value="">Select a provider...</option>
                    {providers.map(provider => (
                        <option key={provider.id} value={provider.id}>
                            {provider.name}
                        </option>
                    ))}
                </Form.Select>
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
                <Form.Select
                    value={formData.paymentProviderId}
                    onChange={(e) => setFormData({ ...formData, paymentProviderId: e.target.value })}
                    required
                >
                    <option value="">Select payment method...</option>
                    {paymentProviders.map(provider => (
                        <option key={provider.id} value={provider.id}>
                            {provider.name}
                        </option>
                    ))}
                </Form.Select>
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

            <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={onCancel}>
                    Cancel
                </Button>
                <Button variant="primary" type="submit">
                    {subscription ? 'Update' : 'Add'} Subscription
                </Button>
            </div>
        </Form>
    );
};

export default SubscriptionForm;