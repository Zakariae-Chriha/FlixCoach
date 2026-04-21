import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('App error:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-red-900/30 border border-red-800/30 flex items-center justify-center mx-auto">
            <AlertTriangle size={36} className="text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white mb-2">Etwas ist schiefgelaufen</h1>
            <p className="text-gray-400 text-sm">
              Ein unerwarteter Fehler ist aufgetreten. Bitte laden Sie die Seite neu.
            </p>
          </div>
          {import.meta.env.DEV && this.state.error && (
            <pre className="text-xs text-red-400 bg-dark-800 rounded-xl p-4 text-left overflow-auto max-h-40">
              {this.state.error.toString()}
            </pre>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="btn-primary flex items-center gap-2 px-6">
              <RefreshCw size={16} /> Seite neu laden
            </button>
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.href = '/'; }}
              className="btn-secondary px-6">
              Zur Startseite
            </button>
          </div>
        </div>
      </div>
    );
  }
}
