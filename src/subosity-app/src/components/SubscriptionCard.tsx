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
            <div className="d-flex justify-content-between align-items-start w-100">
                <div className="d-flex align-items-center me-3" style={{ minWidth: 0, flex: '1 1 auto' }}>
                    <div className="rounded-circle bg-light d-flex align-items-center justify-content-center p-1" 
                         style={{ 
                             width: '48px', 
                             height: '48px',
                             backgroundColor: 'var(--bs-white)',
                             flexShrink: 0
                         }}>
                        <img 
                            src={subscription.providerIcon}
                            alt={subscription.providerName}
                            style={{ 
                                width: '40px', 
                                height: '40px', 
                                objectFit: 'contain'
                            }}
                        />
                    </div>
                    <div className="ms-3" style={{ minWidth: 0, flex: '1 1 auto' }}>
                        <h5 className="mb-1 text-truncate" style={{ color: 'var(--bs-body-color)' }}>
                            {subscription.providerName}
                        </h5>
                        {subscription.nickname ? (
                            <div className="small mb-1 text-truncate" 
                                 style={{ 
                                     color: 'var(--bs-body-color)',
                                     opacity: 0.75
                                 }}>
                                <i>({subscription.nickname})</i>
                            </div>
                        ) : (
                            <div className="small mb-1 text-truncate" 
                                 style={{ 
                                     color: 'var(--bs-body-color)',
                                     opacity: 0.75
                                 }}>
                                {subscription.providerDescription}
                            </div>
                        )}
                        <div style={{ color: 'var(--bs-body-color)', fontSize: '.85em' }}>
                            Renews: <strong>{subscription.renewalFrequency} @ ${subscription.amount.toFixed(2)}</strong>
                        </div>
                    </div>
                </div>
                <div style={{ flexShrink: 0 }}>
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
                            style={{ height: 'auto', width: '22px' }} 
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