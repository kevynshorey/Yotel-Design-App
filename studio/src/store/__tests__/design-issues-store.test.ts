import { describe, it, expect, beforeEach } from 'vitest'
import {
  addIssue,
  getIssues,
  toggleIssueStatus,
  clearIssues,
} from '../design-issues-store'

const SCOPE = 'test-option-1'

beforeEach(() => {
  localStorage.clear()
})

describe('design-issues-store', () => {
  it('starts empty for a new scope', () => {
    expect(getIssues(SCOPE)).toEqual([])
  })

  it('adds an issue with open status by default', () => {
    const issue = addIssue(SCOPE, {
      title: 'Coverage too high',
      detail: '48% exceeds 45% limit',
      priority: 'high',
    })
    expect(issue.id).toBe(1)
    expect(issue.status).toBe('open')
    expect(issue.priority).toBe('high')
    expect(issue.timestamp).toBeTruthy()
  })

  it('persists multiple issues with incrementing ids', () => {
    addIssue(SCOPE, { title: 'Issue A', detail: '', priority: 'medium' })
    addIssue(SCOPE, { title: 'Issue B', detail: '', priority: 'low' })
    const all = getIssues(SCOPE)
    expect(all.length).toBe(2)
    expect(all[0].id).toBe(1)
    expect(all[1].id).toBe(2)
  })

  it('toggles issue status between open and resolved', () => {
    addIssue(SCOPE, { title: 'Toggle me', detail: '', priority: 'medium' })
    let toggled = toggleIssueStatus(SCOPE, 1)
    expect(toggled?.status).toBe('resolved')

    toggled = toggleIssueStatus(SCOPE, 1)
    expect(toggled?.status).toBe('open')
  })

  it('returns null when toggling non-existent issue', () => {
    expect(toggleIssueStatus(SCOPE, 999)).toBeNull()
  })

  it('scopes issues per option', () => {
    addIssue('scope-a', { title: 'A issue', detail: '', priority: 'high' })
    addIssue('scope-b', { title: 'B issue', detail: '', priority: 'low' })
    expect(getIssues('scope-a').length).toBe(1)
    expect(getIssues('scope-b').length).toBe(1)
  })

  it('clearIssues removes all entries for a scope', () => {
    addIssue(SCOPE, { title: 'Temp', detail: '', priority: 'low' })
    clearIssues(SCOPE)
    expect(getIssues(SCOPE)).toEqual([])
  })

  it('trims whitespace from title and detail', () => {
    const issue = addIssue(SCOPE, {
      title: '  padded  ',
      detail: '  detail  ',
      priority: 'medium',
    })
    expect(issue.title).toBe('padded')
    expect(issue.detail).toBe('detail')
  })

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem('yotel_issues_corrupt', '{broken')
    expect(getIssues('corrupt')).toEqual([])
  })
})
