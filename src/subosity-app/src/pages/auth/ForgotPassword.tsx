import React, { useState } from 'react';
import { Card, Container, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useToast } from '../../ToastContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faAt, faPaperPlane, faRotateRight } from '@fortawesome/free-solid-svg-icons';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast(); // Extract addToast from the context object
  const navigate = useNavigate();

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    console.log('Attempting to send password reset email to:' + email
      + " with redirect to: " + import.meta.env.VITE_BASE_URL + '/change-password');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: import.meta.env.VITE_BASE_URL + '/change-password'
      });
      if (error) {
        setError(error.message);
        addToast(error.message, 'error');
      } else {
        addToast('Check your email for the password reset link.', 'success');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center">
      <Card style={{ width: '100%', maxWidth: '400px', marginTop: '4rem' }} className="shadow">
        <Card.Body>
          <h2 className="text-center mb-4">
            <FontAwesomeIcon icon={faRotateRight} className="me-3" />
            Forgot Password</h2>
          <p className="text-center mb-4 pb-4" style={{ borderBottom: '1px solid #7d7d7d' }}>
            Enter your email address below and we'll send you a link to reset your password.
          </p>
          <Form onSubmit={handleForgotPassword}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email address</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faAt} />
                </InputGroup.Text>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </InputGroup>
            </Form.Group>
            {error && <Alert variant="danger">{error}</Alert>}
            <Button type="submit" className="w-100 mb-3" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Sending...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                  Send Reset Link
                </>
              )}
            </Button>
          </Form>
          <div className="d-flex justify-content-center">
            <Link to="/login" className="text-decoration-none">
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Back to Login
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ForgotPassword;