import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import Cookies from 'js-cookie';
import { useToast } from '../../ToastContext';

const Preferences: React.FC = () => {

  return (
    <>
      <h3 className="mb-0"><i className="fas fa-gear me-2"></i>Preferences</h3>
      <p className="text-muted mb-4" style={{ borderBottom: '#dddddd solid 1px' }}>
        Customize the appearance of the application.
      </p>

      <Container className="mt-5 d-flex justify-content-center">
        <div style={{ width: '100%', maxWidth: '500px' }}>

          <Card>
            <Card.Body>
<p>Under construction...</p>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );
};

export default Preferences;