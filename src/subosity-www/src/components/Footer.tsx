import { Link } from 'gatsby'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState, useEffect } from 'react'
import React from 'react'

const Footer = () => {
  const [versionInfo, setVersionInfo] = useState<{
    text: string;
    show: boolean;
  }>({
    text: 'Version: (Local Development)',
    show: true
  });

  useEffect(() => {
    fetch('/version.txt')
      .then(response => {
        if (!response.ok) {
          console.debug('Version file not found:', response.status)
          return null
        }
        const contentType = response.headers.get('content-type')
        if (!contentType?.includes('text/plain')) {
          console.debug('Invalid content type:', contentType)
          return null
        }
        return response.text()
      })
      .then(text => {
        if (text?.trim()) {
          setVersionInfo({
            text: `Version: ${text.trim()}`,
            show: true
          })
        }
        // if text is null/empty, keep default state
      })
      .catch((error) => {
        console.debug('Error loading version:', error.message)
        setVersionInfo(prev => ({ ...prev, show: false }))
      })
  }, [])

  return (
    <footer className="footer mt-auto py-3 opacity-75 shadow-sm"
      style={{
        backgroundColor: 'var(--bs-footer-bg)',
        color: 'var(--bs-footer-color)',
        fontSize: '.75em'
      }}>
      <div className="container">
        <div className="d-flex justify-content-center justify-content-lg-between align-items-center">
          <div className="text-center text-lg-start">
            <span className="d-none d-lg-inline">Copyright&nbsp;</span>
            <span>© 2025 Subosity</span>
            <span className="mx-2">|</span>
            <Link to="/terms" className="text-decoration-none">
              Terms
              <span className="d-none d-lg-inline">&nbsp;of Use</span>
            </Link>
            <span className="mx-2">|</span>
            <Link to="/privacy" className="text-decoration-none">
              Privacy
              <span className="d-none d-lg-inline">&nbsp;Policy</span>
            </Link>
            {versionInfo.show && (
              <span className="d-none d-lg-inline">
                <span className="mx-2">|</span>
                <span>{versionInfo.text}</span>
              </span>
            )}
          </div>
          
          <div className="text-end d-flex justify-content-end d-none d-lg-flex">
            <div style={{ transform: 'translateY(0px)' }}>
              <iframe
                src="https://status.subosity.com/badge?theme=dark&style=simple"
                height="30"
                frameBorder={0}
                scrolling="no"
                style={{ 
                  colorScheme: 'normal',
                  border: 'none',
                  display: 'block'
                }}
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
