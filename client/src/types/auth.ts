export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'agent' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  department?: {
    _id: string;
    name: string;
  };
  skills: Array<{
    name: string;
    level: 'beginner' | 'intermediate' | 'expert';
    verified: boolean;
  }>;
  shift: {
    startTime?: string;
    endTime?: string;
    timeZone: string;
    days: string[];
  };
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      desktop: boolean;
    };
    language: string;
    theme: 'light' | 'dark';
  };
  performance: {
    ticketsResolved: number;
    averageResponseTime: number;
    customerSatisfactionScore: number;
  };
  lastLogin?: Date;
  lastActive?: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  sessionId: string;
}

export interface AuthError {
  message: string;
} 