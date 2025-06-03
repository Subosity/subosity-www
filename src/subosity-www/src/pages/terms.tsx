import React from 'react';
import { Container, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGavel } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'gatsby';
import type { HeadFC, PageProps } from "gatsby"
import Layout from '../components/Layout';

const Terms: React.FC<PageProps> = () => {
  return (
    <Layout>
      <Container className="py-4">
        <div className="mb-4">
          <h1 className="mb-2">
            <FontAwesomeIcon icon={faGavel} className="me-2" />
            Terms of Use
          </h1>
          <p className="text-muted mb-0">
            Last updated: January 2025
          </p>
        </div>

        <Card className="shadow-sm">
          <Card.Body>
            <section className="mb-4">
              <h5>1. Acceptance of Terms</h5>
              <p>
                By accessing or using Subosity, you agree to be bound by these Terms of Use. If you disagree with any part of these terms, you do not have permission to access the service.
              </p>
            </section>

            <section className="mb-4">
              <h5>2. Description of Service</h5>
              <p>
                Subosity provides subscription management tools and services. We help users track, manage, and analyze their subscription services and recurring payments.
              </p>
            </section>

            <section className="mb-4">
              <h5>3. Privacy and Data Protection</h5>
              <p>
                We prioritize the protection of your personal information. We do not sell, rent, or share your personal data with third parties. For complete details, please review our <Link to="/privacy" className="text-decoration-none">Privacy Policy</Link>.
              </p>
            </section>

            <section className="mb-4">
              <h5>4. User Responsibilities</h5>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
              </p>
            </section>

            <section className="mb-4">
              <h5>5. Service Modifications</h5>
              <p>
                We reserve the right to modify or discontinue, temporarily or permanently, the service with or without notice. We shall not be liable for any modification, suspension, or discontinuance of the service.
              </p>
            </section>

            <section className="mb-4">
              <h5>6. Limitation of Liability</h5>
              <p>
                Subosity and its suppliers shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
              </p>
            </section>

            <section className="mb-4">
              <h5>7. Dispute Resolution</h5>
              <p>
                Any dispute arising from these terms or the service shall be resolved through binding arbitration rather than in court. The arbitration shall be conducted in accordance with the rules of the American Arbitration Association.
              </p>
            </section>

            <section className="mb-4">
              <h5>8. Termination</h5>
              <p>
                We reserve the right to terminate or suspend your account and access to the service immediately, without prior notice or liability, for any reason, including breach of these Terms.
              </p>
            </section>

            <section>
              <h5>9. Contact Information</h5>
              <p className="mb-0">
                If you have any questions about these Terms, please contact us at support@subosity.com.
              </p>
            </section>
          </Card.Body>
        </Card>
      </Container>
    </Layout>
  );
};

export default Terms

export const Head: HeadFC = () => <title>Terms of Use - Subosity</title>
