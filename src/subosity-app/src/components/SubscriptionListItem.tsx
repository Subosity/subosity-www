import React, { useState, useEffect } from 'react';
import { Badge, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faRotate, faHand, faBell, faCheckCircle, faClock } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from '../types';
import { useAlerts } from '../AlertsContext';
import { useNavigate } from 'react-router-dom';

interface Props {
    subscription: Subscription;
    onEdit: (subscription: Subscription) => void;
    onDelete: (subscription: Subscription) => void;
}

const SubscriptionListItem: React.FC<Props> = ({ subscription, onEdit, onDelete }) => {
    const navigate = useNavigate();
    const [alertCount, setAlertCount] = useState(0);
    const { getUnreadCountForSubscription } = useAlerts();

    const handleItemClick = (e: React.MouseEvent) => {
        // Prevent navigation if clicking on action buttons
        const target = e.target as HTMLElement;
        if (target.closest('button')) return;

        navigate(`/subscription/${subscription.id}`);
    };

    useEffect(() => {
        const fetchAlertCount = async () => {
            const count = await getUnreadCountForSubscription(subscription.id);
            setAlertCount(count);
        };
        fetchAlertCount();
    }, [subscription.id]);

    return (
        <div
            className="d-flex align-items-center p-3 border-bottom"
            style={{
                backgroundColor: 'var(--bs-body-bg)',
                color: 'var(--bs-body-color)',
                borderColor: 'var(--bs-border-color) !important',
                cursor: 'pointer'  // Add cursor pointer
            }}
            onClick={handleItemClick}  // Add click handler
        >
            <div className="rounded-circle bg-light d-flex align-items-center justify-content-center p-1"
                style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: 'var(--bs-white)',
                    flexShrink: 0,
                    overflow: 'hidden' // Add this to clip overflow
                }}>
                <img
                    src={subscription.providerIcon}
                    alt={subscription.providerName}
                    style={{
                        width: '100%',    // Change to percentage
                        height: '100%',   // Change to percentage
                        objectFit: 'contain',
                        padding: '4px'    // Add padding to prevent touching edges
                    }}
                />
            </div>
            <div className="row w-100 align-items-start">
                {/* Provider Info */}
                <div className="col-12 col-md-5 mb-2 mb-md-0">
                    <div className="d-flex flex-column min-width-0">
                        {/* Provider Name and Description/Nickname */}
                        <div className="d-flex align-items-center mb-2 w-100">
                            <div className="d-flex align-items-center w-100 overflow-hidden">
                                <h6 className="mb-0 me-2 text-truncate" style={{ color: 'var(--bs-body-color)' }}>
                                    {subscription.providerName}
                                </h6>
                                {subscription.nickname ? (
                                    <div className="small mb-0 text-truncate" style={{
                                        color: 'var(--bs-body-color)',
                                        opacity: 0.75
                                    }}>
                                        <i>({subscription.nickname})</i>
                                    </div>
                                ) : (
                                    <div className="small mb-0 text-truncate" style={{
                                        color: 'var(--bs-body-color)',
                                        opacity: 0.75
                                    }}>
                                        {subscription.providerDescription}
                                    </div>
                                )}
                                <div className="d-flex align-items-center">
                                    <Badge bg={subscription.isActive ? 'success' : 'secondary'} className="ms-2">
                                        <FontAwesomeIcon
                                            icon={subscription.isActive ? faCheckCircle : faClock}
                                            className="me-1"
                                        />
                                        {subscription.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Renewal Info */}
                        <div className="d-flex align-items-center gap-2">
                            <Badge bg={subscription.autoRenewal ? 'success' : 'secondary'} className="flex-shrink-0">
                                <FontAwesomeIcon icon={subscription.autoRenewal ? faRotate : faHand} className="me-2" />
                                {subscription.autoRenewal ? 'Auto-Renewal' : 'Manual Renewal'}
                            </Badge>
                            <div className="text-truncate" style={{ color: 'var(--bs-body-color)', fontSize: '.85em' }}>
                                Renews: <strong>{subscription.renewalFrequency} @ ${subscription.amount.toFixed(2)}</strong>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Info with truncation */}
                <div className="col-9 col-md-4 mb-2 mb-md-0">
                    <div className="d-flex align-items-center min-width-0">
                        <div className="rounded bg-light d-flex align-items-center justify-content-center p-1 me-2 flex-shrink-0"
                            style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                            <img
                                src={subscription.paymentProviderIcon}
                                style={{ height: 'auto', width: '22px' }}
                                alt={`${subscription.paymentProviderName} icon`}
                            />
                        </div>
                        <div className="text-truncate">
                            {subscription.paymentDetails}
                        </div>
                    </div>
                </div>

                {/* Actions - Always Right */}
                <div className="col-3 text-end">
                    <div className="d-flex align-items-center justify-content-end gap-3">
                        <div className="position-relative">
                            <FontAwesomeIcon
                                icon={faBell}
                                className={alertCount > 0 ? "text-warning" : "text-secondary"}
                            />
                            {alertCount > 0 && (
                                <span
                                    className="position-absolute badge rounded-pill bg-danger d-flex align-items-center justify-content-center"
                                    style={{
                                        fontSize: '0.75em',
                                        padding: '0.25em',
                                        minWidth: '1.5em',
                                        height: '1.5em',
                                        transform: 'scale(0.8) translate(50%, -50%)',
                                        top: '0',
                                        right: '0'
                                    }}
                                >
                                    {alertCount}
                                </span>
                            )}
                        </div>
                        <Button
                            variant="link"
                            className="p-0"
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
        </div>
    );
};

export default SubscriptionListItem;