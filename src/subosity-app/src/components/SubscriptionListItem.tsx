import React from 'react';
import { Badge, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faRotate, faHand } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from '../types';

interface Props {
    subscription: Subscription;
    onEdit: (subscription: Subscription) => void;
    onDelete: (subscription: Subscription) => void;
}

const SubscriptionListItem: React.FC<Props> = ({ subscription, onEdit, onDelete }) => (
    <div className="d-flex align-items-center p-3 border-bottom"
        style={{
            backgroundColor: 'var(--bs-body-bg)',
            color: 'var(--bs-body-color)',
            borderColor: 'var(--bs-border-color) !important'
        }}>
        <div className="rounded-circle bg-light d-flex align-items-center justify-content-center p-1 me-3"
            style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'var(--bs-white)'
            }}>
            <img
                src={subscription.providerIcon}
                alt={subscription.providerName}
                style={{
                    width: '32px',
                    height: '32px',
                    objectFit: 'contain'
                }}
            />
        </div>
        <div className="flex-grow-1">
            <div className="d-flex align-items-center">
                <h6 className="mb-0 me-2" style={{ color: 'var(--bs-body-color)' }}>
                    {subscription.name}
                </h6>
                <Badge bg={subscription.autoRenewal ? 'success' : 'secondary'}>
                    <FontAwesomeIcon
                        icon={subscription.autoRenewal ? faRotate : faHand}
                        className="me-2"
                    />
                    {subscription.autoRenewal ? 'Auto-Renewal' : 'Manual Renewal'}
                </Badge>
                <span className="ms-2" style={{ color: 'var(--bs-body-color)' }}>
                Renews: <strong>{subscription.renewalFrequency} @ ${subscription.amount.toFixed(2)}</strong>
                </span>
            </div>
            <div className="d-flex align-items-center" style={{ color: 'var(--bs-body-color)', fontSize: '.85em' }}>
                <div className="rounded bg-light d-flex align-items-center justify-content-center p-1 me-2" 
                     style={{ backgroundColor: 'var(--bs-white)' }}>
                    <img
                        src={subscription.paymentProviderIcon}
                        style={{ height: '16px', width: 'auto' }}
                        alt={`${subscription.paymentProviderName} icon`}
                    />
                </div>
                {subscription.paymentDetails}
            </div>
        </div>
        <div>
            <Button variant="link" className="p-0 me-2"
                style={{ color: 'var(--bs-body-color)' }}
                onClick={() => onEdit(subscription)}>
                <FontAwesomeIcon icon={faEdit} />
            </Button>
            <Button variant="link" className="p-0 text-danger"
                onClick={() => onDelete(subscription)}>
                <FontAwesomeIcon icon={faTrash} />
            </Button>
        </div>
    </div>
);

export default SubscriptionListItem;