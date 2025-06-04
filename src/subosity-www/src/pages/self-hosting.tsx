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

const SelfHosting: React.FC<PageProps> = () => {

    return (
        <Layout>
            <Container className="py-5">
                <div className="text-center mb-5">
                    <h1 className="display-4 mb-3">Self-Hosting</h1>
                    <p className="lead text-body-secondary mb-0">
                        You can self-host Subosity on your own server or cloud provider.
                        <br />
                        If you prefer to use our hosted version, you can sign up at <a href={`${APP_CONFIG.appUrl}/signup`} target="_blank" rel="noopener noreferrer">app.subosity.com</a>.
                            </p>
                        </div>

                        <div className="text-center mt-5">
                            <p className="text-body-secondary mb-0">
                                More to come...
                            </p>
                        </div>
                    </Container>
        </Layout>
    );
};

export default SelfHosting

export const Head: HeadFC = () => <title>Self-Hosting - Subosity</title>
