// src/subosity-app/src/components/AddSubscriptionProviderModal.tsx
import React, { useState, useEffect } from 'react';
import { Offcanvas, Button, Form, InputGroup, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faSave, faPlus, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import SubscriptionFinder from './SubscriptionFinder';
import { useToast } from '../ToastContext';
import { supabase } from '../supabaseClient';

interface Props {
    show: boolean;
    onHide: () => void;
    onSave: (data: any) => void;
}

const AddSubscriptionProviderModal: React.FC<Props> = ({ show, onHide, onSave }) => {
    const { addToast } = useToast();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        website: '',
        unsubscribe_url: '',
        icon: ''
    });
    const [isFormValid, setIsFormValid] = useState(false);

    // Add validation effect
    useEffect(() => {
        const isValid = Boolean(
            formData.name?.trim() &&
            formData.description?.trim() &&
            formData.icon?.trim()
        );
        setIsFormValid(isValid);
    }, [formData]);

    const handleMetadataFetched = (metadata: { name: string; description: string; icons: string[] }) => {
        setFormData(prev => ({
            ...prev,
            name: metadata.name,
            description: metadata.description,
            // Don't set a default icon - make user explicitly choose
            website: prev.website || metadata.website || ''
        }));
    };

    // Add icon selection handler
    const handleIconSelected = (iconUrl: string) => {
        setFormData(prev => ({
            ...prev,
            icon: iconUrl
        }));
    };

    const handleSubmit = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No authenticated user');

            const subscriptionProviderData = {
                owner: user.id,
                name: formData.name,
                description: formData.description,
                icon: formData.icon,
                category: formData.category,
                website: formData.website,
                unsubscribe_url: formData.unsubscribe_url,
                is_default: false,
                is_public: false,
                is_pending: true,
                is_enabled: true
            };

            const { error } = await supabase
                .from('subscription_provider')
                .insert([subscriptionProviderData]);

            if (error) throw error;

            addToast('Subscription provider added successfully', 'success');
            onSave(subscriptionProviderData);
            onHide();
        } catch (error) {
            console.error('Error adding subscription provider:', error);
            addToast('Failed to add subscription provider', 'error');
        }
    };

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
                <Form>
                    <Form.Group className="mb-3">
                        <SubscriptionFinder 
                            onMetadataFetched={handleMetadataFetched}
                            onIconSelected={handleIconSelected}
                            name={formData.name}
                            description={formData.description}
                            onNameChange={(name) => setFormData(prev => ({ ...prev, name }))}
                            onDescriptionChange={(description) => setFormData(prev => ({ ...prev, description }))}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Category</Form.Label>
                        <div className="text-muted mb-2" style={{ fontSize: '0.75em' }}>
                            Category of subscription (e.g. "Entertainment", "Fitness & Health")
                        </div>
                        <Form.Control
                            type="text"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Unsubscribe URL (optional)</Form.Label>
                        <div className="text-muted mb-2" style={{ fontSize: '0.75em' }}>
                            URL where users can unsubscribe from this service
                        </div>
                        <Form.Control
                            type="text"
                            value={formData.unsubscribe_url}
                            onChange={(e) => setFormData({ ...formData, unsubscribe_url: e.target.value })}
                        />
                    </Form.Group>

                    {/* Add feedback about icon selection */}
                    {!formData.icon && (
                        <Alert variant="warning">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                            Please select an icon from the options above
                        </Alert>
                    )}
                </Form>
            </Offcanvas.Body>
            <div className="p-3 border-top" style={{ backgroundColor: 'var(--bs-navbar-bg)' }}>
                <div className="d-flex justify-content-end">
                    <Button variant="secondary" className="me-2" onClick={onHide}>
                        <FontAwesomeIcon icon={faChevronLeft} className="me-2" />
                        Back
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={!isFormValid}
                    >
                        <FontAwesomeIcon icon={faSave} className="me-2" />
                        Save Changes
                    </Button>
                </div>
            </div>
        </Offcanvas>
    );
};

export default AddSubscriptionProviderModal;