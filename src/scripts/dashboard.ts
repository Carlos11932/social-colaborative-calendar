import type { User } from '@supabase/supabase-js';
import { AuthManager, type UserProfile } from '../utils/supabase';
import { i18n } from '../utils/i18n';
import { PageInitializer } from '../utils/ui';

class DashboardController {
  private readonly authManager = new AuthManager();
  private user: User | null = null;
  private readonly userNameElement = document.getElementById('user-name');
  private readonly userEmailElement = document.getElementById('user-email');
  private readonly logoutButton = document.getElementById('logout-button');
  private readonly loadingElement = document.getElementById('loading');
  private readonly dashboardElement = document.getElementById('dashboard');
  private readonly errorContainer = document.getElementById('error-message');
  private readonly errorText = document.getElementById('error-text');

  async init(): Promise<void> {
    await this.checkAuthentication();
    this.attachEventListeners();
  }

  private async checkAuthentication(): Promise<void> {
    try {
      const session = await this.authManager.getCurrentSession();

      if (!session) {
        window.location.href = '/login';
        return;
      }

      this.user = session.user;
      await this.populateUserProfile();
      this.showDashboard();
    } catch (error) {
      console.error('Authentication error:', error);
      this.showError(i18n.t('errors.auth.general'));
      window.setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    }
  }

  private async populateUserProfile(): Promise<void> {
    if (!this.user) {
      return;
    }

    try {
      const profile = await this.authManager.getUserProfile(this.user.id);
      this.renderProfile(profile);
    } catch (error) {
      console.warn('Could not load profile:', error);
      this.renderProfileFallback();
    }
  }

  private renderProfile(profile: UserProfile): void {
    if (this.userNameElement && profile.name) {
      this.userNameElement.textContent = profile.name;
    }

    if (this.userEmailElement && profile.email) {
      this.userEmailElement.textContent = profile.email;
    }
  }

  private renderProfileFallback(): void {
    if (!this.user) {
      return;
    }

    if (this.userNameElement && this.user.email) {
      this.userNameElement.textContent = this.user.email.split('@')[0];
    }

    if (this.userEmailElement && this.user.email) {
      this.userEmailElement.textContent = this.user.email;
    }
  }

  private showDashboard(): void {
    if (this.loadingElement) {
      this.loadingElement.classList.add('hidden');
    }

    if (this.dashboardElement) {
      this.dashboardElement.classList.remove('hidden');
    }
  }

  private attachEventListeners(): void {
    if (!this.logoutButton) {
      return;
    }

    this.logoutButton.addEventListener('click', async () => {
      try {
        await this.authManager.signOut();
        window.location.href = '/';
      } catch (error) {
        console.error('Logout error:', error);
        this.showError(i18n.t('errors.auth.general'));
        window.setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      }
    });
  }

  private showError(message: string): void {
    const text = message || i18n.t('errors.auth.general');

    if (this.errorText) {
      this.errorText.textContent = text;
    }

    if (this.errorContainer) {
      this.errorContainer.classList.remove('hidden');
      window.setTimeout(() => {
        this.errorContainer?.classList.add('hidden');
      }, 5000);
    }
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await PageInitializer.init();

  const controller = new DashboardController();
  await controller.init();
});
