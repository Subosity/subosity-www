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
        <div className="row w-100 align-items-start">
            {/* Provider Info */}
            <div className="col-12 col-md-5 mb-2 mb-md-0">
                <div className="d-flex flex-column">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                        <div className="d-flex align-items-center">
                            <h6 className="mb-0 me-2 d-flex align-items-center" style={{ color: 'var(--bs-body-color)' }}>
                                {subscription.providerName}
                            </h6>
                            {subscription.nickname ? (
                                <div className="small mb-1 d-flex align-items-center" style={{ 
                                    color: 'var(--bs-body-color)',
                                    opacity: 0.75 
                                }}>
                                    <i>({subscription.nickname})</i>
                                </div>
                            ) : (
                                <div className="small mb-1 d-flex align-items-center" style={{ 
                                    color: 'var(--bs-body-color)',
                                    opacity: 0.75 
                                }}>
                                    {subscription.providerDescription}
                                </div>
                            )}
                        </div>

                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <Badge bg={subscription.autoRenewal ? 'success' : 'secondary'}>
                            <FontAwesomeIcon
                                icon={subscription.autoRenewal ? faRotate : faHand}
                                className="me-2"
                            />
                            {subscription.autoRenewal ? 'Auto-Renewal' : 'Manual Renewal'}
                        </Badge>
                        <div style={{ color: 'var(--bs-body-color)', fontSize: '.85em' }}>
                            Renews: <strong>{subscription.renewalFrequency} @ ${subscription.amount.toFixed(2)}</strong>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Info */}
            <div className="col-9 col-md-4 mb-2 mb-md-0">
                <div className="d-flex align-items-center">
                    <div className="rounded bg-light d-flex align-items-center justify-content-center p-1 me-2"
                         style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                        <img
                            src={subscription.paymentProviderIcon}
                            style={{ height: 'auto', width: '22px' }}
                            alt={`${subscription.paymentProviderName} icon`}
                        />
                    </div>
                    <span style={{ color: 'var(--bs-body-color)', fontSize: '.85em' }}>
                        {subscription.paymentDetails}
                    </span>
                </div>
            </div>

            {/* Actions - Always Right */}
            <div className="col-3 text-end">
                <Button
                    variant="link"
                    className="p-0 me-3"
                    onClick={() => onEdit(subscription)}
                >
                    <FontAwesomeIcon icon={faEdit} />
                </Button>
                <Button
                    variant="link"
                    className="p-0 text-danger"
                    onClick={() => onDelete(subscription)}
                >
                    <FontAwesomeIcon icon={faTrash} />
                </Button>
            </div>
        </div>
    </div>
);

export default SubscriptionListItem;