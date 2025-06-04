import React from "react"
import type { GatsbySSR } from "gatsby"

export const onRenderBody: GatsbySSR["onRenderBody"] = ({ setHeadComponents }) => {
  setHeadComponents([
    React.createElement("link", {
      key: "bootstrap-css",
      rel: "stylesheet",
      href: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css",
      integrity: "sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN",
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
          
          body {
            visibility: visible;
            transition: opacity 0.15s ease-in-out;
          }
          
          /* Critical Bootstrap variables */
          :root {
            --bs-primary: #2c5282;
            --bs-secondary: #718096;
            --bs-body-bg: #ffffff;
            --bs-body-color: #212529;
            --bs-body-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
          }
          
          /* Critical layout styles */
          body {
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
          }
        `
      }
    })
  ])
}
