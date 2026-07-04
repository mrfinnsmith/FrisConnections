// Performance tracking utilities for FrisConnections

interface PerformanceMetrics {
  name: string
  duration: number
  timestamp: number
  metadata?: Record<string, unknown>
}

class PerformanceTracker {
  private measurements: Map<string, number> = new Map()
  private metrics: PerformanceMetrics[] = []

  // Start tracking a performance measurement
  start(name: string): void {
    this.measurements.set(name, performance.now())
  }

  // End tracking and record the measurement
  end(name: string, metadata?: Record<string, unknown>): number {
    const startTime = this.measurements.get(name)
    if (!startTime) {
      console.warn(`Performance measurement '${name}' was not started`)
      return 0
    }

    const duration = performance.now() - startTime
    this.measurements.delete(name)

    const metric: PerformanceMetrics = {
      name,
      duration,
      timestamp: Date.now(),
      metadata,
    }

    this.metrics.push(metric)

    // Track in Google Analytics if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'performance_measurement', {
        event_category: 'Performance',
        event_label: name,
        value: Math.round(duration),
        custom_map: {
          duration_ms: duration,
          ...metadata,
        },
      })
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ Performance: ${name} took ${duration.toFixed(2)}ms`, metadata)
    }

    return duration
  }

  // Measure a function execution time
  measure<T>(name: string, fn: () => T, metadata?: Record<string, unknown>): T {
    this.start(name)
    const result = fn()
    this.end(name, metadata)
    return result
  }

  // Measure an async function execution time
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    this.start(name)
    const result = await fn()
    this.end(name, metadata)
    return result
  }

  // Get all recorded metrics
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics]
  }

  // Get metrics for a specific measurement name
  getMetricsFor(name: string): PerformanceMetrics[] {
    return this.metrics.filter(metric => metric.name === name)
  }

  // Clear all recorded metrics
  clear(): void {
    this.metrics = []
    this.measurements.clear()
  }

  // Get average duration for a measurement
  getAverageDuration(name: string): number {
    const relevantMetrics = this.getMetricsFor(name)
    if (relevantMetrics.length === 0) return 0

    const total = relevantMetrics.reduce((sum, metric) => sum + metric.duration, 0)
    return total / relevantMetrics.length
  }
}

// Create global performance tracker instance
export const perf = new PerformanceTracker()

// Game-specific performance tracking functions
export const trackGamePerformance = {
  // Track game initialization
  gameInit: (puzzleId: number) => {
    perf.start('game_initialization')
    return () => perf.end('game_initialization', { puzzle_id: puzzleId })
  },

  // Track tile rendering performance
  tileRender: (tileCount: number) => {
    perf.start('tile_render')
    return () => perf.end('tile_render', { tile_count: tileCount })
  },

  // Track guess submission performance
  guessSubmit: (selectedTiles: string[]) => {
    perf.start('guess_submit')
    return () =>
      perf.end('guess_submit', {
        selected_count: selectedTiles.length,
        tiles: selectedTiles.join(','),
      })
  },
}

// Export types for TypeScript
export type { PerformanceMetrics }
