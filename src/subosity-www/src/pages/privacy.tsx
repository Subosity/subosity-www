import React from 'react';
import { Container, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShieldHeart, 
  faUserShield, 
  faDownload, 
  faTrash,
  faLock
} from '@fortawesome/free-solid-svg-icons';
import type { HeadFC, PageProps } from "gatsby"
import Layout from '../components/Layout';

const Privacy: React.FC<PageProps> = () => {
  return (
    <Layout>
      <Container className="py-4">
            <div className="mb-4">
              <h1 className="mb-2">
                <FontAwesomeIcon icon={faShieldHeart} className="me-2" />
                Privacy Policy
              </h1>
              <p className="text-muted mb-0">
                Last updated: January 2024
              </p>
            </div>

            <Card className="shadow-sm">
              <Card.Body>
                <section className="mb-4">
                  <h5>Our Privacy Commitment</h5>
                  <p>
                    At Subosity, we believe in complete transparency about how we handle your data. 
                    Our approach is simple: collect only what's necessary, protect it rigorously, 
                    and give you full control over your information.
                  </p>
                </section>

                <section className="mb-4">
                  <h5>
                    <FontAwesomeIcon icon={faUserShield} className="me-2" />
                    Data Collection and Usage
                  </h5>
                  <p>
                    We collect only the minimum information needed to provide our subscription management service:
                  </p>
                  <ul>
                    <li>Your email address (for account authentication)</li>
                    <li>Subscription details you choose to track</li>
                    <li>Payment method identifiers (last 4 digits only)</li>
                    <li>Your preferences and settings</li>
                  </ul>
                  <p>
                    We explicitly do <strong>not</strong> collect:
                  </p>
                  <ul>
                    <li>Full credit card numbers</li>
                    <li>Bank account information</li>
                    <li>Personal identification documents</li>
                    <li>Location data</li>
                    <li>Browsing history outside our app</li>
                  </ul>
                </section>

                <section className="mb-4">
                  <h5>
                    <FontAwesomeIcon icon={faLock} className="me-2" />
                    Data Protection
                  </h5>
                  <p>
                    Your data security is our priority:
                  </p>
                  <ul>
                    <li>All data is encrypted in transit and at rest</li>
                    <li>We use industry-standard security practices</li>
                    <li>Regular security audits and updates</li>
                    <li>Strict access controls and monitoring</li>
                  </ul>
                </section>

                <section className="mb-4">
                  <h5>
                    <FontAwesomeIcon icon={faDownload} className="me-2" />
                    Your Data Control
                  </h5>
                  <p>
                    You have complete control over your data:
                  </p>
                  <ul>
                    <li>Download your complete data anytime from your account settings</li>
                    <li>Update or correct your information at any time</li>
                    <li>Choose what information to share and track</li>
                    <li>Opt in/out of email notifications</li>
                  </ul>
                </section>

                <section className="mb-4">
                  <h5>
                    <FontAwesomeIcon icon={faTrash} className="me-2" />
                    Data Deletion
                  </h5>
                  <p>
                    When you request account deletion:
                  </p>
                  <ul>
                    <li>Your data is immediately removed from our active systems</li>
                    <li>Your account becomes permanently inaccessible</li>
                    <li>All active user data is permanently erased</li>
                  </ul>
                  <p>
                    For system integrity and disaster recovery purposes, encrypted backups of our systems 
                    are maintained for several months. While your deleted data may exist within these 
                    secured backups, they are:
                  </p>
                  <ul>
                    <li>Fully encrypted and access-restricted</li>
                    <li>Used only for system recovery purposes</li>
                    <li>Automatically purged as backup retention periods expire</li>
                    <li>Never used to restore individual user accounts or data</li>
                  </ul>
                </section>

                <section>
                  <h5>Our Business Model</h5>
                  <p>
                    We are committed to never selling, renting, or sharing your data with third parties. 
                    Our business model is straightforward: we provide a subscription management service 
                    and generate revenue through premium subscriptions, not through data monetization.
                  </p>
                  <p className="mb-0">
                    If you have any questions about our privacy practices, please contact us 
                    at <a href="mailto:privacy@subosity.com">privacy@subosity.com</a>.
                  </p>
                </section>
              </Card.Body>          </Card>
        </Container>
    </Layout>
  );
};

export default Privacy

export const Head: HeadFC = () => <title>Privacy Policy - Subosity</title>
