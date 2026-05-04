import { Component, type ErrorInfo, type ReactNode } from "react";
import "./AppState.css";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidMount() {
    window.addEventListener("error", this.handleWindowError);
    window.addEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  componentWillUnmount() {
    window.removeEventListener("error", this.handleWindowError);
    window.removeEventListener(
      "unhandledrejection",
      this.handleUnhandledRejection,
    );
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(error, errorInfo);
  }

  private handleWindowError = (event: ErrorEvent) => {
    this.setState({ error: event.error ?? new Error(event.message) });
  };

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const reason =
      event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason));

    this.setState({ error: reason });
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="app auth-page">
        <section className="auth-card error-card">
          <p className="error-card-label">Something went wrong</p>
          <h1>App crashed.</h1>
          <pre>{this.state.error.message}</pre>
          <button type="button" onClick={() => window.location.reload()}>
            Reload
          </button>
        </section>
      </main>
    );
  }
}
