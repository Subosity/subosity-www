import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Badge, ListGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faEdit, 
    faTrash, 
    faRotate, 
    faHand,
    faArrowLeft,
    faLink,
    faBell,
    faClock,
    faCheck,
    faCircleInfo,
    faTriangleExclamation,
    faCircleExclamation
} from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../supabaseClient';
import { useToast } from '../ToastContext';
import { Subscription, SubscriptionAlert } from '../types';
import EditSubscriptionModal from '../components/EditSubscriptionModal';
import DeleteSubscriptionModal from '../components/DeleteSubscriptionModal';
import SubscriptionAlertList from '../components/SubscriptionAlertList';

const getSeverityIcon = (severity: string) => {
    switch (severity) {
        case 'danger':
            return faCircleExclamation;
        case 'warning':
            return faTriangleExclamation;
        case 'info':
        default:
            return faCircleInfo;
    }
};

const getSeverityColor = (severity: string) => {
    switch (severity) {
        case 'danger':
            return 'var(--bs-danger)';
        case 'warning':
            return 'var(--bs-warning)';
        case 'info':
        default:
            return 'var(--bs-info)';
    }
};

const SubscriptionDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [alerts, setAlerts] = useState<SubscriptionAlert[]>([]);
    const [alertsLoading, setAlertsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchSubscription();
            fetchAlerts();
        }
    }, [id]);

    const fetchSubscription = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('subscription')
                .select(`
                    *,
                    subscription_provider:subscription_provider_id(
                        id,
                        name,
                        description,
                        category,
                        icon,
                        website,
                        unsubscribe_url
                    ),
                    payment_provider:payment_provider_id(
                        id,
                        name,
                        icon
                    )
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            
            setSubscription({
                id: data.id,
                providerId: data.subscription_provider_id,
                providerName: data.subscription_provider.name,
                providerDescription: data.subscription_provider.description,
                providerCategory: data.subscription_provider.category,
                providerIcon: data.subscription_provider.icon,
                providerWebsiteUrl: data.subscription_provider.website_url,
                providerUnsubscribeUrl: data.subscription_provider.unsubscribe_url,
                nickname: data.nickname,
                startDate: data.start_date,
                renewalFrequency: data.renew_frequency,
                autoRenewal: data.autorenew,
                amount: data.amount,
                paymentProviderId: data.payment_provider_id,
                paymentProviderName: data.payment_provider.name,
                paymentProviderIcon: data.payment_provider.icon,
                paymentDetails: data.payment_details,
                notes: data.notes,
                isFreeTrial: data.is_free_trial
            });
        } catch (error) {
            console.error('Error fetching subscription:', error);
            addToast('Error loading subscription details', 'error');
            navigate('/mysubscriptions');
        } finally {
            setLoading(false);
        }
    };

    const fetchAlerts = async () => {
        try {
            setAlertsLoading(true);
            const { data, error } = await supabase
                .from('subscription_alerts')
                .select(`
                    *,
                    subscription:subscription_id (
                        subscription_provider (
                            name,
                            icon
                        )
                    )
                `)
                .eq('subscription_id', id)
                .is('read_at', null)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAlerts(data || []);
        } catch (error) {
            console.error('Error fetching alerts:', error);
            addToast('Failed to load alerts', 'error');
        } finally {
            setAlertsLoading(false);
        }
    };

    const handleDismiss = async (alertId: string) => {
        try {
            const { error } = await supabase
                .from('subscription_alerts')
                .update({ read_at: new Date().toISOString() })
                .eq('id', alertId);

            if (error) throw error;
            await fetchAlerts();
            addToast('Alert dismissed', 'success');
        } catch (error) {
            console.error('Error dismissing alert:', error);
            addToast('Failed to dismiss alert', 'error');
        }
    };

    const handleSnooze = async (alertId: string) => {
        try {
            const alert = alerts.find(a => a.id === alertId);
            if (!alert) return;

            const { error: insertError } = await supabase
                .from('subscription_alerts')
                .insert([{
                    subscription_id: alert.subscription_id,
                    title: alert.title,
                    description: alert.description,
                    severity: alert.severity,
                    sent_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                }]);

            if (insertError) throw insertError;

            const { error: updateError } = await supabase
                .from('subscription_alerts')
                .update({ read_at: new Date().toISOString() })
                .eq('id', alertId);

            if (updateError) throw updateError;

            await fetchAlerts();
            addToast('Alert snoozed for 24 hours', 'success');
        } catch (error) {
            console.error('Error snoozing alert:', error);
            addToast('Failed to snooze alert', 'error');
        }
    };

    return (
        <Container className="py-4">
            <div className="mb-4">
                <Button variant="link" className="px-0" onClick={() => navigate('/mysubscriptions')}>
                    <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                    Back to Subscriptions
                </Button>
            </div>

            {loading ? (
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : subscription && (
                <Card style={{ 
                    backgroundColor: 'var(--bs-body-bg)', 
                    color: 'var(--bs-body-color)',
                    borderColor: 'var(--bs-border-color)'
                }}>
                    <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-4">
                            <div className="d-flex">
                                <div className="rounded-circle bg-light d-flex align-items-center justify-content-center p-2 me-3">
                                    <img 
                                        src={subscription.providerIcon}
                                        alt={subscription.providerName}
                                        style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                                    />
                                </div>
                                <div>
                                    <h3 className="mb-1">{subscription.providerName}</h3>
                                    {subscription.nickname && (
                                        <div className="text-muted mb-2">({subscription.nickname})</div>
                                    )}
                                    <Badge bg={subscription.autoRenewal ? 'success' : 'secondary'}>
                                        <FontAwesomeIcon 
                                            icon={subscription.autoRenewal ? faRotate : faHand} 
                                            className="me-2"
                                        />
                                        {subscription.autoRenewal ? 'Auto-Renewal' : 'Manual Renewal'}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <Button variant="outline-primary" className="me-2" onClick={() => setShowEdit(true)}>
                                    <FontAwesomeIcon icon={faEdit} className="me-2" />
                                    Edit
                                </Button>
                                <Button variant="outline-danger" onClick={() => setShowDelete(true)}>
                                    <FontAwesomeIcon icon={faTrash} className="me-2" />
                                    Delete
                                </Button>
                            </div>
                        </div>

                        <dl className="row">
                            <dt className="col-sm-3">Category</dt>
                            <dd className="col-sm-9">{subscription.providerCategory}</dd>

                            <dt className="col-sm-3">Amount</dt>
                            <dd className="col-sm-9">${subscription.amount.toFixed(2)} / {subscription.renewalFrequency}</dd>

                            <dt className="col-sm-3">Start Date</dt>
                            <dd className="col-sm-9">
                                {subscription.startDate ? new Date(subscription.startDate).toLocaleDateString() : 'Not specified'}
                            </dd>

                            <dt className="col-sm-3">Payment Method</dt>
                            <dd className="col-sm-9">
                                <div className="d-flex align-items-center">
                                    <div className="rounded bg-light d-flex align-items-center justify-content-center p-1 me-2">
                                        <img 
                                            src={subscription.paymentProviderIcon}
                                            alt={subscription.paymentProviderName}
                                            style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                                        />
                                    </div>
                                    {subscription.paymentDetails}
                                </div>
                            </dd>

                            {subscription.notes && (
                                <>
                                    <dt className="col-sm-3">Notes</dt>
                                    <dd className="col-sm-9">{subscription.notes}</dd>
                                </>
                            )}

                            <dt className="col-sm-3">Unsubscribe</dt>
                            <dd className="col-sm-9">
                                <Button 
                                    variant="link" 
                                    href={subscription.providerUnsubscribeUrl} 
                                    target="_blank"
                                    className="p-0"
                                >
                                    <FontAwesomeIcon icon={faLink} className="me-2" />
                                    View unsubscribe instructions
                                </Button>
                            </dd>
                        </dl>
                    </Card.Body>
                </Card>
            )}

            {alerts.length > 0 && (
                <Card className="mt-4" style={{ 
                    backgroundColor: 'var(--bs-body-bg)', 
                    color: 'var(--bs-body-color)',
                    borderColor: 'var(--bs-border-color)'
                }}>
                    <Card.Body>
                        <h5 className="mb-3">
                            <FontAwesomeIcon icon={faBell} className="me-2" />
                            Active Alerts
                        </h5>
                        <SubscriptionAlertList 
                            alerts={alerts}
                            onDismiss={handleDismiss}
                            onSnooze={handleSnooze}
                            showProvider={true}  // Add this line
                        />
                    </Card.Body>
                </Card>
            )}

            <EditSubscriptionModal
                show={showEdit}
                onHide={() => setShowEdit(false)}
                subscription={subscription}
                onSubmit={async () => {
                    await fetchSubscription();
                    setShowEdit(false);
                }}
            />

            <DeleteSubscriptionModal
                show={showDelete}
                onHide={() => setShowDelete(false)}
                subscription={subscription}
                onDelete={() => {
                    navigate('/mysubscriptions');
                }}
            />
        </Container>
    );
};

export default SubscriptionDetail;