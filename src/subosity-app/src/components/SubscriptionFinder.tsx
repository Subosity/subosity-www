import React, { useState, useContext } from 'react';
import { Form, InputGroup, Button, Spinner, Alert, Carousel } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faExclamationTriangle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { ThemeProvider } from '../ThemeContext';

interface Props {
    onMetadataFetched: (metadata: { 
        name: string; 
        description: string; 
        icons: string[]; 
        website?: string 
    }) => void;
    onIconSelected?: (icon: string) => void;
    name: string;
    description: string;
    onNameChange: (name: string) => void;
    onDescriptionChange: (description: string) => void;
}

const SubscriptionFinder: React.FC<Props> = ({ 
    onMetadataFetched, 
    onIconSelected = () => {}, 
    name,
    description,
    onNameChange,
    onDescriptionChange
}) => {
    const [domain, setDomain] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [metadata, setMetadata] = useState<{ name: string; description: string; icons: string[] } | null>(null);
    const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
    const theme = useContext(ThemeProvider);

    const uniqueIcons = metadata?.icons ? [...new Set(metadata.icons)] : [];

    const chunk = (arr: any[], size: number) => 
        Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
            arr.slice(i * size, i * size + size)
        );

    const fetchMetadata = async () => {
        setLoading(true);
        setError(null);
        setMetadata(null);

        try {
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-metadata?domain=${domain}`, {
                headers: {
                    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const metadata = await response.json();
            setMetadata(metadata);
            onMetadataFetched(metadata);
        } catch (err) {
            setError(`Failed to fetch metadata: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleIconClick = (icon: string) => {
        setSelectedIcon(icon);
        onIconSelected(icon);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!metadata || !selectedIcon) {
            setError('Please select an icon.');
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/insert-subscription-provider`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({
                    name: metadata.name,
                    description: metadata.description,
                    icon: selectedIcon,
                    domain
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            alert('Subscription Provider saved successfully!');
        } catch (err) {
            setError(`Failed to save Subscription Provider: ${err.message}`);
        }
    };

    return (
        <div className="bg-body rounded p-3 border shadow" style={{ marginTop: '1rem' }}>
            <Form onSubmit={handleSubmit}>
                <InputGroup className="mb-3">
                    <Form.Label>Website</Form.Label>
                    <div className="text-muted mb-2" style={{ fontSize: '0.75em' }}>
                        Enter the domain of the subscription provider's website (e.g., example.com)
                    </div>
                    <Form.Control
                        type="text"
                        placeholder="Enter domain (e.g., example.com)"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        required
                    />
                    <Button 
                        variant="primary" 
                        onClick={fetchMetadata} 
                        disabled={loading}
                    >
                        {loading ? <Spinner animation="border" size="sm" /> : <FontAwesomeIcon icon={faSearch} />}
                    </Button>
                </InputGroup>

                {error && <Alert variant="danger"><FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />{error}</Alert>}
                
                {metadata && (
                    <div>
                        <h5>Found Metadata</h5>
                        <Form.Group className="mb-3">
                            <Form.Label>Name <span className="text-danger">*</span></Form.Label>
                            <Form.Control 
                                type="text" 
                                value={name}
                                onChange={(e) => onNameChange(e.target.value)}
                                isInvalid={!name.trim()}
                                required 
                            />
                            <Form.Control.Feedback type="invalid">
                                Please enter a name
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Description <span className="text-danger">*</span></Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={3} 
                                value={description}
                                onChange={(e) => onDescriptionChange(e.target.value)}
                                isInvalid={!description.trim()}
                                required 
                            />
                            <Form.Control.Feedback type="invalid">
                                Please enter a description
                            </Form.Control.Feedback>
                        </Form.Group>

                        {uniqueIcons.length > 0 ? (
                            <>
                                <Form.Control type="hidden" value={selectedIcon || ''} />
                                <h6>Select an Icon</h6>
                                <Carousel 
                                    indicators={false} 
                                    controls={true} 
                                    interval={null}
                                    className="bg-body-tertiary rounded p-3 border"
                                    style={{ minHeight: '120px' }}  // Increased from 100px
                                >
                                    {chunk(uniqueIcons, 4).map((iconGroup, groupIndex) => (
                                        <Carousel.Item key={groupIndex}>
                                            <div className="d-flex justify-content-center gap-2">
                                                {iconGroup.map((icon, index) => (
                                                    <div 
                                                        key={index}
                                                        className="position-relative"
                                                        onClick={() => handleIconClick(icon)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <div 
                                                            className="position-relative bg-body rounded p-2"
                                                            style={{
                                                                width: '48px',
                                                                height: '48px',
                                                                marginTop: '10px',
                                                                marginBottom: '10px',
                                                                marginRight: '15px', // Add space for checkmark
                                                                border: `2px solid var(--bs-border-color)`,
                                                                transition: 'all 0.2s ease-in-out',
                                                                transform: selectedIcon === icon ? 'scale(1.1)' : 'scale(1)',
                                                                boxShadow: selectedIcon === icon ? '0 0 0 2px var(--bs-primary)' : 'none'
                                                            }}
                                                        >
                                                            <img 
                                                                src={icon}
                                                                alt={`Icon ${groupIndex * 4 + index + 1}`}
                                                                className="d-block w-100 h-100"
                                                                style={{ objectFit: 'contain' }}
                                                            />
                                                            {selectedIcon === icon && (
                                                                <div 
                                                                    className="position-absolute"
                                                                    style={{
                                                                        top: '-8px',
                                                                        right: '-8px',
                                                                        background: 'var(--bs-success)',
                                                                        borderRadius: '50%',
                                                                        width: '20px',
                                                                        height: '20px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        border: '2px solid var(--bs-body-bg)',
                                                                        boxShadow: '0 0 0 2px var(--bs-success)'
                                                                    }}
                                                                >
                                                                    <FontAwesomeIcon 
                                                                        icon={faCheckCircle} 
                                                                        style={{
                                                                            fontSize: '0.9em',
                                                                            color: 'var(--bs-body-bg)'
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </Carousel.Item>
                                    ))}
                                </Carousel>
                            </>
                        ) : (
                            <Alert variant="warning">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                                No icons found for this website. A valid icon is required to add this subscription provider.
                            </Alert>
                        )}
                    </div>
                )}
            </Form>
        </div>
    );
};

export default SubscriptionFinder;