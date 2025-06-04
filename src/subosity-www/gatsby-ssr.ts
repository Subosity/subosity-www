import React from "react"
import type { GatsbySSR } from "gatsby"

export const onRenderBody: GatsbySSR["onRenderBody"] = ({ setHeadComponents, setPreBodyComponents }) => {
  // Add blocking script to set theme immediately - must run synchronously
  setPreBodyComponents([
    React.createElement("script", {
      key: "theme-blocking-script",
      dangerouslySetInnerHTML: {
        __html: `
          (function() {
            function setTheme() {
              try {
                var theme = localStorage.getItem('subosity-theme') || 'Auto';
                var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                var actualTheme = theme === 'Auto' ? (prefersDark ? 'dark' : 'light') : theme.toLowerCase();
                document.documentElement.setAttribute('data-bs-theme', actualTheme);
                document.body.setAttribute('data-bs-theme', actualTheme);
                
                // Also set class for additional styling hooks
                document.documentElement.className = actualTheme + '-theme';
                
                // Dispatch custom event for components to listen to
                if (typeof window !== 'undefined' && window.dispatchEvent) {
                  window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme: actualTheme } }));
                }
              } catch (e) {
                // Fallback to light theme if there's any error
                document.documentElement.setAttribute('data-bs-theme', 'light');
                document.body.setAttribute('data-bs-theme', 'light');
                document.documentElement.className = 'light-theme';
              }
            }
            
            // Run immediately
            setTheme();
            
            // Also run when DOM is ready (fallback)
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', setTheme);
            }
          })();
        `
      }
    })
  ]);
  
  setHeadComponents([
    React.createElement("link", {
      key: "bootstrap-css",
      rel: "stylesheet",
      href: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css",
      crossOrigin: "anonymous"
    }),
    React.createElement("style", {
      key: "critical-css",
      dangerouslySetInnerHTML: {
        __html: `
          /* Prevent FOUC - High priority inline CSS */
          body.loading {
            visibility: hidden !important;
          }
          
          html, body {
            visibility: visible;
            transition: background-color 0.15s ease-in-out, color 0.15s ease-in-out;
          }
          
          /* Critical Bootstrap variables for both themes */
          :root {
            --bs-primary: #2c5282;
            --bs-secondary: #718096;
            --bs-body-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
          }
          
          /* Light theme variables */
          [data-bs-theme="light"] {
            --bs-body-bg: #ffffff;
            --bs-body-color: #212529;
            --bs-navbar-bg: #dddddd;
            --bs-navbar-color: #212529;
          }
          
          /* Dark theme variables */
          [data-bs-theme="dark"] {
            --bs-body-bg: #212529;
            --bs-body-color: #ffffff;
            --bs-navbar-bg: #495057;
            --bs-navbar-color: #ffffff;
          }
          
          /* Critical layout styles */
          html, body {
            margin: 0;
            font-family: var(--bs-body-font-family);
            font-size: 1rem;
            font-weight: 400;
            line-height: 1.5;
            color: var(--bs-body-color);
            background-color: var(--bs-body-bg);
            -webkit-text-size-adjust: 100%;
            -webkit-tap-highlight-color: transparent;
          }
          
          /* Smooth transitions for navigation */
          .gatsby-focus-wrapper {
            transition: opacity 0.15s ease-in-out;
          }
          
          body.loading .gatsby-focus-wrapper {
            opacity: 0.8;
          }
          
          /* Critical navbar styles to prevent layout shift */
          .navbar {
            position: relative;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            padding: 0.5rem 1rem;
            background-color: var(--bs-navbar-bg);
            color: var(--bs-navbar-color);
          }
          
          /* Ensure theme changes are immediate */
          * {
            transition: background-color 0.15s ease-in-out, color 0.15s ease-in-out, border-color 0.15s ease-in-out;
          }
        `
      }
    }),
    // Open Graph meta tags
    React.createElement("meta", {
      key: "og-title",
      property: "og:title",
      content: "Subosity - Manage Your Subscriptions Smarter"
    }),
    React.createElement("meta", {
      key: "og-description", 
      property: "og:description",
      content: "Track, analyze, and manage all your subscriptions in one place. From streaming services to memberships, never lose track of your recurring payments again."
    }),
    React.createElement("meta", {
      key: "og-image",
      property: "og:image", 
      content: "https://subosity.com/images/social-card.png"
    }),
    React.createElement("meta", {
      key: "og-image-width",
      property: "og:image:width",
      content: "1200"
    }),
    React.createElement("meta", {
      key: "og-image-height", 
      property: "og:image:height",
      content: "630"
    }),
    React.createElement("meta", {
      key: "og-type",
      property: "og:type",
      content: "website"
    }),
    React.createElement("meta", {
      key: "og-url",
      property: "og:url", 
      content: "https://subosity.com"
    }),
    
    // Twitter Card meta tags
    React.createElement("meta", {
      key: "twitter-card",
      name: "twitter:card",
      content: "summary_large_image"
    }),
    React.createElement("meta", {
      key: "twitter-title",
      name: "twitter:title", 
      content: "Subosity - Manage Your Subscriptions Smarter"
    }),
    React.createElement("meta", {
      key: "twitter-description",
      name: "twitter:description",
      content: "Track, analyze, and manage all your subscriptions in one place. From streaming services to memberships, never lose track of your recurring payments again."
    }),
    React.createElement("meta", {
      key: "twitter-image",
      name: "twitter:image",
      content: "https://subosity.com/images/social-card.png"
    }),
  ])
}
