// Load Bootstrap first, then custom styles
import 'bootstrap/dist/css/bootstrap.min.css';
import './src/styles/global.css';

// Add a loading class to prevent FOUC
export const onClientEntry = () => {
  // Add a loading class to body immediately
  if (typeof document !== 'undefined') {
    document.body.classList.add('loading')
    
    // Remove loading class once DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        // Use requestAnimationFrame to ensure styles are applied
        requestAnimationFrame(() => {
          document.body.classList.remove('loading')
        })
      })
    } else {
      // Document is already loaded
      requestAnimationFrame(() => {
        document.body.classList.remove('loading')
      })
    }
  }
}

export const onRouteUpdate = () => {
  // Add subtle loading state during navigation
  if (typeof document !== 'undefined') {
    document.body.classList.add('loading')
    
    // Remove loading class after a brief moment to allow styles to settle
    requestAnimationFrame(() => {
      setTimeout(() => {
        document.body.classList.remove('loading')
      }, 50) // Shorter delay for navigation
    })
  }
}

export const onInitialClientRender = () => {
  // Final cleanup to ensure no loading state remains
  if (typeof document !== 'undefined') {
    // Double-check that loading class is removed
    setTimeout(() => {
      document.body.classList.remove('loading')
    }, 100)
  }
}