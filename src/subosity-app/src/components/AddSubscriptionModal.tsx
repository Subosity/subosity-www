import React from 'react';
import { Offcanvas } from 'react-bootstrap';
import { Subscription } from '../types';
import SubscriptionForm from './SubscriptionForm';

interface Props {
    show: boolean;
    onHide: () => void;
    onSubmit: (data: Partial<Subscription>) => void;
}

const AddSubscriptionModal: React.FC<Props> = ({ show, onHide, onSubmit }) => (
    <Offcanvas show={show} onHide={onHide} placement="end">
        <Offcanvas.Header closeButton>
            <Offcanvas.Title>Add New Subscription</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
            <SubscriptionForm
                onSubmit={onSubmit}
                onCancel={onHide}
            />
        </Offcanvas.Body>
    </Offcanvas>
);

export default AddSubscriptionModal;