import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}));

describe('Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSession', () => {
    it('should get current session successfully', async () => {
      const mockSession = {
        data: {
          session: {
            access_token: 'mock-token',
            user: {
              id: 'user-123',
              email: 'test@example.com',
            },
          },
        },
        error: null,
      };

      (supabase.auth.getSession as jest.Mock).mockResolvedValue(mockSession);

      const result = await supabase.auth.getSession();

      expect(result).toEqual(mockSession);
      expect(supabase.auth.getSession).toHaveBeenCalledTimes(1);
    });

    it('should handle no session gracefully', async () => {
      const mockNoSession = {
        data: { session: null },
        error: null,
      };

      (supabase.auth.getSession as jest.Mock).mockResolvedValue(mockNoSession);

      const result = await supabase.auth.getSession();

      expect(result.data.session).toBeNull();
      expect(result.error).toBeNull();
    });

    it('should handle session errors', async () => {
      const mockError = {
        data: { session: null },
        error: {
          message: 'Failed to get session',
          status: 500,
        },
      };

      (supabase.auth.getSession as jest.Mock).mockResolvedValue(mockError);

      const result = await supabase.auth.getSession();

      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Failed to get session');
    });
  });

  describe('signInWithPassword', () => {
    it('should sign in user with valid credentials', async () => {
      const mockSignIn = {
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
          },
          session: {
            access_token: 'mock-token',
          },
        },
        error: null,
      };

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue(mockSignIn);

      const result = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockSignIn);
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.data?.user?.email).toBe('test@example.com');
    });

    it('should handle invalid credentials', async () => {
      const mockError = {
        data: { user: null, session: null },
        error: {
          message: 'Invalid login credentials',
          status: 400,
        },
      };

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue(mockError);

      const result = await supabase.auth.signInWithPassword({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      });

      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Invalid login credentials');
      expect(result.data?.user).toBeNull();
    });

    it('should require email and password', async () => {
      await expect(
        supabase.auth.signInWithPassword({
          email: '',
          password: 'password123',
        } as any)
      ).resolves.toBeDefined();

      expect(supabase.auth.signInWithPassword).toHaveBeenCalled();
    });
  });

  describe('signUp', () => {
    it('should sign up new user successfully', async () => {
      const mockSignUp = {
        data: {
          user: {
            id: 'user-456',
            email: 'newuser@example.com',
          },
          session: {
            access_token: 'mock-token',
          },
        },
        error: null,
      };

      (supabase.auth.signUp as jest.Mock).mockResolvedValue(mockSignUp);

      const result = await supabase.auth.signUp({
        email: 'newuser@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockSignUp);
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password123',
      });
      expect(result.data?.user?.email).toBe('newuser@example.com');
    });

    it('should handle sign up errors (e.g., email already exists)', async () => {
      const mockError = {
        data: { user: null, session: null },
        error: {
          message: 'User already registered',
          status: 400,
        },
      };

      (supabase.auth.signUp as jest.Mock).mockResolvedValue(mockError);

      const result = await supabase.auth.signUp({
        email: 'existing@example.com',
        password: 'password123',
      });

      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('User already registered');
    });
  });

  describe('signOut', () => {
    it('should sign out user successfully', async () => {
      const mockSignOut = {
        error: null,
      };

      (supabase.auth.signOut as jest.Mock).mockResolvedValue(mockSignOut);

      const result = await supabase.auth.signOut();

      expect(result.error).toBeNull();
      expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
    });

    it('should handle sign out errors', async () => {
      const mockError = {
        error: {
          message: 'Failed to sign out',
          status: 500,
        },
      };

      (supabase.auth.signOut as jest.Mock).mockResolvedValue(mockError);

      const result = await supabase.auth.signOut();

      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Failed to sign out');
    });
  });

  describe('onAuthStateChange', () => {
    it('should subscribe to auth state changes', () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();

      (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      });

      const { data } = supabase.auth.onAuthStateChange(mockCallback);

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalledWith(mockCallback);
      expect(data?.subscription).toBeDefined();
    });
  });
});

