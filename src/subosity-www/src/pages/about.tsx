import React from "react";
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInfoCircle,
  faHandshake,
  faShieldHeart,
  faUserGroup,
  faLightbulb
} from "@fortawesome/free-solid-svg-icons";
import type { HeadFC, PageProps } from "gatsby"
import Layout from '../components/Layout';

const About: React.FC<PageProps> = () => {
  const team = [
    {
      role: "Our Mission",
      description: "To simplify subscription management and help people take control of their recurring expenses.",
      icon: faLightbulb,
      image: "https://picsum.photos/800/400.jpg?random=10"
    },
    {
      role: "Our Values",
      description: "We believe in transparency, security, and putting our users first in everything we do.",
      icon: faShieldHeart,
      image: "https://picsum.photos/800/400.jpg?random=11"
    },
    {
      role: "Our Community",
      description: "Join thousands of users who are already managing their subscriptions smarter.",
      icon: faUserGroup,
      image: "https://picsum.photos/800/400.jpg?random=12"
    }
  ];

  return (
    <Layout>
      <div className="container py-4">
            <div className="text-center mb-5">
              <h1 className="display-4 mb-3">
                <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                About Subosity
              </h1>
              <p className="lead text-body-secondary mb-0">
                Your All-in-One Subscription Management Solution
              </p>
            </div>

            {/* Main Story Section */}
            <div className="mb-5">
              <Row className="align-items-center">
                <Col md={6} className="mb-4 mb-md-0">
                  <h2 className="mb-4">Our Story</h2>
                  <p className="text-body-secondary">
                    Subosity was born from a simple observation: managing multiple subscriptions
                    had become increasingly complex in today's digital world. From streaming
                    services to software licenses, from gym memberships to magazine subscriptions,
                    keeping track of everything was a challenge.
                  </p>
                  <p className="text-body-secondary">
                    We created Subosity to solve this problem, offering a unified platform where
                    you can track, manage, and optimize all your subscriptions in one place.
                    Our platform helps you avoid unexpected charges, manage renewal dates, and
                    make informed decisions about your subscription spending.
                  </p>
                </Col>
                <Col md={6}>
                  <img
                    src="https://picsum.photos/800/400.jpg?random=9"
                    alt="Subscription Management Dashboard"
                    className="img-fluid rounded shadow-lg"
                  />
                </Col>
              </Row>
            </div>

            {/* Values Section */}
            <Row className="g-4 mb-5">
              {team.map((member, index) => (
                <Col key={index} md={4}>
                  <Card className="h-100 border-0 shadow bg-body-tertiary">
                    <Card.Img
                      variant="top"
                      src={member.image}
                      alt={member.role}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                    <Card.Body className="text-center">
                      <div className="feature-icon mb-3">
                        <FontAwesomeIcon
                          icon={member.icon}
                          size="2x"
                          className="text-warning"
                        />
                      </div>
                      <Card.Title>{member.role}</Card.Title>
                      <Card.Text className="text-body-secondary">{member.description}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Trust Section */}
            <div className="text-center py-5 px-3 rounded bg-body-tertiary shadow">
              <FontAwesomeIcon
                icon={faHandshake}
                size="3x"
                className="text-warning mb-4"
              />
              <h2 className="mb-4">Why Trust Subosity?</h2>
              <Row className="justify-content-center">
                <Col md={8}>
                  <p className="text-body-secondary mb-4">
                    At Subosity, we understand the sensitive nature of subscription management. 
                    Our platform is designed to store just enough information to help you track your 
                    services and payment methods, while maintaining robust security standards. We enable 
                    you to identify subscription providers and associated payment methods (such as 
                    "Visa ending in 2254") without compromising your financial security.
                  </p>
                  <p className="text-body-secondary mb-0">
                    Join thousands of satisfied users who have discovered a better way to manage their 
                    subscriptions. Get started with our free plan today and experience the convenience 
                    of having all your subscriptions organized in one secure platform.
                  </p>
                </Col>          </Row>
        </div>
      </div>
    </Layout>
  );
};

export default About

export const Head: HeadFC = () => <title>About - Subosity</title>
