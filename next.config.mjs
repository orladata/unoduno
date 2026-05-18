/** @type {import('next').NextConfig} */
const nextConfig = {
  // ============================================================================
  // SECURITY CONFIGURATION
  // ============================================================================
  
  // Strict mode for React
  reactStrictMode: true,
  
  // Disable x-powered-by header to reduce fingerprinting
  poweredByHeader: false,
  
  // Security headers (complement middleware headers)
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/:path*",
        headers: [
          // Prevent clickjacking
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Prevent MIME sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Referrer policy
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Permissions policy - disable sensitive features
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // HSTS - force HTTPS
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          // DNS prefetch control
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
      {
        // CSP for API routes - more restrictive
        source: "/api/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'none'; frame-ancestors 'none'",
          },
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        ],
      },
    ]
  },
  
  // ============================================================================
  // BUILD CONFIGURATION
  // ============================================================================
  
  typescript: {
    // Enable type checking in production builds
    ignoreBuildErrors: false,
  },
  
  // ============================================================================
  // IMAGE CONFIGURATION
  // ============================================================================
  
  images: {
    // Only allow images from trusted domains
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/vi/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/vi/**",
      },
    ],
    // Disable unoptimized images in production
    unoptimized: process.env.NODE_ENV === "development",
  },
  
  // ============================================================================
  // EXPERIMENTAL FEATURES
  // ============================================================================
  
  // Type-safe routes (moved from experimental in Next.js 16)
  typedRoutes: true,
  
  // ============================================================================
  // REDIRECTS & REWRITES
  // ============================================================================
  
  async redirects() {
    return [
      // Redirect HTTP to HTTPS (backup for HSTS)
      // Note: This is handled by Vercel automatically in production
    ]
  },
}

export default nextConfig
