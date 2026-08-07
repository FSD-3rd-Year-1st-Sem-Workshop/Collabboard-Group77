import {createContext , useEffect , useState , type ReactNode} from 'react';
import type { User} from '../types/index';
import {currentUser} from '@/data/users';

const STORAGE_KEY = 'collabboard.session';
//  Fake session toekn for the storeage

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? currentUser : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, user.id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login: AuthContextValue['login'] = async (email, password) => {
    if (!email || !password) {
      return { success: false, error: 'Enter both an email and a password.' };
    }
    await new Promise((resolve) => setTimeout(resolve, 300)); // mimic network latency
    setUser(currentUser);
    return { success: true };
  };

  const register: AuthContextValue['register'] = async (name, email, password) => {
    if (!name || !email || !password) {
      return { success: false, error: 'Fill in every field to create an account.' };
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
    setUser({ ...currentUser, name, email });
    return { success: true };
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
