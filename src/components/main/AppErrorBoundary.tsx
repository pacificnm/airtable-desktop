import { Component, type ErrorInfo, type ReactNode } from 'react'
import { isDebugEnabled } from '../../lib/env/isDebugEnabled.ts'
import { debugStore } from '../../lib/debug/debugStore.ts'
import { ErrorScreen } from './ErrorScreen.tsx'

export interface AppErrorBoundaryProps {
  children: ReactNode
  variant?: 'full' | 'content'
}

interface State {
  error: Error | null
  componentStack: string | null
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, State> {
  state: State = { error: null, componentStack: null }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error, componentStack: null }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    const componentStack = info.componentStack?.trim() || null
    this.setState({ componentStack })

    if (isDebugEnabled()) {
      debugStore.addError({
        message: error.message,
        source: 'ErrorBoundary',
        stack: [error.stack, componentStack].filter(Boolean).join('\n\n'),
      })
    }

    console.warn('AppErrorBoundary caught:', error, info)
  }

  private handleRetry = (): void => {
    this.setState({ error: null, componentStack: null })
  }

  render(): ReactNode {
    const { error, componentStack } = this.state
    if (error) {
      return (
        <ErrorScreen
          error={error}
          componentStack={componentStack}
          onRetry={this.handleRetry}
          variant={this.props.variant ?? 'full'}
        />
      )
    }
    return this.props.children
  }
}
