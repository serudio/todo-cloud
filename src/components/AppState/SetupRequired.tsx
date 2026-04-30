import { PanelHeader } from "../Shared/PanelHeader";
import "./AppState.css";

export function SetupRequired() {
  return (
    <main className="app auth-page">
      <section className="auth-card">
        <PanelHeader>setup needed</PanelHeader>
        <h1>Connect Supabase first.</h1>
        <p>
          Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env`, then
          restart `pnpm dev`.
        </p>
      </section>
    </main>
  );
}
