import React from 'react';
import { Offcanvas, Button } from 'react-bootstrap';
import { Subscription } from '../types';

interface Props {
    show: boolean;
    onHide: () => void;
    subscription: Subscription | null;
    onDelete: (subscription: Subscription) => void;
}

const DeleteSubscriptionModal: React.FC<Props> = ({ show, onHide, subscription, onDelete }) => (
    <Offcanvas show={show} onHide={onHide} placement="end">
        <Offcanvas.Header closeButton>
            <Offcanvas.Title>Delete Subscription</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
            <p>Are you sure you want to delete {subscription?.name}?</p>
            <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={onHide}>
                    Cancel
                </Button>
                <Button 
                    variant="danger" 
                    onClick={() => {
                        if (subscription) onDelete(subscription);
                        onHide();
                    }}
                >
                    Delete
                </Button>
            </div>
        </Offcanvas.Body>
    </Offcanvas>
);

export default DeleteSubscriptionModal;