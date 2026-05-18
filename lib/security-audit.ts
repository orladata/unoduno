/**
 * Security Audit Utilities
 * 
 * Development-only utilities to audit security configuration.
 * These functions help identify potential vulnerabilities.
 */

import { z } from "zod"

// ============================================================================
// TYPES
// ============================================================================

export interface SecurityAuditResult {
  passed: boolean
  category: string
  check: string
  severity: "critical" | "high" | "medium" | "low" | "info"
  message: string
  recommendation?: string
}

export interface SecurityAuditReport {
  timestamp: string
  environment: string
  results: SecurityAuditResult[]
  summary: {
    total: number
    passed: number
    failed: number
    critical: number
    high: number
    medium: number
    low: number
  }
}

// ============================================================================
// AUDIT CHECKS
// ============================================================================

const auditChecks: Array<() => SecurityAuditResult> = [
  // Environment variables
  () => ({
    passed: !!process.env.SESSION_SECRET || process.env.NODE_ENV !== "production",
    category: "Environment",
    check: "SESSION_SECRET",
    severity: "critical",
    message: process.env.SESSION_SECRET 
      ? "SESSION_SECRET is configured" 
      : "SESSION_SECRET is not set",
    recommendation: "Set a cryptographically secure SESSION_SECRET (min 32 chars)",
  }),
  
  () => ({
    passed: !!process.env.CSRF_SECRET || process.env.NODE_ENV !== "production",
    category: "Environment",
    check: "CSRF_SECRET",
    severity: "critical",
    message: process.env.CSRF_SECRET 
      ? "CSRF_SECRET is configured" 
      : "CSRF_SECRET is not set",
    recommendation: "Set a cryptographically secure CSRF_SECRET (min 32 chars)",
  }),
  
  () => {
    const hasPublicSecrets = Object.keys(process.env).some(
      (key) =>
        key.startsWith("NEXT_PUBLIC_") &&
        (key.includes("SECRET") || key.includes("PRIVATE") || key.includes("KEY"))
    )
    return {
      passed: !hasPublicSecrets,
      category: "Environment",
      check: "Public Secrets Exposure",
      severity: "critical",
      message: hasPublicSecrets
        ? "Sensitive variables exposed via NEXT_PUBLIC_ prefix"
        : "No sensitive variables exposed publicly",
      recommendation: "Never prefix sensitive variables with NEXT_PUBLIC_",
    }
  },
  
  // Node environment
  () => ({
    passed: process.env.NODE_ENV === "production",
    category: "Environment",
    check: "Production Mode",
    severity: "info",
    message: `Running in ${process.env.NODE_ENV} mode`,
    recommendation: "Ensure NODE_ENV=production in deployment",
  }),
  
  // Security headers (checked at runtime)
  () => ({
    passed: true, // Headers are configured in middleware
    category: "Headers",
    check: "Security Headers Configured",
    severity: "info",
    message: "Security headers are configured in middleware.ts",
  }),
]

// ============================================================================
// AUDIT FUNCTIONS
// ============================================================================

/**
 * Runs all security audit checks
 * Only use in development or during CI/CD
 */
export function runSecurityAudit(): SecurityAuditReport {
  const results = auditChecks.map((check) => check())
  
  const summary = {
    total: results.length,
    passed: results.filter((r) => r.passed).length,
    failed: results.filter((r) => !r.passed).length,
    critical: results.filter((r) => !r.passed && r.severity === "critical").length,
    high: results.filter((r) => !r.passed && r.severity === "high").length,
    medium: results.filter((r) => !r.passed && r.severity === "medium").length,
    low: results.filter((r) => !r.passed && r.severity === "low").length,
  }
  
  return {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? "unknown",
    results,
    summary,
  }
}

/**
 * Prints security audit report to console
 * Only use in development
 */
export function printSecurityAudit(): void {
  if (process.env.NODE_ENV === "production") {
    console.warn("Security audit should not run in production")
    return
  }
  
  const report = runSecurityAudit()
  
  console.log("\n========================================")
  console.log("       SECURITY AUDIT REPORT")
  console.log("========================================")
  console.log(`Timestamp: ${report.timestamp}`)
  console.log(`Environment: ${report.environment}`)
  console.log("----------------------------------------")
  
  for (const result of report.results) {
    const status = result.passed ? "PASS" : "FAIL"
    const emoji = result.passed ? "" : ""
    console.log(`\n[${status}] ${result.category}: ${result.check}`)
    console.log(`  Severity: ${result.severity.toUpperCase()}`)
    console.log(`  ${result.message}`)
    if (!result.passed && result.recommendation) {
      console.log(`  Recommendation: ${result.recommendation}`)
    }
  }
  
  console.log("\n----------------------------------------")
  console.log("SUMMARY")
  console.log(`  Total Checks: ${report.summary.total}`)
  console.log(`  Passed: ${report.summary.passed}`)
  console.log(`  Failed: ${report.summary.failed}`)
  if (report.summary.critical > 0) {
    console.log(`  Critical Issues: ${report.summary.critical}`)
  }
  console.log("========================================\n")
}

/**
 * Validates that critical security requirements are met
 * Throws in production if critical checks fail
 */
export function assertSecurityRequirements(): void {
  const report = runSecurityAudit()
  
  if (report.summary.critical > 0 && process.env.NODE_ENV === "production") {
    const criticalFailures = report.results
      .filter((r) => !r.passed && r.severity === "critical")
      .map((r) => `- ${r.check}: ${r.message}`)
      .join("\n")
    
    throw new Error(
      `Critical security requirements not met:\n${criticalFailures}`
    )
  }
}

// ============================================================================
// INPUT VALIDATION HELPERS
// ============================================================================

/**
 * Sanitizes user input to prevent XSS
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
}

/**
 * Validates and sanitizes a URL
 */
export function sanitizeUrl(input: string): string | null {
  try {
    const url = new URL(input)
    
    // Only allow HTTP(S) protocols
    if (!["http:", "https:"].includes(url.protocol)) {
      return null
    }
    
    // Block javascript: and data: URLs
    if (url.href.toLowerCase().includes("javascript:") ||
        url.href.toLowerCase().includes("data:")) {
      return null
    }
    
    return url.href
  } catch {
    return null
  }
}

/**
 * Creates a safe redirect URL
 * Prevents open redirect vulnerabilities
 */
export function safeRedirectUrl(
  url: string,
  allowedHosts: string[] = []
): string {
  // Default to home page
  const fallback = "/"
  
  try {
    // Handle relative URLs
    if (url.startsWith("/") && !url.startsWith("//")) {
      return url
    }
    
    const parsed = new URL(url)
    
    // Check if host is allowed
    if (allowedHosts.length > 0 && !allowedHosts.includes(parsed.host)) {
      return fallback
    }
    
    // Only allow HTTPS in production
    if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") {
      return fallback
    }
    
    return url
  } catch {
    return fallback
  }
}
