import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import { AuthProvider } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock fetch
global.fetch = jest.fn();

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (fetch as jest.Mock).mockClear();
  });

  it('should login successfully', async () => {
    const mockResponse = {
      user: { id: '1', email: 'test@example.com', username: 'test' },
      tokens: { accessToken: 'token', refreshToken: 'refresh' },
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const loginResult = await result.current.login('test@example.com', 'password');
      expect(loginResult.success).toBe(true);
    });

    expect(localStorage.getItem('accessToken')).toBe('token');
    expect(localStorage.getItem('refreshToken')).toBe('refresh');
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('should handle login failure', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid credentials' }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const loginResult = await result.current.login('test@example.com', 'wrong');
      expect(loginResult.success).toBe(false);
      expect(loginResult.error).toBe('Invalid credentials');
    });

    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  it('should logout and clear tokens', async () => {
    localStorage.setItem('accessToken', 'token');
    localStorage.setItem('refreshToken', 'refresh');

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.logout();
    });

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(mockPush).toHaveBeenCalledWith('/auth/login');
  });
});