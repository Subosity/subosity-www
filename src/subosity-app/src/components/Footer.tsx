import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle, faShieldAlt, faGavel } from '@fortawesome/free-solid-svg-icons'

const Footer = () => {
  return (
    <footer className="footer mt-auto py-3" style={{ backgroundColor: 'var(--bs-footer-bg)', color: 'var(--bs-footer-color)' }}>
      <div className="container">
        <div className="row">
          <div className="col-12 col-md-4 mb-3 mb-md-0 text-center text-md-start">
            <Link to="/about" className="text-decoration-none" style={{ color: 'var(--bs-footer-color)' }}>
              <FontAwesomeIcon icon={faInfoCircle} className="me-2" />About Us
            </Link>
          </div>
          <div className="col-12 col-md-4 mb-3 mb-md-0 text-center">
            <Link to="/privacy" className="text-decoration-none" style={{ color: 'var(--bs-footer-color)' }}>
              <FontAwesomeIcon icon={faShieldAlt} className="me-2" />Privacy Policy
            </Link>
          </div>
          <div className="col-12 col-md-4 text-center text-md-end">
            <Link to="/terms" className="text-decoration-none" style={{ color: 'var(--bs-footer-color)' }}>
              <FontAwesomeIcon icon={faGavel} className="me-2" />Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer