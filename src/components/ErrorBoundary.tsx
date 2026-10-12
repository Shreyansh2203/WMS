import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      showDetails: false,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('PlantOps Operations Console caught runtime error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetBaseline = () => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  private toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#080a0f] text-[#f3f5f9] flex items-center justify-center p-6 font-sans">
          <div className="max-w-xl w-full bg-[#0c1018] border border-[#1a2336] rounded-xl shadow-2xl p-6 text-left space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded bg-rose-950/40 border border-rose-800 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Industrial Fault Containment
                </span>
                <h2 className="text-lg font-semibold text-white">
                  Operational Console Intercepted a Runtime Exception
                </h2>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              An unexpected software fault was contained by the supervisory boundary. Plant machinery telemetry
              remains safely buffered in memory.
            </p>

            {this.state.error && (
              <div className="p-3 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-rose-300 break-words">
                {this.state.error.name}: {this.state.error.message}
              </div>
            )}

            <div className="pt-2 flex flex-wrap gap-2.5">
              <button
                onClick={this.handleReload}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white text-slate-950 rounded hover:bg-slate-200 transition-colors shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Console</span>
              </button>

              <button
                onClick={this.handleResetBaseline}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-[#161d2d] text-slate-300 border border-[#222e47] rounded hover:bg-[#1e273a] transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Reset Local Session & Recover</span>
              </button>

              <button
                onClick={this.toggleDetails}
                className="flex items-center gap-1 px-3 py-2 text-xs text-slate-400 hover:text-slate-200 ml-auto"
              >
                <span>Diagnostic Trace</span>
                {this.state.showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {this.state.showDetails && this.state.errorInfo && (
              <div className="mt-3 p-3 rounded bg-[#06080c] border border-slate-800 text-[11px] font-mono text-slate-400 max-h-48 overflow-y-auto">
                <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
