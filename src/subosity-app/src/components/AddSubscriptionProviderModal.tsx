// src/subosity-app/src/components/AddSubscriptionProviderModal.tsx
import React from 'react';
import { Offcanvas, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faSave, faPlus } from '@fortawesome/free-solid-svg-icons';

interface Props {
    show: boolean;
    onHide: () => void;
    onSave: (data: any) => void;
}

const AddSubscriptionProviderModal: React.FC<Props> = ({ show, onHide, onSave }) => {
    return (
        <Offcanvas show={show} onHide={onHide} placement="end">
            <Offcanvas.Header closeButton style={{ backgroundColor: 'var(--bs-navbar-bg)', color: 'var(--bs-body-color)' }}>
                <div>
                    <Offcanvas.Title>
                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                        Add Subscription Provider
                    </Offcanvas.Title>
                    <div style={{ fontSize: '0.85em', opacity: 0.6 }}>
                        Add a new subscription provider to the system.
                    </div>
                </div>
            </Offcanvas.Header>
            <Offcanvas.Body>
                {/* Form will go here */}
            </Offcanvas.Body>
            <div className="p-3 border-top" style={{ backgroundColor: 'var(--bs-navbar-bg)' }}>
                <div className="d-flex justify-content-end">
                    <Button variant="secondary" className="me-2" onClick={onHide}>
                        <FontAwesomeIcon icon={faChevronLeft} className="me-2" />
                        Back
                    </Button>
                    <Button variant="primary">
                        <FontAwesomeIcon icon={faSave} className="me-2" />
                        Save Changes
                    </Button>
                </div>
            </div>
        </Offcanvas>
    );
};

export default AddSubscriptionProviderModal;