import React, { useState, useEffect } from 'react'
import md5 from 'md5'
import { Link } from 'react-router-dom'
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
    faCirclePlay
} from '@fortawesome/free-solid-svg-icons'
import { useTheme } from '../ThemeContext'
import { Button, Dropdown, Navbar, Nav, Container } from 'react-bootstrap'
import { Theme } from 'react-select'

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
                    <img src="/favicon.svg" className="me-2" style={{ height: '22px' }} />
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
                            <Nav.Link as={Link} to="/pricing">
                                <FontAwesomeIcon icon={faTags} className="me-2" />
                                Pricing
                            </Nav.Link>
                            <Nav.Link as={Link} to="/about">
                                <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                                About
                            </Nav.Link>
                        </>

                    </Nav>

                    <Nav className="navbar-nav d-flex align-items-center">

                    <Button
                            variant="primary"
                            onClick={() => window.location.href = import.meta.env.VITE_APP_URL}
                        >
                            <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                            Get Started
                        </Button>

                    </Nav>
                </Navbar.Collapse>
            </Container>

        </Navbar>
    );
};

export default Navigation