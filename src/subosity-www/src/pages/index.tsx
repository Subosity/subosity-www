import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartPie,
  faBell,
  faListCheck,
  faArrowRight,
  faUserPlus
} from '@fortawesome/free-solid-svg-icons';
import type { HeadFC, PageProps } from "gatsby"
import Layout from '../components/Layout';
import { APP_CONFIG } from '../config';

const IndexPage: React.FC<PageProps> = () => {
  const features = [
    {
      icon: faListCheck,
      title: "Track All Subscriptions",
      description: "From streaming services to memberships, manage everything in one place.",
      image: "https://picsum.photos/800/400.jpg?random=1"
    },
    {
      icon: faBell,
      title: "Never Miss a Renewal",
      description: "Get timely alerts before renewals and trial period endings.",
      image: "https://picsum.photos/800/400.jpg?random=2"
    },
    {
      icon: faChartPie,
      title: "Subscription Analytics",
      description: "Visualize spending patterns and optimize your subscription costs.",
      image: "https://picsum.photos/800/400.jpg?random=3"
    }
  ];

  return (
    <Layout>
      <div className="home-page">
        {/* Hero Section */}
        <div className="bg-primary text-white py-5">
          <Container>
            <Row className="align-items-center">
              <Col md={6} className="mb-4 mb-md-0">
                    <h1 className="display-4 fw-bold mb-3">
                      Manage Your Subscriptions Smarter
                    </h1>
                    <p className="lead mb-4">
                      Track, analyze, and manage all your subscriptions in one place.
                      From streaming services to memberships, never lose track of your recurring payments again.
                    </p>
                    <Button
                      size="lg"
                      variant="light"
                      className="me-3"
                      as="a"
                      href={`${APP_CONFIG.appUrl}/signup`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                      Get Started
                    </Button>
                  </Col>
                  <Col md={6}>
                    <img
                      src="https://picsum.photos/800/400.jpg?random=4"
                      alt="Subscription Management"
                      className="img-fluid rounded shadow-lg"
                    />
                  </Col>
                </Row>
              </Container>
            </div>

            {/* Features Section */}
            <Container className="py-5">
              <h2 className="text-center mb-5">Why Choose Subosity?</h2>
              <Row>
                {features.map((feature, index) => (
                  <Col key={index} md={4} className="mb-4">
                    <Card
                      className="h-100 shadow border"
                      style={{
                        backgroundColor: 'var(--bs-body-bg)',
                        borderColor: 'var(--bs-border-color)',
                        boxShadow: 'var(--bs-box-shadow)'
                      }}
                    >
                      <Card.Img
                        variant="top"
                        src={feature.image}
                        alt={feature.title}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      <Card.Body className="text-center">
                        <div className="feature-icon mb-3">
                          <FontAwesomeIcon
                            icon={feature.icon}
                            size="2x"
                            className="text-primary"
                          />
                        </div>
                        <Card.Title className="text-body">{feature.title}</Card.Title>
                        <Card.Text className="text-body-secondary">{feature.description}</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Container>

            {/* CTA Section */}
            <div className="py-5" style={{ backgroundColor: 'var(--bs-body-tertiary)' }}>
              <Container className="text-center">
                <h2 className="mb-4 text-body">Start Managing Your Subscriptions Today</h2>
                <p className="lead mb-4 text-body-secondary">
                  Join thousands of users who are taking control of their subscriptions.
                  <br />No credit card required - get started for free!
                </p>
                <Button
                      size="lg"
                      variant="light"
                      className="px-4"
                      as="a"
                      href={`${APP_CONFIG.appUrl}/signup`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                      Get Started
                    </Button>
              </Container>
            </div>
          </div>
    </Layout>
  )
}

export default IndexPage

export const Head: HeadFC = () => <title>Subosity - Manage Your Subscriptions Smarter</title>
