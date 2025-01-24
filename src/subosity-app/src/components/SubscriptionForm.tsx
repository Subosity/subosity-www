import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { Subscription } from '../types';

interface Props {
    subscription?: Subscription;
    onSubmit: (data: Partial<Subscription>) => void;
    onCancel: () => void;
}

const SubscriptionForm: React.FC<Props> = ({ subscription, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState<Partial<Subscription>>({
        name: '',
        startDate: '',
        renewalFrequency: 'monthly',
        autoRenewal: true,
        paymentDetails: '',
        notes: '',
        ...subscription
    });

    return (
        <Form onSubmit={(e) => {
            e.preventDefault();
            onSubmit(formData);
        }}>
            <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Renewal Frequency</Form.Label>
                <Form.Select
                    value={formData.renewalFrequency}
                    onChange={(e) => setFormData({ ...formData, renewalFrequency: e.target.value as any })}
                >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Check
                    type="checkbox"
                    label="Auto Renewal"
                    checked={formData.autoRenewal}
                    onChange={(e) => setFormData({ ...formData, autoRenewal: e.target.checked })}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Payment Details</Form.Label>
                <Form.Control
                    type="text"
                    value={formData.paymentDetails}
                    onChange={(e) => setFormData({ ...formData, paymentDetails: e.target.value })}
                    required
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
            </Form.Group>

            <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={onCancel}>
                    Cancel
                </Button>
                <Button variant="primary" type="submit">
                    {subscription ? 'Update' : 'Add'} Subscription
                </Button>
            </div>
        </Form>
    );
};

export default SubscriptionForm;