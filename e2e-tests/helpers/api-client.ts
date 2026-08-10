import { APIRequestContext, APIResponse, expect } from '@playwright/test';

export interface UserSession {
  id: number;
  name: string;
  identifier: string;
  role: string;
  accessToken: string;
  refreshToken: string;
}

export class ApiClient {
  private request: APIRequestContext;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
  }

  // Generates unique test details
  static generateTestData(prefix: string = 'test') {
    const rand = Math.floor(100000 + Math.random() * 900000);
    return {
      name: `${prefix} User ${rand}`,
      email: `${prefix}_${rand}@example.com`,
      phone: `+88017${rand.toString().padStart(8, '0')}`,
      password: `SecurePass@${rand}`,
    };
  }

  // Performs HTTP requests adding auth headers if present
  private async sendRequest(
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
    url: string,
    data?: any,
    headers: Record<string, string> = {}
  ): Promise<APIResponse> {
    const finalHeaders = { ...headers };
    if (this.accessToken) {
      finalHeaders['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const options: any = {
      headers: finalHeaders,
    };

    if (data) {
      options.data = data;
    }

    const response = await this.request[method.toLowerCase() as 'get' | 'post' | 'patch' | 'put' | 'delete'](url, options);

    // If 401 and we have a refresh token, try rotating tokens and retrying
    if (response.status() === 401 && this.refreshToken) {
      const refreshed = await this.rotateTokens();
      if (refreshed) {
        finalHeaders['Authorization'] = `Bearer ${this.accessToken}`;
        return await this.request[method.toLowerCase() as 'get' | 'post' | 'patch' | 'put' | 'delete'](url, options);
      }
    }

    return response;
  }

  private async rotateTokens(): Promise<boolean> {
    if (!this.refreshToken) return false;
    try {
      const response = await this.request.post('/auth/refresh', {
        data: { refreshToken: this.refreshToken },
      });
      if (response.status() === 201) {
        const body = await response.json();
        this.accessToken = body.accessToken;
        this.refreshToken = body.refreshToken;
        return true;
      }
    } catch {
      // Clear tokens if refresh fails
    }
    this.clearTokens();
    return false;
  }

  // Wrapper HTTP helpers
  async get(url: string, headers?: Record<string, string>) {
    return this.sendRequest('GET', url, undefined, headers);
  }

  async post(url: string, data?: any, headers?: Record<string, string>) {
    return this.sendRequest('POST', url, data, headers);
  }

  async patch(url: string, data?: any, headers?: Record<string, string>) {
    return this.sendRequest('PATCH', url, data, headers);
  }

  async put(url: string, data?: any, headers?: Record<string, string>) {
    return this.sendRequest('PUT', url, data, headers);
  }

  async delete(url: string, headers?: Record<string, string>) {
    return this.sendRequest('DELETE', url, undefined, headers);
  }

  /**
   * Helper to register a new user, automatically verify them via OTP
   * returned in the response (dev mode bypass), and return session info.
   */
  async registerAndVerifyUser(role: string = 'user'): Promise<UserSession> {
    const testData = ApiClient.generateTestData(role);
    
    // Register
    const registerResponse = await this.post('/auth/register', {
      name: testData.name,
      identifier: testData.email,
      password: testData.password,
      role: role,
    });
    expect(registerResponse.status()).toBe(201);
    
    // Request OTP via /auth/send-otp
    const sendOtpResponse = await this.post('/auth/send-otp', {
      phone: testData.email,
      purpose: 'verify',
    });
    expect(sendOtpResponse.status()).toBe(201);
    const sendOtpResult = await sendOtpResponse.json();
    const otp = sendOtpResult.otp;
    expect(otp).toBeDefined();

    // Verify OTP
    const verifyResponse = await this.post('/auth/verify-otp', {
      phone: testData.email,
      code: otp,
      purpose: 'verify',
    });
    expect(verifyResponse.status()).toBe(201);
    const verifyResult = await verifyResponse.json();

    const session: UserSession = {
      id: verifyResult.user.id,
      name: verifyResult.user.name,
      identifier: testData.email,
      role: verifyResult.user.role,
      accessToken: verifyResult.accessToken,
      refreshToken: verifyResult.refreshToken,
    };

    // Store tokens locally in the ApiClient instance for successive calls
    this.setTokens(session.accessToken, session.refreshToken);

    return session;
  }
}
