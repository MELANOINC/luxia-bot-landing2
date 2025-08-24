// Quantum AI integration - Melano Inc Ecosystem
// Provides helper to analyze leads using the Quantum AI service

import { QUANTUM_AI } from '../config.js'

export async function analyzeLeadWithQuantumAI(payload) {
  if (!QUANTUM_AI?.enabled || !QUANTUM_AI.endpoint) return null
  try {
    const res = await fetch(QUANTUM_AI.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: QUANTUM_AI.model,
        lead: payload
      })
    })
    const data = await res.json().catch(() => ({}))
    console.log('Quantum AI analysis', data)
    return data
  } catch (err) {
    console.warn('Quantum AI service unavailable', err)
    return null
  }
}
