/**
 * Timeout utilities for fetch requests with AbortController
 */

/**
 * Creates an AbortController that automatically aborts after the specified timeout.
 *
 * @param timeoutMs - Timeout in milliseconds
 * @param signalDescription - Description for error messages
 * @returns AbortController with timeout configured
 *
 * @example
 * const controller = createTimeoutController(5000, 'fetch wallet data')
 * fetch(url, { signal: controller.signal })
 */
export function createTimeoutController(
  timeoutMs: number,
  signalDescription: string
): AbortController {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, timeoutMs)

  // Store timeout ID on controller for cleanup
  ;(controller as any)._timeoutId = timeoutId
  ;(controller as any)._signalDescription = signalDescription

  return controller
}

/**
 * Clears the timeout associated with a controller created by createTimeoutController.
 * Call this when the operation completes successfully to prevent unnecessary abort.
 */
export function clearTimeoutController(controller: AbortController): void {
  const timeoutId = (controller as any)._timeoutId
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
}

/**
 * Checks if an error is an AbortError caused by timeout.
 */
export function isTimeoutError(error: unknown): boolean {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return true
  }
  if (error instanceof Error && error.name === 'AbortError') {
    return true
  }
  return false
}

/**
 * Gets a user-friendly error message for a timeout.
 */
export function getTimeoutErrorMessage(signalDescription: string): string {
  return `Request timeout: ${signalDescription} took too long to respond`
}
