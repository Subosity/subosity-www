import React, { useState, useEffect } from 'react';
import { Button, Card, Badge, Offcanvas, Form, InputGroup, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faThLarge, faList, faSearch, faSort, faHandHoldingDollar, faSquarePlus } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../supabaseClient';
import { useToast } from '../ToastContext';
import SubscriptionCard from '../components/SubscriptionCard';
import SubscriptionListItem from '../components/SubscriptionListItem';
import DeleteSubscriptionModal from '../components/DeleteSubscriptionModal';
import EditSubscriptionModal from '../components/EditSubscriptionModal';
import AddSubscriptionModal from '../components/AddSubscriptionModal';
import { Subscription } from '../types';

const MySubscriptions = () => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
    const [viewMode, setViewMode] = useState(() =>
        localStorage.getItem('subscriptionViewMode') || 'card'
    );
    const [searchText, setSearchText] = useState('');
    const [sortOrder, setSortOrder] = useState<'name' | 'date' | 'frequency'>('name');

    useEffect(() => {
        localStorage.setItem('subscriptionViewMode', viewMode);
    }, [viewMode]);

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
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
                        icon
                    ),
                    payment_provider:payment_provider_id(
                        id,
                        name,
                        icon
                    )
                `);

            if (error) throw error;

            setSubscriptions(data?.map(sub => ({
                id: sub.id,
                providerId: sub.subscription_provider_id,
                providerName: sub.subscription_provider.name,
                providerDescription: sub.subscription_provider.description,
                providerCategory: sub.subscription_provider.category,
                providerIcon: sub.subscription_provider.icon,
                nickname: sub.nickname,  // Add this line
                startDate: sub.start_date,
                renewalFrequency: sub.renew_frequency,
                autoRenewal: sub.autorenew,
                amount: sub.amount,
                paymentProviderId: sub.payment_provider_id,
                paymentProviderName: sub.payment_provider.name,
                paymentProviderIcon: sub.payment_provider.icon,
                paymentDetails: sub.payment_details,
                notes: sub.notes,
                isFreeTrial: sub.is_free_trial
            })) || []);
        } catch (error) {
            addToast('Error loading subscriptions', 'error');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterSubscriptions = (subs: Subscription[]) => {
        if (!searchText) return subs;

        const searchLower = searchText.toLowerCase();
        return subs.filter(sub =>
            sub.providerName.toLowerCase().includes(searchLower) ||
            sub.paymentDetails?.toLowerCase().includes(searchLower) ||
            sub.notes?.toLowerCase().includes(searchLower)
        );
    };

    const sortSubscriptions = (subs: Subscription[]) => {
        return [...subs].sort((a, b) => {
            switch (sortOrder) {
                case 'name':
                    return a.providerName.localeCompare(b.providerName);
                case 'date':
                    return new Date(a.startDate || 0).getTime() - new Date(b.startDate || 0).getTime();
                case 'frequency':
                    return (a.renewalFrequency || '').localeCompare(b.renewalFrequency || '');
                default:
                    return 0;
            }
        });
    };

    const filteredAndSortedSubscriptions = sortSubscriptions(filterSubscriptions(subscriptions));

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                    <h3 className="mb-1" style={{ color: 'var(--bs-body-color)' }}>
                        Your Subscriptions
                    </h3>
                    {/* Replace text-muted with explicit color */}
                    <p className="mb-0" style={{ color: 'var(--bs-body-color)', opacity: 0.75 }}>
                        Manage and track all your subscription services
                    </p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => setShowAdd(true)}
                    className="d-flex align-items-center"
                >
                    <FontAwesomeIcon icon={faSquarePlus} className="me-2" />
                    Add Subscription
                </Button>
            </div>

            {loading ? (
                <div className="text-center mt-5">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : filteredAndSortedSubscriptions.length === 0 ? (
                <Alert 
                    className="text-center p-5 border"
                    style={{
                        backgroundColor: 'var(--bs-navbar-bg)',
                        borderColor: 'var(--bs-border-color)',
                    }}
                >
                    <div className="mb-3">
                        <FontAwesomeIcon 
                            icon={faHandHoldingDollar} 
                            style={{ color: 'var(--bs-secondary)' }}
                            className="fa-3x" 
                        />
                    </div>
                    <h4 style={{ color: 'var(--bs-body-color)' }}>
                        No Subscriptions Yet
                    </h4>
                    <p style={{ color: 'var(--bs-secondary)' }} className="mb-4">
                        You haven't added any subscriptions yet. Start tracking your subscriptions to manage your recurring payments better.
                    </p>
                    <Button
                        variant="primary"
                        onClick={() => setShowAdd(true)}
                    >
                        <FontAwesomeIcon icon={faSquarePlus} className="me-2" />
                        Add Your First Subscription
                    </Button>
                </Alert>
            ) : (
                <>
                    <div className="row mb-4">
                        <div className="col-md-8">
                            <InputGroup>
                                <InputGroup.Text style={{ 
                                    backgroundColor: 'var(--bs-background-color)', 
                                    color: 'var(--bs-body-color)' }}>
                                    <FontAwesomeIcon icon={faSearch} />
                                </InputGroup.Text>
                                <Form.Control
                                    className="custom-placeholder"
                                    style={{
                                        backgroundColor: 'var(--bs-background-color)',
                                        color: 'var(--bs-body-color)'
                                    }}
                                    placeholder="Search subscriptions..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                />
                            </InputGroup>
                        </div>
                        <div className="col-md-2">
                            <Form.Select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
                            >
                                <option value="name">Sort by Name</option>
                                <option value="date">Sort by Date</option>
                                <option value="frequency">Sort by Frequency</option>
                            </Form.Select>
                        </div>
                        <div className="col-md-2">
                            <div className="btn-group w-100">
                                <Button
                                    variant={viewMode === 'card' ? 'primary' : 'outline-primary'}
                                    onClick={() => setViewMode('card')}
                                >
                                    <FontAwesomeIcon icon={faThLarge} />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
                                    onClick={() => setViewMode('list')}
                                >
                                    <FontAwesomeIcon icon={faList} />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {viewMode === 'card' ? (
                        <div className="row g-4">
                            {filteredAndSortedSubscriptions.map(subscription => (
                                <div key={subscription.id} className="col-12 col-md-6 col-lg-4">
                                    <SubscriptionCard
                                        subscription={subscription}
                                        onEdit={(sub) => {
                                            setSelectedSubscription(sub);
                                            setShowEdit(true);
                                        }}
                                        onDelete={(sub) => {
                                            setSelectedSubscription(sub);
                                            setShowDelete(true);
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="border rounded">
                            {filteredAndSortedSubscriptions.map(subscription => (
                                <SubscriptionListItem
                                    key={subscription.id}
                                    subscription={subscription}
                                    onEdit={(sub) => {
                                        setSelectedSubscription(sub);
                                        setShowEdit(true);
                                    }}
                                    onDelete={(sub) => {
                                        setSelectedSubscription(sub);
                                        setShowDelete(true);
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            <DeleteSubscriptionModal
                show={showDelete}
                onHide={() => setShowDelete(false)}
                subscription={selectedSubscription}
                onDelete={async () => {
                    await fetchSubscriptions(); // Refresh the list
                    setShowDelete(false);
                }}
            />

            <EditSubscriptionModal
                show={showEdit}
                onHide={() => setShowEdit(false)}
                subscription={selectedSubscription}
                onSubmit={async (data) => {
                    await fetchSubscriptions(); // Refresh the list after update
                    setShowEdit(false);
                }}
            />

            <AddSubscriptionModal
                show={showAdd}
                onHide={() => setShowAdd(false)}
                onSubmit={async (data) => {
                    await fetchSubscriptions(); // Refresh the list after add
                    setShowAdd(false);
                }}
            />
        </div>
    );
};

export default MySubscriptions;