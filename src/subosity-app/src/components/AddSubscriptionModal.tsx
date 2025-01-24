import React from 'react';
import { Offcanvas } from 'react-bootstrap';
import { Subscription } from '../types';
import SubscriptionForm from './SubscriptionForm';
import { supabase } from '../supabaseClient';
import { useToast } from '../ToastContext';

interface Props {
    show: boolean;
    onHide: () => void;
    onSubmit: (data: Partial<Subscription>) => void;
}

const AddSubscriptionModal: React.FC<Props> = ({ show, onHide, onSubmit }) => {
    const { addToast } = useToast();

    const handleSubmit = async (data: Partial<Subscription>) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No authenticated user');

            const { error } = await supabase
                .from('subscription')
                .insert([{
                    owner: user.id,
                    subscription_provider_id: data.providerId,
                    start_date: data.startDate,
                    autorenew: data.autoRenewal,
                    renew_frequency: data.renewalFrequency,
                    amount: data.amount,
                    payment_provider_id: data.paymentProviderId,
                    payment_details: data.paymentDetails,
                    notes: data.notes,
                    is_free_trial: data.isFreeTrial || false
                }]);

            if (error) throw error;

            addToast('Subscription added successfully', 'success');
            onSubmit(data);
            onHide();
        } catch (error) {
            addToast('Failed to add subscription', 'error');
            console.error('Error:', error);
        }
    };

    return (
        <Offcanvas show={show} onHide={onHide} placement="end">
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>Add New Subscription</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <SubscriptionForm onSubmit={handleSubmit} onCancel={onHide} />
            </Offcanvas.Body>
        </Offcanvas>
    );
};

export default AddSubscriptionModal;