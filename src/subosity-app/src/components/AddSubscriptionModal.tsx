import React, { useRef } from 'react';
import { Offcanvas, Button } from 'react-bootstrap';
import { Subscription } from '../types';
import SubscriptionForm, { SubscriptionFormRef } from './SubscriptionForm';
import { supabase } from '../supabaseClient';
import { useToast } from '../ToastContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faSave, faSquarePlus } from '@fortawesome/free-solid-svg-icons';

interface Props {
    show: boolean;
    onHide: () => void;
    onSubmit: (data: Partial<Subscription>) => void;
}

const AddSubscriptionModal: React.FC<Props> = ({ show, onHide, onSubmit }) => {
    const { addToast } = useToast();
    const formRef = useRef<SubscriptionFormRef>(null);

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
            <Offcanvas.Header closeButton style={{ backgroundColor: 'var(--bs-navbar-bg)', color: 'var(--bs-body-color)' }}>
                <div>
                    <Offcanvas.Title>
                        <FontAwesomeIcon icon={faSquarePlus} className="me-2" />
                        Add Subscription
                    </Offcanvas.Title>
                    <div style={{ fontSize: '0.85em', opacity: 0.6 }}>
                        Add a new subscription to start tracking.
                    </div>
                </div>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <SubscriptionForm 
                    ref={formRef} 
                    onSubmit={handleSubmit} 
                    onCancel={onHide} 
                />
            </Offcanvas.Body>
            <div className="p-3 border-top" style={{ backgroundColor: 'var(--bs-navbar-bg)', color: 'var(--bs-body-color)' }}>
                <div className="d-flex justify-content-end">
                    <Button variant="secondary" className="me-2" onClick={onHide}>
                        <FontAwesomeIcon icon={faChevronLeft} className="me-2" />
                        Back
                    </Button>
                    <Button variant="primary" onClick={() => formRef.current?.submitForm()}>
                        <FontAwesomeIcon icon={faSave} className="me-2" />
                        Save Changes
                    </Button>
                </div>
            </div>
        </Offcanvas>
    );
};

export default AddSubscriptionModal;