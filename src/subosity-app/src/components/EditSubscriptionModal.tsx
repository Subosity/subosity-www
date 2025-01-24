import React from 'react';
import { Offcanvas } from 'react-bootstrap';
import { Subscription } from '../types';
import SubscriptionForm from './SubscriptionForm';

interface Props {
    show: boolean;
    onHide: () => void;
    subscription: Subscription | null;
    onSubmit: (data: Partial<Subscription>) => void;
}

const EditSubscriptionModal: React.FC<Props> = ({ show, onHide, subscription, onSubmit }) => (
    <Offcanvas show={show} onHide={onHide} placement="end">
        <Offcanvas.Header closeButton>
            <Offcanvas.Title>Edit Subscription</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
            <SubscriptionForm
                subscription={subscription || undefined}
                onSubmit={onSubmit}
                onCancel={onHide}
            />
        </Offcanvas.Body>
    </Offcanvas>
);

export default EditSubscriptionModal;