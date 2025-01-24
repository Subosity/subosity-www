import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faRotate, faHand } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from '../types';

interface Props {
    subscription: Subscription;
    onEdit: (subscription: Subscription) => void;
    onDelete: (subscription: Subscription) => void;
}

const SubscriptionCard: React.FC<Props> = ({ subscription, onEdit, onDelete }) => (
    <Card className="h-100 shadow-sm" style={{ 
        backgroundColor: 'var(--bs-body-bg)', 
        color: 'var(--bs-body-color)',
        borderColor: 'var(--bs-border-color)'
    }}>
        <Card.Body>
            <div className="d-flex justify-content-between align-items-start">
                <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-light d-flex align-items-center justify-content-center p-1" 
                         style={{ 
                             width: '48px', 
                             height: '48px',
                             backgroundColor: 'var(--bs-white)'
                         }}>
                        <img 
                            src={subscription.providerIcon} // Changed from subscription.icon
                            alt={subscription.providerName} // Changed from subscription.name
                            style={{ 
                                width: '40px', 
                                height: '40px', 
                                objectFit: 'contain'
                            }}
                        />
                    </div>
                    <div className="ms-3">
                        <h5 className="mb-1" style={{ color: 'var(--bs-body-color)' }}>
                            {subscription.name}
                        </h5>
                        <div style={{ color: 'var(--bs-body-color)', fontSize: '.85em' }}>
                            Renews: <strong>{subscription.renewalFrequency} @ ${subscription.amount.toFixed(2)}</strong>
                        </div>
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
            <div className="mt-3">
                <Badge bg={subscription.autoRenewal ? 'success' : 'secondary'}>
                    <FontAwesomeIcon 
                        icon={subscription.autoRenewal ? faRotate : faHand} 
                        className="me-2" 
                    />
                    {subscription.autoRenewal ? 'Auto-Renewal (' + subscription.renewalFrequency + ')' : 'Manual Renewal'}
                </Badge>
                <div className="mt-2 d-flex align-items-center" style={{ color: 'var(--bs-body-color)', fontSize: '.85em' }}>
                    <div className="rounded bg-light d-flex align-items-center justify-content-center p-1 me-2" 
                         style={{ backgroundColor: 'var(--bs-white)' }}>
                        <img 
                            src={subscription.paymentProviderIcon} // Changed from subscription.paymentIcon
                            style={{ height: '14px', width: 'auto' }} 
                            alt={`${subscription.paymentProviderName} icon`} // Added provider name
                        />
                    </div>
                    {subscription.paymentDetails}
                </div>
            </div>
        </Card.Body>
    </Card>
);

export default SubscriptionCard;