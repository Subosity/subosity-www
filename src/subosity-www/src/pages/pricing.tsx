import React from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCheck, 
    faCrown, 
    faUsers,
    faInfinity,
    faMobile,
    faDownload,
    faGears,
    faUserPlus,
    faBell
} from '@fortawesome/free-solid-svg-icons';
import type { HeadFC, PageProps } from "gatsby"
import Layout from '../components/Layout';
import { APP_CONFIG } from '../config';
import '../styles/pricing.css';

const PricingTier = ({ 
    title, 
    price, 
    yearlyPrice,
    icon, 
    features, 
    isPopular = false,
    buttonVariant = "primary" 
}: {
    title: string;
    price: number;
    yearlyPrice: number;
    icon: any;
    features: string[];
    isPopular?: boolean;
    buttonVariant?: string;
}) => (
    <Card 
        className={`w-100 pricing-card ${isPopular ? 'popular' : ''}`}
        style={{ minHeight: isPopular ? '700px' : 'auto' ,
            borderWidth: isPopular ? '8px' : 'auto' ,
        }}
    >
        {isPopular && (
            <div className="position-absolute top-0 start-50 translate-middle">
                <Badge bg="warning" className="py-2 px-3 rounded-pill">
                    <FontAwesomeIcon icon={faCrown} className="me-2" />
                    Most Popular
                </Badge>
            </div>
        )}
        <Card.Body className={`p-4 text-center d-flex flex-column ${isPopular ? 'shadow-lg' : 'shadow'}`}>
            <div className="mb-4">
                <img src={`/images/${icon}.png`} 
                     alt={`${title} icon`} 
                     className="pricing-icon mb-3" 
                     style={{ width: '128px', height: '128px' }} />
            </div>
            <h3 className="mb-3">{title}</h3>
            <div className="mb-4">
                <h2 className="display-4 fw-bold mb-0">
                    {price === 0 ? 'Free' : `$${price}`}
                </h2>
                {price > 0 && (
                    <>
                        <p className="text-muted mb-0">per month</p>
                        <small className="text-muted">
                            or ${yearlyPrice}/year (save ~17%)
                        </small>
                    </>
                )}
            </div>
            <ul className="list-unstyled mb-4 flex-grow-1">
                {features.map((feature, index) => (
                    <li key={index} className="mb-3 d-flex align-items-center justify-content-center">
                        <FontAwesomeIcon icon={faCheck} className="text-success me-2" />
                        {feature}
                    </li>
                ))}
            </ul>
            
            <Button 
                href={`${APP_CONFIG.appUrl}/signup?tier=${title.toLowerCase().replace(/\s+/g, '-')}`}
                target="_blank"
                rel="noopener noreferrer"
                variant={buttonVariant} 
                size="lg" 
                className="w-100 mt-auto"
                as="a"
            >
                <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                Get Started
            </Button>
        </Card.Body>
    </Card>
);

const Pricing: React.FC<PageProps> = () => {

    const plans = [
        {
            title: "Free",
            price: 0,
            yearlyPrice: 0,
            icon: "logo",
            features: [
                "Track up to 30 subscriptions",
                "In-app notifications",
                "Email notifications",
                "Export data in multiple formats",
                "Basic reporting & analytics",
                "Community support"
            ],
            buttonVariant: "outline-primary"
        },
        {
            title: "Plus",
            price: 4.99,
            yearlyPrice: 49.99,
            icon: "logo_plus",
            isPopular: true,
            features: [
                "Track up to 1000 subscriptions",
                "Custom subscription providers",
                "SMS notifications",
                "Priority support",
                "Advanced analytics",
                "API access"
            ]
        },
        {
            title: "Family",
            price: 19.99,
            yearlyPrice: 199.99,
            icon: "logo_family",
            features: [
                "Everything in Plus",
                "Up to 6 family accounts",
                "Shared subscriptions",
                "Family dashboard",
                "Granular permissions",
                "24/7 priority support"
            ]
        }
    ];

    return (
        <Layout>
            <Container className="py-5">
                <div className="text-center mb-5">
                    <h1 className="display-4 mb-3">Simple, Transparent Pricing</h1>
                    <p className="lead text-body-secondary mb-0">
                        Start managing your subscriptions for free.
                        <br />
                        Upgrade anytime for more features.
                            </p>
                        </div>
                        <Row className="g-4 mt-3 align-items-center">
                            {plans.map((plan, index) => (
                                <Col 
                                    key={index} 
                                    md={4} 
                                    className="px-2"
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        minHeight: '650px'
                                    }}
                                >
                                    <PricingTier {...plan} />
                                </Col>
                            ))}
                        </Row>
                        <div className="text-center mt-5">
                            <p className="text-body-secondary mb-0">
                                All plans include our core features: Subscription tracking, 
                                renewal alerts, and basic analytics.
                                <br />
                                No credit card required for free plan.
                            </p>
                        </div>
                    </Container>
        </Layout>
    );
};

export default Pricing

export const Head: HeadFC = () => <title>Pricing - Subosity</title>
