import type { GatsbyConfig } from "gatsby"

const config: GatsbyConfig = {
  siteMetadata: {
    title: `Subosity`,
    description: `Subscription management platform`,
    siteUrl: `https://subosity.com`,
  },
  // More easily incorporate content into your pages through automatic TypeScript type generation and better GraphQL IntelliSense.
  // If you use VSCode you can also use the GraphQL plugin
  // Learn more at: https://gatsby.dev/graphql-typegen
  graphqlTypegen: true,
  plugins: [
    // PostCSS for Tailwind and other CSS processing
    `gatsby-plugin-postcss`,
    // Styled components for better CSS-in-JS support
    {
      resolve: `gatsby-plugin-styled-components`,
      options: {
        displayName: process.env.NODE_ENV !== 'production',
        fileName: false,
      },
    },
    // PWA manifest
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Subosity`,
        short_name: `Subosity`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#2c5282`,
        display: `minimal-ui`,
        icon: `static/images/logo.png`,
        cache_busting_mode: 'none',
      },
    },
  ],
}

export default config
