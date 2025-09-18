import { within } from '@testing-library/react'
import type { RenderResult } from '@testing-library/react'
import { expect } from 'vitest'

export const accessibilityHelpers = {
  testKeyboardNavigation: async (
    screen: RenderResult,
    user: any,
    gridSelector: string = '[role="grid"]'
  ) => {
    const grid = screen.getByRole('grid')
    grid.focus()

    const firstTile = within(grid).getAllByRole('gridcell')[0]
    const secondTile = within(grid).getAllByRole('gridcell')[1]

    await user.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(secondTile)

    await user.keyboard('{ArrowLeft}')
    expect(document.activeElement).toBe(firstTile)
  },

  testScreenReaderAnnouncements: (screen: RenderResult) => {
    const announcements = screen.queryAllByRole('status')
    return announcements.length > 0
  },

  testAriaLabels: (screen: RenderResult, expectedLabels: string[]) => {
    expectedLabels.forEach(label => {
      expect(screen.getByLabelText(new RegExp(label, 'i'))).toBeInTheDocument()
    })
  },

  testFocusTrap: async (
    screen: RenderResult,
    user: any,
    modalSelector: string = '[role="dialog"]'
  ) => {
    const modal = screen.getByRole('dialog')
    const focusableElements = within(modal).getAllByRole('button')

    if (focusableElements.length > 1) {
      const firstButton = focusableElements[0]
      const lastButton = focusableElements[focusableElements.length - 1]

      firstButton.focus()
      await user.keyboard('{Shift>}{Tab}{/Shift}')
      expect(document.activeElement).toBe(lastButton)

      lastButton.focus()
      await user.keyboard('{Tab}')
      expect(document.activeElement).toBe(firstButton)
    }
  },

  testColorContrast: (element: HTMLElement) => {
    const computedStyle = window.getComputedStyle(element)
    const backgroundColor = computedStyle.backgroundColor
    const color = computedStyle.color

    return {
      backgroundColor,
      color,
      hasBackground: backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent',
      hasColor: color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent',
    }
  },
}
