import { AuthManager } from '../utils/supabase';
import { i18n } from '../utils/i18n';
import { PageInitializer } from '../utils/ui';

class LoginController {
  private readonly authManager = new AuthManager();
  private readonly form = document.getElementById('login-form') as HTMLFormElement | null;
  private readonly submitButton = document.getElementById('submit-button') as HTMLButtonElement | null;
  private readonly errorContainer = document.getElementById('error-message');
  private readonly errorText = document.getElementById('error-text');
  private readonly emailInput = document.getElementById('email') as HTMLInputElement | null;
  private readonly passwordInput = document.getElementById('password') as HTMLInputElement | null;

  async init(): Promise<void> {
    this.attachHandlers();
    await this.redirectIfAuthenticated();
  }

  private attachHandlers(): void {
    if (!this.form) {
      console.warn('Login form not found');
      return;
    }

    this.form.addEventListener('submit', async (event) => {
      event.preventDefault();
      await this.handleSubmit();
    });
  }

  private async redirectIfAuthenticated(): Promise<void> {
    try {
      const session = await this.authManager.getCurrentSession();
      if (session) {
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.debug('No active session', error);
    }
  }

  private async handleSubmit(): Promise<void> {
    this.hideError();

    const email = this.emailInput?.value.trim() ?? '';
    const password = this.passwordInput?.value ?? '';

    if (!email || !password) {
      this.showError(i18n.t('errors.validation.required'));
      return;
    }

    this.setLoading(true);

    try {
      await this.authManager.signIn(email, password);
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Login error:', error);
      this.showError(this.getErrorMessage(error));
    } finally {
      this.setLoading(false);
    }
  }

  private setLoading(isLoading: boolean): void {
    if (!this.submitButton) {
      return;
    }

    if (isLoading) {
      this.submitButton.disabled = true;
      this.submitButton.textContent = i18n.t('auth.login.submitting');
      this.submitButton.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
      this.submitButton.disabled = false;
      this.submitButton.textContent = i18n.t('auth.login.submit');
      this.submitButton.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }

  private showError(message: string): void {
    const text = message || i18n.t('errors.auth.general');

    if (this.errorText) {
      this.errorText.textContent = text;
    }

    if (this.errorContainer) {
      this.errorContainer.classList.remove('hidden');
    }
  }

  private hideError(): void {
    if (this.errorContainer) {
      this.errorContainer.classList.add('hidden');
    }

    if (this.errorText) {
      this.errorText.textContent = '';
    }
  }

  private getErrorMessage(error: unknown): string {
    const message = typeof error === 'string'
      ? error
      : error instanceof Error
        ? error.message
        : '';

    const normalized = message.toLowerCase();

    if (normalized.includes('invalid login credentials') || normalized.includes('invalid credentials')) {
      return i18n.t('errors.auth.invalidCredentials');
    }

    if (normalized.includes('email not confirmed')) {
      return i18n.t('errors.auth.emailNotConfirmed');
    }

    if (normalized.includes('too many requests')) {
      return i18n.t('errors.auth.tooManyRequests');
    }

    return message || i18n.t('errors.auth.general');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await PageInitializer.init();

  const controller = new LoginController();
  await controller.init();
});
