import { PanelHeader } from "../Shared/PanelHeader";
import "./AppState.css";

export function LoadingPage() {
  return (
    <main className="app auth-page">
      <section className="auth-card">
        <PanelHeader>todo cloud</PanelHeader>
        <h1>Loading...</h1>
      </section>
    </main>
  );
}
