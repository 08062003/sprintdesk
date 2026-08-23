import type { MockData } from '../types';
import mockData from '../data/mock-data.json';
import { api } from './apiClient';

// Local API Service for mock data
export const localApi = {
  async getMockData(): Promise<MockData> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockData as MockData;
  },

  async getUsers() {
    const data = await this.getMockData();
    return data.users;
  },

  async getSprints() {
    const data = await this.getMockData();
    return data.sprints;
  },

  async getTasks() {
    const data = await this.getMockData();
    return data.tasks;
  },

  async getComments() {
    const data = await this.getMockData();
    return data.comments;
  },

  async getNotifications() {
    const data = await this.getMockData();
    return data.notifications;
  }
};

// DummyJSON Auth Service (using api client for authenticated requests)
export const authService = {
  async getCurrentUser() {
    const response = await api.get('https://dummyjson.com/auth/me');
    
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    
    return response.json();
  }
};

// JSONPlaceholder Notifications Service (Polling)
export const notificationsService = {
  async getPosts() {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }
    return response.json();
  }
};
