import { describe, it, expect, vi } from 'vitest'
import { identifyPlant, diagnosePlant } from './gemini'

// Mock the GoogleGenAI library
vi.mock('@google/genai', () => {
  let callCount = 0
  return {
    GoogleGenAI: class {
      models = {
        generateContent: vi.fn().mockImplementation(() => {
          callCount++
          // First call is identifyPlant, subsequent calls are diagnosePlant
          if (callCount === 1) {
            return Promise.resolve({
              text: JSON.stringify({
                commonName: "Test Plant",
                scientificName: "Testus plantus",
                light: "Bright indirect",
                water: "Weekly",
                toxicity: "Non-toxic",
                careLevel: "Easy",
                description: "A test plant."
              })
            })
          }
          // diagnosePlant call — return based on whether it's the healthy or sick test
          // We use a flag set by the test to control this
          const isSickTest = (globalThis as Record<string, unknown>).__diagnoseSick
          if (isSickTest) {
            return Promise.resolve({
              text: JSON.stringify({
                status: "sick",
                diagnosisName: "Root Rot",
                severity: "high",
                description: "The roots are waterlogged.",
                recoverySteps: ["Repot the plant", "Reduce watering"]
              })
            })
          }
          return Promise.resolve({
            text: JSON.stringify({
              status: "healthy",
              diagnosisName: "Healthy",
              severity: "none",
              description: "This plant looks healthy.",
              recoverySteps: []
            })
          })
        })
      }
    }
  }
})

describe('Gemini API', () => {
  it('identifies plant correctly and parses JSON', async () => {
    process.env.GEMINI_API_KEY = "test"
    const result = await identifyPlant('base64data', 'image/jpeg')
    expect(result.commonName).toBe('Test Plant')
    expect(result.careLevel).toBe('Easy')
  })

  it('diagnoses a healthy plant correctly', async () => {
    process.env.GEMINI_API_KEY = "test";
    (globalThis as Record<string, unknown>).__diagnoseSick = false
    const result = await diagnosePlant('base64data', 'image/jpeg')
    expect(result.status).toBe('healthy')
    expect(result.diagnosisName).toBe('Healthy')
    expect(result.recoverySteps).toEqual([])
  })

  it('diagnoses a sick plant correctly', async () => {
    process.env.GEMINI_API_KEY = "test";
    (globalThis as Record<string, unknown>).__diagnoseSick = true
    const result = await diagnosePlant('base64data', 'image/jpeg')
    expect(result.status).toBe('sick')
    expect(result.diagnosisName).toBe('Root Rot')
    expect(result.severity).toBe('high')
    expect(result.recoverySteps).toContain('Repot the plant')
  })
})
