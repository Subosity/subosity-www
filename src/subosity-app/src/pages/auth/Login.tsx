import React, { useState, FormEvent } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Card, Container, Form, Button, Alert } from 'react-bootstrap';
import { AuthError } from '@supabase/supabase-js';
import { supabase } from '../../supabaseClient';
import { useToast } from '../../ToastContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotateRight, faSignIn, faSignInAlt, faUserPlus } from '@fortawesome/free-solid-svg-icons';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setError(error.message);
        addToast('Login failed', 'error');
      } else {
        addToast('Successfully logged in', 'success');
        // Get returnUrl from query params
        const params = new URLSearchParams(location.search);
        const returnUrl = params.get('returnUrl');
        
        if (returnUrl) {
          navigate(decodeURIComponent(returnUrl));
        } else {
          navigate('/dashboard'); // Default redirect
        }
      }
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message);
      addToast('An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center">
      <Card style={{ width: '100%', maxWidth: '400px', marginTop: '4rem' }}>
        <Card.Body>
          <h1 className="text-center mb-4">
            <FontAwesomeIcon icon={faSignIn} className="me-3" />
            Login</h1>
          <p className="text-center mb-4 pb-4" style={{ borderBottom: '1px solid #7d7d7d' }}>
            Please enter your email and password to log in. If you don't have an account, you can sign up.
          </p>
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            {error && <Alert variant="danger">{error}</Alert>}
            <Button type="submit" className="w-100 mb-3" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Logging in...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
                  Login
                </>
              )}
            </Button>
          </Form>
          <div className="d-flex justify-content-between pt-2" style={{ borderTop: '1px solid #7d7d7d' }}>
            <Link to="/forgot-password" className="text-decoration-none">
              <FontAwesomeIcon icon={faRotateRight} className="me-2" />
              Forgot password?
            </Link>
            <Link to="/signup" className="text-decoration-none">
              <FontAwesomeIcon icon={faUserPlus} className="me-2" />
              Sign Up
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;