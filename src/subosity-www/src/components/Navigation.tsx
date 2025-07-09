import React, { useState, useEffect } from 'react'
import { Link } from 'gatsby'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faSun,
    faMoon,
    faCircleHalfStroke,
    faUser,
    faGear,
    faPalette,
    faHandHoldingDollar,
    faHome,
    faBell,
    faDashboard,
    faTags,
    faUserPlus,
    faSignIn,
    faInfoCircle,
    faCalendar,
    faCirclePlay,
    faServer,
    faCheck
} from '@fortawesome/free-solid-svg-icons'
import { APP_CONFIG } from '../config'
import { useTheme } from '../ThemeContext'
import { Button, Dropdown, Navbar, Nav, Container } from 'react-bootstrap'

const Navigation: React.FC = () => {
    const { theme, setTheme } = useTheme();
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = theme === 'Dark' || (theme === 'Auto' && prefersDark);
        setIsDarkMode(isDark);
    }, [theme]);

    return (
        <Navbar expand="lg" className={`navbar-${isDarkMode ? 'dark' : 'light'} bg-${isDarkMode ? 'dark' : 'light'}`}>
            <Container>
                <Navbar.Brand as={Link} to="/" className="navbar-brand d-flex align-items-center">
                    <img src="/images/logo.png" className="me-2" style={{ height: '32px' }} />
                    <span>Subosity</span>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="navbar-nav" />

                <Navbar.Collapse id="navbar-nav">
                    <Nav className="me-auto navbar-nav">
                        <Nav.Link as={Link} to="/">
                            <FontAwesomeIcon icon={faHome} className="me-2" />
                            Home
                        </Nav.Link>

                        <>
                            {/* <Nav.Link as={Link} to="/pricing">
                                <FontAwesomeIcon icon={faTags} className="me-2" />
                                Pricing
                            </Nav.Link>
                            <Nav.Link as={Link} to="/self-hosting">
                                <FontAwesomeIcon icon={faServer} className="me-2" />
                                Self-Hosting
                            </Nav.Link> */}
                            <Nav.Link as={Link} to="/about">
                                <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                                About
                            </Nav.Link>
                        </>

                    </Nav>

                    <Nav className="navbar-nav d-flex align-items-center">

                        <Button
                            variant="primary"
                            as="a"
                            href={`${APP_CONFIG.appUrl}/signup`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="me-2"
                        >
                            <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                            Get Started
                        </Button>

                        <Dropdown align="end">
                            <Dropdown.Toggle 
                                variant="outline-secondary" 
                                size="sm"
                                id="theme-dropdown"
                                className="border-0 p-2"
                                style={{ 
                                    minWidth: 'auto',
                                    background: 'transparent',
                                    border: 'none !important',
                                    boxShadow: 'none'
                                }}
                            >
                                <FontAwesomeIcon 
                                    icon={theme === 'Light' ? faSun : theme === 'Dark' ? faMoon : faCircleHalfStroke} 
                                    size="lg"
                                    title={`Current theme: ${theme}`}
                                />
                            </Dropdown.Toggle>

                            <Dropdown.Menu align="end" className="shadow-sm">
                                <Dropdown.Header className="text-muted small">Theme</Dropdown.Header>
                                <Dropdown.Item 
                                    onClick={() => setTheme('Auto')}
                                    active={theme === 'Auto'}
                                    className="d-flex align-items-center"
                                >
                                    <FontAwesomeIcon icon={faCircleHalfStroke} className="me-2" fixedWidth />
                                    Auto
                                    {theme === 'Auto' && (
                                        <FontAwesomeIcon icon={faCheck} className="ms-auto text-success" />
                                    )}
                                </Dropdown.Item>
                                <Dropdown.Item 
                                    onClick={() => setTheme('Light')}
                                    active={theme === 'Light'}
                                    className="d-flex align-items-center"
                                >
                                    <FontAwesomeIcon icon={faSun} className="me-2" fixedWidth />
                                    Light
                                    {theme === 'Light' && (
                                        <FontAwesomeIcon icon={faCheck} className="ms-auto text-success" />
                                    )}
                                </Dropdown.Item>
                                <Dropdown.Item 
                                    onClick={() => setTheme('Dark')}
                                    active={theme === 'Dark'}
                                    className="d-flex align-items-center"
                                >
                                    <FontAwesomeIcon icon={faMoon} className="me-2" fixedWidth />
                                    Dark
                                    {theme === 'Dark' && (
                                        <FontAwesomeIcon icon={faCheck} className="ms-auto text-success" />
                                    )}
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                    </Nav>
                </Navbar.Collapse>
            </Container>

        </Navbar>
    );
};

export default Navigation
