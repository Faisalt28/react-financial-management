import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo)
    this.setState({ errorInfo })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-neutral-50 dark:bg-black text-foreground">
          <div className="max-w-md w-full p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertTriangle className="size-7" />
            </div>
            <h1 className="text-xl font-bold tracking-tight mb-2 text-zinc-900 dark:text-white">
              Terjadi Kesalahan
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              Aplikasi mengalami kendala teknis tak terduga. Data Anda di perangkat tetap aman.
            </p>

            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <pre className="text-left text-xs bg-zinc-100 dark:bg-zinc-900 p-3 rounded-lg overflow-x-auto text-rose-500 mb-6 max-h-32">
                {this.state.error.toString()}
              </pre>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition-colors"
              >
                <RefreshCw className="size-4" />
                Muat Ulang
              </button>
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                <Home className="size-4" />
                Beranda
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
