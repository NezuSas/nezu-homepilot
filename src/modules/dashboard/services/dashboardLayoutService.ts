import { DashboardLayout } from '../types/layout';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class DashboardLayoutService {
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  async getLayout(): Promise<DashboardLayout | null> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        console.warn('No auth token found, skipping layout fetch');
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/dashboard-layout/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch dashboard layout:', response.status);
        return null;
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching dashboard layout:', error);
      return null;
    }
  }

  async saveLayout(layout: DashboardLayout['layout'], cards: DashboardLayout['cards']): Promise<DashboardLayout | null> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        console.error('No auth token found');
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/dashboard-layout/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ layout, cards }),
      });

      if (!response.ok) {
        console.error('Failed to save dashboard layout:', response.status);
        return null;
      }

      return response.json();
    } catch (error) {
      console.error('Error saving dashboard layout:', error);
      return null;
    }
  }
}

export const dashboardLayoutService = new DashboardLayoutService();
