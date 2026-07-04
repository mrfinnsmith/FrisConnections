export {}

declare global {
  interface Window {
    // Google Analytics gtag. The real gtag is variadic: the first argument is a
    // command ('event', 'config', 'js', ...) followed by command-specific args,
    // so `unknown[]` is the honest upper bound rather than a fake-precise type.
    gtag: (command: string, ...args: unknown[]) => void
  }
}
