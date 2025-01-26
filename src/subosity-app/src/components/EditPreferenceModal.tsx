import React, { useState, useEffect } from 'react';
import { Offcanvas, Button, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faSave, faGear } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../supabaseClient';
import { useToast } from '../ToastContext';
import { useTheme } from '../ThemeContext';
import { Theme } from '../types';

// Add theme value mapping
const THEME_VALUES = {
    'Auto': 'Auto',
    'Light': 'Light',
    'Dark': 'Dark'
} as const;

interface Props {
    show: boolean;
    onHide: () => void;
    preference: {
        id: string;
        title: string;
        preference_key: string;
        preference_value: string;
        data_type: string;
        available_values: string[] | null;
    } | null;
    onSubmit: () => void;
}

const EditPreferenceModal: React.FC<Props> = ({ show, onHide, preference, onSubmit }) => {
    const { setTheme } = useTheme();
    const { addToast } = useToast();

    // Initialize value based on data type
    const [value, setValue] = useState(() => {
        if (!preference?.preference_value) return '';
        if (preference.data_type === 'number') {
            return Number(preference.preference_value);
        }
        // Convert theme values to proper case
        if (preference.preference_key === 'theme') {
            return Object.keys(THEME_VALUES).find(
                key => THEME_VALUES[key as keyof typeof THEME_VALUES] === preference.preference_value
            ) || 'Auto';
        }
        return preference.preference_value;
    });

    // Update value when preference changes
    useEffect(() => {
        if (preference?.preference_value) {
            if (preference.data_type === 'number') {
                setValue(Number(preference.preference_value));
            } else {
                setValue(preference.preference_value);
            }
        }
    }, [preference]);

    const handleSubmit = async () => {
        try {
            if (!preference?.id) return;

            // Convert display value back to storage value for theme
            const storageValue = preference.preference_key === 'theme'
                ? THEME_VALUES[value as keyof typeof THEME_VALUES]
                : value.toString();

            const { error } = await supabase
                .from('preferences')
                .update({ preference_value: storageValue })
                .eq('id', preference.id);

            if (error) throw error;

            // If this is a theme preference, update the theme context
            if (preference.preference_key === 'theme') {
                setTheme(storageValue as Theme);
            }

            addToast('Preference updated successfully', 'success');
            onSubmit();
            onHide();
        } catch (error) {
            console.error('Error updating preference:', error);
            addToast('Failed to update preference', 'error');
        }
    };

    const renderInput = () => {
        if (!preference) return null;

        switch (preference.data_type) {
            case 'number':
                return (
                    <Form.Control
                        type="number"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    />
                );
            case 'choice':
                return (
                    <Form.Select
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    >
                        {preference.available_values?.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </Form.Select>
                );
            default:
                return (
                    <Form.Control
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    />
                );
        }
    };

    return (
        <Offcanvas show={show} onHide={onHide} placement="end">
            <Offcanvas.Header closeButton style={{ backgroundColor: 'var(--bs-navbar-bg)', color: 'var(--bs-body-color)' }}>
                <div>
                    <Offcanvas.Title>
                        <FontAwesomeIcon icon={faGear} className="me-2" />
                        Edit Preference
                    </Offcanvas.Title>
                    <div style={{ fontSize: '0.85em', opacity: 0.6 }}>
                        {preference?.title}
                    </div>
                </div>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Value</Form.Label>
                        {renderInput()}
                    </Form.Group>
                </Form>
            </Offcanvas.Body>
            <div className="p-3 border-top" style={{ backgroundColor: 'var(--bs-navbar-bg)' }}>
                <div className="d-flex justify-content-end">
                    <Button variant="secondary" className="me-2" onClick={onHide}>
                        <FontAwesomeIcon icon={faChevronLeft} className="me-2" />
                        Back
                    </Button>
                    <Button variant="primary" onClick={handleSubmit}>
                        <FontAwesomeIcon icon={faSave} className="me-2" />
                        Save Changes
                    </Button>
                </div>
            </div>
        </Offcanvas>
    );
};

export default EditPreferenceModal;