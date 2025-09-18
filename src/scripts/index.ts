import { AuthManager } from '../utils/supabase';
import { PageInitializer } from '../utils/ui';

const dashboardLinkContainerId = 'dashboard-link';

document.addEventListener('DOMContentLoaded', async () => {
  await PageInitializer.init();

  const authManager = new AuthManager();

  try {
    const session = await authManager.getCurrentSession();

    if (session) {
      const container = document.getElementById(dashboardLinkContainerId);
      container?.classList.remove('hidden');
    }
  } catch (error) {
    console.debug('No active session', error);
  }
});
