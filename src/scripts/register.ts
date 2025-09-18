import { AuthManager } from '../utils/supabase';
import { i18n } from '../utils/i18n';
import { PageInitializer } from '../utils/ui';

class RegisterController {
  private readonly authManager = new AuthManager();
  private readonly form = document.getElementById('register-form') as HTMLFormElement | null;
  private readonly submitButton = document.getElementById('submit-button') as HTMLButtonElement | null;
  private readonly errorContainer = document.getElementById('error-message');
  private readonly errorText = document.getElementById('error-text');
  private readonly successContainer = document.getElementById('success-message');
  private readonly successText = document.getElementById('success-text');
  private readonly nameInput = document.getElementById('name') as HTMLInputElement | null;
  private readonly emailInput = document.getElementById('email') as HTMLInputElement | null;
  private readonly passwordInput = document.getElementById('password') as HTMLInputElement | null;

  async init(): Promise<void> {
    this.attachHandlers();
    await this.redirectIfAuthenticated();
  }

  private attachHandlers(): void {
    if (!this.form) {
      console.warn('Register form not found');
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
    this.hideMessages();

    const name = this.nameInput?.value.trim() ?? '';
    const email = this.emailInput?.value.trim() ?? '';
    const password = this.passwordInput?.value ?? '';

    if (!name || !email || !password) {
      this.showError(i18n.t('errors.validation.required'));
      return;
    }

    if (password.length < 6) {
      this.showError(i18n.t('errors.validation.passwordLength'));
      return;
    }

    this.setLoading(true);

    try {
      await this.authManager.signUp(email, password, name);
      this.showSuccess(i18n.t('auth.register.success'));

      window.setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
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
      this.submitButton.textContent = i18n.t('auth.register.submitting');
      this.submitButton.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
      this.submitButton.disabled = false;
      this.submitButton.textContent = i18n.t('auth.register.submit');
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

  private showSuccess(message: string): void {
    const text = message || i18n.t('common.success');

    if (this.successText) {
      this.successText.textContent = text;
    }

    if (this.successContainer) {
      this.successContainer.classList.remove('hidden');
    }
  }

  private hideMessages(): void {
    if (this.errorContainer) {
      this.errorContainer.classList.add('hidden');
    }
    if (this.errorText) {
      this.errorText.textContent = '';
    }
    if (this.successContainer) {
      this.successContainer.classList.add('hidden');
    }
    if (this.successText) {
      this.successText.textContent = '';
    }
  }

  private getErrorMessage(error: unknown): string {
    const message = typeof error === 'string'
      ? error
      : error instanceof Error
        ? error.message
        : '';

    const normalized = message.toLowerCase();

    if (normalized.includes('already registered') || normalized.includes('already exists')) {
      return i18n.t('errors.auth.emailExists');
    }

    if (normalized.includes('invalid email')) {
      return i18n.t('errors.auth.invalidCredentials');
    }

    if (normalized.includes('weak password')) {
      return i18n.t('errors.auth.weakPassword');
    }

    return message || i18n.t('errors.auth.general');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await PageInitializer.init();

  const controller = new RegisterController();
  await controller.init();
});
