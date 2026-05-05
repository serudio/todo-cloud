import { Component, type ErrorInfo, type ReactNode } from "react";
import { Backdrop, Button, Card, CardActions, CardContent, CardHeader, Typography } from "@mui/material";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
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
    window.removeEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(error, errorInfo);
  }

  private handleWindowError = (event: ErrorEvent) => {
    this.setState({ error: event.error ?? new Error(event.message) });
  };

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason instanceof Error ? event.reason : new Error(String(event.reason));

    this.setState({ error: reason });
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <Backdrop open>
        <Card>
          <CardHeader title="Something went wrong" />
          <CardContent>
            <Typography variant="h6">App crashed.</Typography>
            <pre>{this.state.error.message}</pre>
          </CardContent>
          <CardActions>
            <Button variant="contained" onClick={() => window.location.reload()}>
              Reload
            </Button>
          </CardActions>
        </Card>
      </Backdrop>
    );
  }
}
