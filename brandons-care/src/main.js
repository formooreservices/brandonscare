import './style.css';
import { supabase, isConfigured } from './supabase.js';
import { renderAuthScreen, renderConfigWarning } from './auth.js';
import { renderApp } from './app.js';

const root = document.getElementById('app');

async function boot() {
  if (!isConfigured) {
    renderConfigWarning(root);
    return;
  }

  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    renderApp(root);
  } else {
    renderAuthScreen(root, { onSignedIn: () => renderApp(root) });
  }

  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') {
      renderAuthScreen(root, { onSignedIn: () => renderApp(root) });
    }
  });
}

boot();
