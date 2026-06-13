import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Revenue, Experiment, Review, Group, User, FilterState, Member } from '../types';
import { storage } from '../services/storage';

interface NavigationContext {
  fromGroups: boolean;
  fromReview: boolean;
  groupId?: string;
  reviewId?: string;
}

interface AppState {
  user: User | null;
  viewingAs: Member | null;
  navigationContext: NavigationContext;
  revenues: Revenue[];
  experiments: Experiment[];
  reviews: Review[];
  groups: Group[];
  filters: FilterState;
  isLoading: boolean;
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_VIEWING_AS'; payload: Member | null }
  | { type: 'SET_NAVIGATION_CONTEXT'; payload: NavigationContext }
  | { type: 'SET_REVENUES'; payload: Revenue[] }
  | { type: 'ADD_REVENUE'; payload: Revenue }
  | { type: 'UPDATE_REVENUE'; payload: Revenue }
  | { type: 'DELETE_REVENUE'; payload: string }
  | { type: 'SET_EXPERIMENTS'; payload: Experiment[] }
  | { type: 'ADD_EXPERIMENT'; payload: Experiment }
  | { type: 'UPDATE_EXPERIMENT'; payload: Experiment }
  | { type: 'SET_REVIEWS'; payload: Review[] }
  | { type: 'ADD_REVIEW'; payload: Review }
  | { type: 'UPDATE_REVIEW'; payload: Review }
  | { type: 'DELETE_REVIEW'; payload: string }
  | { type: 'TOGGLE_BOOKMARK'; payload: string }
  | { type: 'ADD_COMMENT'; payload: { reviewId: string; comment: any } }
  | { type: 'SET_GROUPS'; payload: Group[] }
  | { type: 'ADD_GROUP'; payload: Group }
  | { type: 'UPDATE_GROUP'; payload: Group }
  | { type: 'SET_FILTERS'; payload: Partial<FilterState> }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AppState = {
  user: null,
  viewingAs: null,
  navigationContext: {
    fromGroups: false,
    fromReview: false
  },
  revenues: [],
  experiments: [],
  reviews: [],
  groups: [],
  filters: {
    product: [],
    type: [],
    dateRange: ['', '']
  },
  isLoading: true
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_VIEWING_AS':
      return { ...state, viewingAs: action.payload };
    case 'SET_NAVIGATION_CONTEXT':
      return { ...state, navigationContext: action.payload };
    case 'SET_REVENUES':
      return { ...state, revenues: action.payload };
    case 'ADD_REVENUE':
      return { ...state, revenues: [action.payload, ...state.revenues] };
    case 'UPDATE_REVENUE':
      return {
        ...state,
        revenues: state.revenues.map(r => r.id === action.payload.id ? action.payload : r)
      };
    case 'DELETE_REVENUE':
      return {
        ...state,
        revenues: state.revenues.filter(r => r.id !== action.payload)
      };
    case 'SET_EXPERIMENTS':
      return { ...state, experiments: action.payload };
    case 'ADD_EXPERIMENT':
      return { ...state, experiments: [action.payload, ...state.experiments] };
    case 'UPDATE_EXPERIMENT':
      return {
        ...state,
        experiments: state.experiments.map(e => e.id === action.payload.id ? action.payload : e)
      };
    case 'SET_REVIEWS':
      return { ...state, reviews: action.payload };
    case 'ADD_REVIEW':
      return { ...state, reviews: [action.payload, ...state.reviews] };
    case 'UPDATE_REVIEW':
      return {
        ...state,
        reviews: state.reviews.map(r => r.id === action.payload.id ? action.payload : r)
      };
    case 'DELETE_REVIEW':
      return {
        ...state,
        reviews: state.reviews.filter(r => r.id !== action.payload)
      };
    case 'TOGGLE_BOOKMARK':
      return {
        ...state,
        reviews: state.reviews.map(r => 
          r.id === action.payload ? { ...r, isBookmarked: !r.isBookmarked } : r
        )
      };
    case 'ADD_COMMENT':
      return {
        ...state,
        reviews: state.reviews.map(r =>
          r.id === action.payload.reviewId 
            ? { ...r, comments: [...r.comments, action.payload.comment] }
            : r
        )
      };
    case 'SET_GROUPS':
      return { ...state, groups: action.payload };
    case 'ADD_GROUP':
      return { ...state, groups: [action.payload, ...state.groups] };
    case 'UPDATE_GROUP':
      return {
        ...state,
        groups: state.groups.map(g => g.id === action.payload.id ? action.payload : g)
      };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const loadData = () => {
      dispatch({ type: 'SET_USER', payload: storage.getUser() });
      dispatch({ type: 'SET_REVENUES', payload: storage.getRevenues() });
      dispatch({ type: 'SET_EXPERIMENTS', payload: storage.getExperiments() });
      dispatch({ type: 'SET_REVIEWS', payload: storage.getReviews() });
      dispatch({ type: 'SET_GROUPS', payload: storage.getGroups() });
      dispatch({ type: 'SET_LOADING', payload: false });
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!state.isLoading) {
      storage.setRevenues(state.revenues);
      storage.setExperiments(state.experiments);
      storage.setReviews(state.reviews);
      storage.setGroups(state.groups);
    }
  }, [state.revenues, state.experiments, state.reviews, state.groups, state.isLoading]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
