import { PanelHeader } from "./Shared/PanelHeader";
import "./AppState/AppState.css";

type AuthCardProps = {
  authError: string | null;
  onSignIn: () => void;
};

export function AuthCard({ authError, onSignIn }: AuthCardProps) {
  return (
    <main className="app auth-page">
      <section className="auth-card">
        <PanelHeader>todo cloud</PanelHeader>
        <h1>Sign in to sync your cloud.</h1>
        <p>Use Google to keep your todos available across devices.</p>
        <button className="google-button" type="button" onClick={onSignIn}>
          Continue with Google
        </button>
        {authError ? <p className="error">{authError}</p> : null}
      </section>
    </main>
  );
}
