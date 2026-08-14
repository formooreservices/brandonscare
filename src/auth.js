import { supabase, isConfigured } from './supabase.js';

export function renderConfigWarning(root) {
  root.innerHTML = `
    <div class="auth-screen">
      <div class="config-warning">
        <strong>Supabase isn't configured yet.</strong><br/><br/>
        Create a <code>.env</code> file (see <code>.env.example</code>) with your
        Supabase project URL and anon key, then restart the dev server / redeploy.
      </div>
    </div>
  `;
}

export function renderAuthScreen(root, { onSignedIn }) {
  let mode = 'signin'; // or 'signup'

  function draw() {
    root.innerHTML = `
      <div class="auth-screen">
        <div class="auth-card">
          <h1>Brandon's Care</h1>
          <p class="sub">${mode === 'signin' ? 'Sign in to your care dashboard.' : 'Create your caregiver account.'}</p>
          <form id="auth-form">
            <div class="field">
              <label for="email">Email</label>
              <input id="email" type="email" required autocomplete="email" />
            </div>
            <div class="field">
              <label for="password">Password</label>
              <input id="password" type="password" required minlength="6" autocomplete="${mode === 'signin' ? 'current-password' : 'new-password'}" />
            </div>
            <button class="btn" type="submit">${mode === 'signin' ? 'Sign in' : 'Sign up'}</button>
            <div class="auth-error" id="auth-error" style="display:none;"></div>
          </form>
          <div class="auth-toggle">
            ${mode === 'signin' ? 'Need an account?' : 'Already have an account?'}
            <button id="mode-toggle">${mode === 'signin' ? 'Sign up' : 'Sign in'}</button>
          </div>
        </div>
      </div>
    `;

    root.querySelector('#mode-toggle').addEventListener('click', () => {
      mode = mode === 'signin' ? 'signup' : 'signin';
      draw();
    });

    root.querySelector('#auth-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = root.querySelector('#email').value.trim();
      const password = root.querySelector('#password').value;
      const errorEl = root.querySelector('#auth-error');
      errorEl.style.display = 'none';

      const submitBtn = e.target.querySelector('button[type="submit"]');
      submitBtn.disabled = true;

      const { error } = mode === 'signin'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

      submitBtn.disabled = false;

      if (error) {
        errorEl.textContent = error.message;
        errorEl.style.display = 'block';
        return;
      }

      if (mode === 'signup') {
        errorEl.style.color = 'var(--sage)';
        errorEl.textContent = 'Account created. If email confirmation is on, check your inbox, then sign in.';
        errorEl.style.display = 'block';
        return;
      }

      onSignedIn();
    });
  }

  draw();
}

export { isConfigured };
