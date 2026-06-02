import { describe, it, expect, vi } from 'vitest'
import { identifyPlant } from './gemini'

// Mock the GoogleGenAI library
vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      models = {
        generateContent: vi.fn().mockResolvedValue({
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
})
