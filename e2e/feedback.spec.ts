import { test, expect } from "@playwright/test"

test.describe("Feedback API", () => {
  test("should reject invalid feedback payload", async ({ request }) => {
    const response = await request.post("/api/feedback", {
      data: {
        // Missing required fields
        rating: 6, // Invalid rating (must be 1-5)
      },
    })

    expect(response.status()).toBe(422)
  })

  test("should reject feedback for non-existent analysis", async ({ request }) => {
    const response = await request.post("/api/feedback", {
      data: {
        analysisId: "00000000-0000-0000-0000-000000000000",
        rating: 5,
        comment: "Test feedback",
      },
    })

    // Should return 404 or similar error
    expect([404, 422, 500]).toContain(response.status())
  })
})

test.describe("Analysis API", () => {
  test("should reject invalid YouTube URL", async ({ request }) => {
    const response = await request.post("/api/chat", {
      data: {
        messages: [],
        data: {
          youtubeUrl: "https://google.com",
          language: "pt-BR",
        },
      },
    })

    expect(response.status()).toBe(422)
  })

  test("should reject empty request body", async ({ request }) => {
    const response = await request.post("/api/chat", {
      data: {},
    })

    expect(response.status()).toBe(422)
  })
})
