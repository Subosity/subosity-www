import React, { useState, useEffect } from 'react';
import { Offcanvas, Button, ListGroup, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faBell, 
    faCheck, 
    faClock, 
    faTimesCircle,
    faCircleInfo,
    faTriangleExclamation,
    faCircleExclamation
} from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../supabaseClient';
import { useToast } from '../ToastContext';
import SubscriptionAlertList from './SubscriptionAlertList';

interface SubscriptionAlert {
    id: string;
    title: string;
    description: string;
    severity: 'info' | 'warning' | 'danger';
    created_at: string;
    sent_at: string | null;
    read_at: string | null;
    subscription: {
        subscription_provider: {
            name: string;
            icon: string;
        }
    }
}

interface Props {
    show: boolean;
    onHide: () => void;
}

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
            return 'var(--bs-primary)';
        default:
            return 'var(--bs-info)';
    }
};

const SubscriptionAlertsModal: React.FC<Props> = ({ show, onHide }) => {
    const [alerts, setAlerts] = useState<SubscriptionAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    const fetchAlerts = async () => {
        try {
            setLoading(true);
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
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAlerts(data || []);
        } catch (error) {
            console.error('Error fetching alerts:', error);
            addToast('Failed to load alerts', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (show) {
            fetchAlerts();
        }
    }, [show]);

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

            // Create new snoozed alert
            const { error: insertError } = await supabase
                .from('subscription_alerts')
                .insert([{
                    subscription_id: alert.subscription_id,
                    title: alert.title,
                    description: alert.description,
                    severity: alert.severity,
                    sent_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
                }]);

            if (insertError) throw insertError;

            // Mark current alert as read
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
        <Offcanvas show={show} onHide={onHide} placement="end">
            <Offcanvas.Header closeButton style={{ backgroundColor: 'var(--bs-navbar-bg)', color: 'var(--bs-body-color)' }}>
                <div>
                    <Offcanvas.Title>
                        <FontAwesomeIcon icon={faBell} className="me-2" />
                        Subscription Alerts
                    </Offcanvas.Title>
                    <div style={{ fontSize: '0.85em', opacity: 0.6 }}>
                        Manage your subscription notifications
                    </div>
                </div>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <SubscriptionAlertList 
                    alerts={alerts}
                    onDismiss={handleDismiss}
                    onSnooze={handleSnooze}
                    showProvider={true}
                />
            </Offcanvas.Body>
        </Offcanvas>
    );
};

export default SubscriptionAlertsModal;