import { Revenue, Experiment, Review, Group, User } from '../types';
import { mockRevenues, mockExperiments, mockReviews, mockGroups, mockUser } from './mockData';

const STORAGE_KEYS = {
  revenues: 'revuedesk_revenues',
  experiments: 'revuedesk_experiments',
  reviews: 'revuedesk_reviews',
  groups: 'revuedesk_groups',
  user: 'revuedesk_user'
};

export const storage = {
  getRevenues: (): Revenue[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.revenues);
    if (stored) {
      return JSON.parse(stored);
    }
    localStorage.setItem(STORAGE_KEYS.revenues, JSON.stringify(mockRevenues));
    return mockRevenues;
  },

  setRevenues: (revenues: Revenue[]) => {
    localStorage.setItem(STORAGE_KEYS.revenues, JSON.stringify(revenues));
  },

  getExperiments: (): Experiment[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.experiments);
    if (stored) {
      return JSON.parse(stored);
    }
    localStorage.setItem(STORAGE_KEYS.experiments, JSON.stringify(mockExperiments));
    return mockExperiments;
  },

  setExperiments: (experiments: Experiment[]) => {
    localStorage.setItem(STORAGE_KEYS.experiments, JSON.stringify(experiments));
  },

  getReviews: (): Review[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.reviews);
    if (stored) {
      return JSON.parse(stored);
    }
    localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify(mockReviews));
    return mockReviews;
  },

  setReviews: (reviews: Review[]) => {
    localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify(reviews));
  },

  getGroups: (): Group[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.groups);
    if (stored) {
      return JSON.parse(stored);
    }
    localStorage.setItem(STORAGE_KEYS.groups, JSON.stringify(mockGroups));
    return mockGroups;
  },

  setGroups: (groups: Group[]) => {
    localStorage.setItem(STORAGE_KEYS.groups, JSON.stringify(groups));
  },

  getUser: (): User | null => {
    const stored = localStorage.getItem(STORAGE_KEYS.user);
    if (stored) {
      return JSON.parse(stored);
    }
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(mockUser));
    return mockUser;
  },

  setUser: (user: User) => {
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  }
};
