import { describe, it, expect, beforeEach } from 'vitest'
import { addDecision, getDecisions, clearDecisions } from '../decision-log-store'

const SCOPE = 'test-option-1'

beforeEach(() => {
  localStorage.clear()
})

describe('decision-log-store', () => {
  it('starts empty for a new scope', () => {
    expect(getDecisions(SCOPE)).toEqual([])
  })

  it('adds a decision with auto-incremented id and timestamp', () => {
    const d = addDecision(SCOPE, {
      title: 'Choose BAR form',
      rationale: 'Better sea views',
      impact: 'Increased ADR potential',
    })
    expect(d.id).toBe(1)
    expect(d.title).toBe('Choose BAR form')
    expect(d.rationale).toBe('Better sea views')
    expect(d.impact).toBe('Increased ADR potential')
    expect(d.timestamp).toBeTruthy()
  })

  it('persists multiple decisions and increments ids', () => {
    addDecision(SCOPE, { title: 'First', rationale: '', impact: '' })
    addDecision(SCOPE, { title: 'Second', rationale: '', impact: '' })
    const all = getDecisions(SCOPE)
    expect(all.length).toBe(2)
    expect(all[0].id).toBe(1)
    expect(all[1].id).toBe(2)
  })

  it('scopes decisions per option', () => {
    addDecision('scope-a', { title: 'A decision', rationale: '', impact: '' })
    addDecision('scope-b', { title: 'B decision', rationale: '', impact: '' })
    expect(getDecisions('scope-a').length).toBe(1)
    expect(getDecisions('scope-b').length).toBe(1)
    expect(getDecisions('scope-a')[0].title).toBe('A decision')
  })

  it('clearDecisions removes all entries for a scope', () => {
    addDecision(SCOPE, { title: 'Temp', rationale: '', impact: '' })
    expect(getDecisions(SCOPE).length).toBe(1)
    clearDecisions(SCOPE)
    expect(getDecisions(SCOPE)).toEqual([])
  })

  it('trims whitespace from inputs', () => {
    const d = addDecision(SCOPE, {
      title: '  padded  ',
      rationale: '  spaces  ',
      impact: '  trimmed  ',
    })
    expect(d.title).toBe('padded')
    expect(d.rationale).toBe('spaces')
    expect(d.impact).toBe('trimmed')
  })

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem('yotel_decisions_corrupt', 'not-json')
    expect(getDecisions('corrupt')).toEqual([])
  })
})
