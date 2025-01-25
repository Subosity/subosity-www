import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Card, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faEdit, faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../../supabaseClient';
import { useToast } from '../../ToastContext';
import EditPreferenceModal from '../../components/EditPreferenceModal';
import { useTheme } from '../../ThemeContext'; // Add this

interface Preference {
    id: string;
    title: string;
    preference_key: string;
    preference_value: string;
    data_type: string;
    available_values: string[] | null;
}

type SortField = 'title' | 'preference_value';
type SortDirection = 'asc' | 'desc';

const Preferences: React.FC = () => {
    const [preferences, setPreferences] = useState<Preference[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEdit, setShowEdit] = useState(false);
    const [selectedPreference, setSelectedPreference] = useState<Preference | null>(null);
    const [sortField, setSortField] = useState<SortField>('title');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const { addToast } = useToast();
    const { theme } = useTheme(); // Add this

    useEffect(() => {
        fetchPreferences();
    }, [theme]); // Add theme as dependency

    const fetchPreferences = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('preferences')
                .select('*');

            if (error) throw error;
            setPreferences(data || []);
        } catch (error) {
            console.error('Error fetching preferences:', error);
            addToast('Failed to load preferences', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (preference: Preference) => {
        setSelectedPreference(preference);
        setShowEdit(true);
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return faSort;
        return sortDirection === 'asc' ? faSortUp : faSortDown;
    };

    const sortedPreferences = [...preferences].sort((a, b) => {
        const multiplier = sortDirection === 'asc' ? 1 : -1;
        const aVal = a[sortField].toLowerCase();
        const bVal = b[sortField].toLowerCase();
        return aVal > bVal ? multiplier : -multiplier;
    });

    return (
      <div className="container py-4">
            <h3 className="mb-0">
                <FontAwesomeIcon icon={faGear} className="me-2" />
                Preferences
            </h3>
            <p style={{ 
                color: 'var(--bs-body-color)',
                opacity: 0.75,
                borderBottom: 'var(--bs-border-color) solid 1px' 
            }} className="mb-4">
                Customize your application settings
            </p>

            <Container>
                {loading ? (
                    <div className="text-center mt-5">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </div>
                ) : (
                    <Card>
                        <Card.Body>
                            <Table responsive hover bordered size="sm">
                                <thead>
                                    <tr>
                                        <th onClick={() => handleSort('title')} style={{ cursor: 'pointer' }}>
                                            Setting
                                            <FontAwesomeIcon icon={getSortIcon('title')} className="ms-2" />
                                        </th>
                                        <th 
                                            onClick={() => handleSort('preference_value')} 
                                            style={{ cursor: 'pointer' }}
                                            className="text-center"
                                        >
                                            Current Value
                                            <FontAwesomeIcon icon={getSortIcon('preference_value')} className="ms-2" />
                                        </th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedPreferences.map(pref => (
                                        <tr key={pref.id}>
                                            <td>{pref.title}</td>
                                            <td className="text-center">{pref.preference_value}</td>
                                            <td className="text-center">
                                                <Button 
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => handleEdit(pref)}
                                                >
                                                    <FontAwesomeIcon icon={faEdit} className='me-2' />Edit
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                )}
            </Container>

            <EditPreferenceModal
                show={showEdit}
                onHide={() => setShowEdit(false)}
                preference={selectedPreference}
                onSubmit={async () => {
                    await fetchPreferences();
                    setShowEdit(false);
                }}
            />
        </div>
    );
};

export default Preferences;