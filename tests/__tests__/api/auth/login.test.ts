import { POST } from '@/app/api/auth/login/route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { PasswordService } from '@/lib/auth/password';

// Mock dependencies
jest.mock('@/lib/database/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('@/lib/auth/password');

describe('/api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should login with valid credentials', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      username: 'test',
      passwordHash: 'hashedpassword',
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (PasswordService.verifyPassword as jest.Mock).mockResolvedValue(true);

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.user.email).toBe('test@example.com');
    expect(data.tokens).toBeDefined();
  });

  it('should reject invalid credentials', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'password123',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Invalid credentials');
  });
});