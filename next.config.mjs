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
          // XSS Protection
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Global Strict Content Security Policy
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://images.unsplash.com https://i.ytimg.com https://img.youtube.com; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vitals.vercel-insights.com; frame-src 'self' https://www.youtube.com; object-src 'none'; base-uri 'self'; form-action 'self';",
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
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
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
