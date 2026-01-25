import { supabase } from '@/lib/supabase';

jest.mock('@supabase/supabase-js', () => {
  const mockAuth = {
    getSession: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(),
  };

  return {
    createClient: jest.fn(() => ({
      auth: mockAuth,
    })),
  };
});

describe('Supabase Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should export supabase client', () => {
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();
  });

  it('should have auth methods available', () => {
    expect(supabase.auth.getSession).toBeDefined();
    expect(supabase.auth.signInWithPassword).toBeDefined();
    expect(supabase.auth.signUp).toBeDefined();
    expect(supabase.auth.signOut).toBeDefined();
  });
});

