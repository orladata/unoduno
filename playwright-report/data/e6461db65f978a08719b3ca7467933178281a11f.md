# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: feedback.spec.ts >> Feedback API >> should reject invalid feedback payload
- Location: e2e\feedback.spec.ts:4:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 422
Received: 404
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test"
  2  | 
  3  | test.describe("Feedback API", () => {
  4  |   test("should reject invalid feedback payload", async ({ request }) => {
  5  |     const response = await request.post("/api/feedback", {
  6  |       data: {
  7  |         // Missing required fields
  8  |         rating: 6, // Invalid rating (must be 1-5)
  9  |       },
  10 |     })
  11 | 
> 12 |     expect(response.status()).toBe(422)
     |                               ^ Error: expect(received).toBe(expected) // Object.is equality
  13 |   })
  14 | 
  15 |   test("should reject feedback for non-existent analysis", async ({ request }) => {
  16 |     const response = await request.post("/api/feedback", {
  17 |       data: {
  18 |         analysisId: "00000000-0000-0000-0000-000000000000",
  19 |         rating: 5,
  20 |         comment: "Test feedback",
  21 |       },
  22 |     })
  23 | 
  24 |     // Should return 404 or similar error
  25 |     expect([404, 422, 500]).toContain(response.status())
  26 |   })
  27 | })
  28 | 
  29 | test.describe("Analysis API", () => {
  30 |   test("should reject invalid YouTube URL", async ({ request }) => {
  31 |     const response = await request.post("/api/chat", {
  32 |       data: {
  33 |         messages: [],
  34 |         data: {
  35 |           youtubeUrl: "https://google.com",
  36 |           language: "pt-BR",
  37 |         },
  38 |       },
  39 |     })
  40 | 
  41 |     expect(response.status()).toBe(422)
  42 |   })
  43 | 
  44 |   test("should reject empty request body", async ({ request }) => {
  45 |     const response = await request.post("/api/chat", {
  46 |       data: {},
  47 |     })
  48 | 
  49 |     expect(response.status()).toBe(422)
  50 |   })
  51 | })
  52 | 
```