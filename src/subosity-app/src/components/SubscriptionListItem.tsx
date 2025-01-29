import React, { useState, useEffect, useRef } from 'react';
import { Badge, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faRotate, faHand, faBell, faCheckCircle, faClock, faBan } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from '../types';
import { useAlerts } from '../AlertsContext';
import { useNavigate } from 'react-router-dom';
import SubscriptionStateDisplay from './SubscriptionStateDisplay';

interface Props {
    subscription: Subscription;
    onEdit: (subscription: Subscription) => void;
    onDelete: (subscription: Subscription) => void;
}

const SubscriptionListItem: React.FC<Props> = ({ subscription, onEdit, onDelete }) => {
    const navigate = useNavigate();
    const [alertCount, setAlertCount] = useState(0);
    const { getUnreadCountForSubscription } = useAlerts();
    const [containerWidth, setContainerWidth] = useState(0);
    const detailsRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        if (!detailsRef.current) return;
        
        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                setContainerWidth(entry.contentRect.width);
            }
        });

        resizeObserver.observe(detailsRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    return (
        <div
            className="d-flex align-items-center p-3 border-bottom shadow"
            style={{
                backgroundColor: 'var(--bs-body-bg)',
                color: 'var(--bs-body-color)',
                borderColor: 'var(--bs-border-color) !important',
                cursor: 'pointer'
            }}
            onClick={handleItemClick}
        >
            {/* Column 1: Logo */}
            <div style={{ width: '40px', flexShrink: 0 }} className="me-3">
                <div className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                    style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: 'var(--bs-white)',
                        overflow: 'hidden'
                    }}>
                    <img
                        src={subscription.providerIcon}
                        alt={subscription.providerName}
                        style={{
                            width: '150%',
                            height: '150%',
                            objectFit: 'contain',
                            padding: '4px'
                        }}
                    />
                </div>
            </div>

            {/* Column 2: Subscription Details */}
            <div className="flex-grow-1 min-width-0" ref={detailsRef}> {/* Remove me-3 */}
                {/* Provider Name + Nickname */}
                <div className="d-flex align-items-baseline min-width-0 pe-2"> {/* Add pe-2 for small buffer */}
                    <span className="fw-medium text-truncate">
                        {subscription.providerName}
                    </span>
                    {subscription.nickname && (
                        <span className="ms-1 text-body-secondary text-truncate" 
                            style={{ 
                                fontSize: '0.75em',
                                maxWidth: `${Math.max(containerWidth * 0.5, 60)}px`,
                                flexShrink: 1
                            }}>
                            ({subscription.nickname})
                        </span>
                    )}
                </div>

                {/* Description - Debug subscription object */}
                {subscription.providerDescription && (
                    <div className="text-body-secondary text-truncate mb-1 d-none d-md-block " 
                        style={{ 
                            fontSize: '0.85em',
                        }}>
                        {subscription.providerDescription}
                    </div>
                )}

                {/* Renewal and Amount Info */}
                <div className="d-flex align-items-center gap-2 mt-1" style={{ fontSize: '0.85em' }}>
                    <Badge 
                        bg={subscription.autoRenewal ? 'success' : 'secondary'} 
                        className="text-truncate"
                        style={{ minWidth: '6.5em' }}
                    >
                        <FontAwesomeIcon 
                            icon={subscription.autoRenewal ? faRotate : faHand} 
                            className="me-1"
                        />
                        {subscription.renewalFrequency}
                    </Badge>
                    <span className="text-truncate">${subscription.amount.toFixed(2)}</span>
                </div>
            </div>

            {/* Column 3: Payment Method - Right aligned */}
            <div className="d-flex flex-column align-items-end ps-2" 
                style={{ minWidth: '32px', flexShrink: 1 }}> {/* Add ps-2 */}
                <div className="rounded bg-light d-flex align-items-center justify-content-center mb-1"
                    style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: 'var(--bs-white)'
                    }}>
                    <img
                        src={subscription.paymentProviderIcon}
                        alt={subscription.paymentProviderName}
                        style={{
                            width: '24px',
                            height: '24px',
                            objectFit: 'contain'
                        }}
                    />
                </div>
                <span className="d-none d-md-block text-body-secondary text-end nowrap" 
                    style={{ fontSize: '0.75em', width: '100%' }}>
                    {subscription.paymentDetails}
                </span>
            </div>

            {/* Column 4: Actions and Status */}
            <div className="d-flex flex-column align-items-end" 
                style={{ width: '90px', flexShrink: 0 }}>
                <div className="d-flex align-items-center gap-2 mb-1">
                    <div className="position-relative">
                        <FontAwesomeIcon
                            icon={faBell}
                            className={alertCount > 0 ? "text-warning" : "text-secondary"}
                        />
                        {alertCount > 0 && (
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                                style={{ fontSize: '0.65em', transform: 'scale(0.8)' }}>
                                {alertCount}
                            </span>
                        )}
                    </div>
                    <Button variant="link" className="p-0" onClick={() => onEdit(subscription)}>
                        <FontAwesomeIcon icon={faEdit} />
                    </Button>
                    <Button variant="link" className="p-0 text-danger" onClick={() => onDelete(subscription)}>
                        <FontAwesomeIcon icon={faTrash} />
                    </Button>
                </div>
                <SubscriptionStateDisplay state={subscription.state} />
            </div>
        </div>
    );
};

export default SubscriptionListItem;