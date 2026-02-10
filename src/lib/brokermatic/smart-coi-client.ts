/**
 * Brokermatic Smart COI API Client
 * Based on API specification from Brokermatic engineering
 *
 * Note: Currently using mock implementation until Brokermatic API is ready
 */

// Types based on Brokermatic Smart COI API spec
export interface ComplianceRequirement {
  holderId: string;
  insuredName: string;
  projectDescription: string;
  deadline?: string;
  requirements: {
    generalLiability?: {
      required: boolean;
      minLimits?: {
        eachOccurrence: number;
        generalAggregate: number;
      };
      requireAdditionalInsured?: boolean;
      requireWaiverOfSubrogation?: boolean;
      requirePrimaryNonContributory?: boolean;
    };
    autoLiability?: {
      required: boolean;
      minLimits?: {
        combinedSingleLimit: number;
      };
    };
    workersCompensation?: {
      required: boolean;
      requireStatutoryLimits?: boolean;
      requireWaiverOfSubrogation?: boolean;
    };
    umbrellaLiability?: {
      required: boolean;
      minLimits?: {
        eachOccurrence: number;
      };
    };
  };
}

export interface RequirementResponse {
  id: string;
  requestId: string;
  status: 'pending' | 'fulfilled';
  createdAt: string;
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  status: 'active' | 'expired' | 'cancelled';
  complianceStatus: 'compliant' | 'action_needed' | 'non_compliant';
  effectiveDate: string;
  expirationDate: string;
  daysUntilExpiration: number;
  namedInsured: {
    name: string;
    address: {
      street: string;
      city: string;
      state: string;
      zip: string;
    };
  };
  certificateHolder: {
    companyName: string;
    address: {
      street: string;
      city: string;
      state: string;
      zip: string;
    };
  };
  coverages: Coverage[];
  documents: {
    certificatePdf: string;
    endorsementPages: string;
  };
}

export interface Coverage {
  type: 'general_liability' | 'workers_compensation' | 'commercial_auto' | 'umbrella' | 'professional_liability';
  insurerName: string;
  policyNumber: string;
  policyEffectiveDate: string;
  policyExpirationDate: string;
  limits: {
    [key: string]: number | boolean;
  };
  flags: {
    additionalInsured?: boolean;
    waiverOfSubrogation?: boolean;
    primaryNonContributory?: boolean;
  };
}

export interface ComplianceCheckRequest {
  certificateId: string;
  requirements: ComplianceRequirement['requirements'];
}

export interface ComplianceCheckResponse {
  certificateId: string;
  overallResult: 'compliant' | 'non_compliant' | 'partial';
  checkedAt: string;
  results: {
    [coverageType: string]: {
      status: 'pass' | 'fail' | 'warning';
      policyNumber?: string;
      expirationDate?: string;
      limitsCheck?: {
        [limitName: string]: {
          required: number;
          actual: number;
          pass: boolean;
        };
      };
      flagsCheck?: {
        [flagName: string]: {
          required: boolean;
          actual: boolean;
          pass: boolean;
        };
      };
      gaps?: string[];
    };
  };
}

export interface WebhookSubscription {
  url: string;
  events: WebhookEvent[];
  secret: string;
}

export interface WebhookSubscriptionResponse {
  id: string;
  url: string;
  events: WebhookEvent[];
  status: 'active' | 'inactive';
  createdAt: string;
}

export type WebhookEvent =
  | 'certificate.issued'
  | 'certificate.updated'
  | 'certificate.expiring'
  | 'certificate.expired'
  | 'policy.cancelled'
  | 'policy.renewed'
  | 'compliance.gap';

export interface WebhookPayload {
  id: string;
  event: WebhookEvent;
  timestamp: string;
  data: {
    certificate: Certificate;
    requestId?: string;
    changes?: Array<{ field: string; oldValue: any; newValue: any }>;
    daysRemaining?: number;
    gaps?: Array<{ type: string; message: string; severity: 'error' | 'warning' }>;
  };
}

/**
 * Brokermatic Smart COI API Client
 */
export class BrokermaticSmartCOIClient {
  private baseUrl: string;
  private apiKey: string;
  private useMock: boolean;

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || process.env.BROKERMATIC_API_KEY || 'mock_api_key';
    this.baseUrl = baseUrl || process.env.BROKERMATIC_API_URL || 'https://api.brokermatic.ai/v1';
    this.useMock = !apiKey || apiKey === 'mock_api_key';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (this.useMock) {
      return this.mockRequest<T>(endpoint, options);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `Brokermatic API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Mock implementation for development
   */
  private async mockRequest<T>(endpoint: string, options: RequestInit): Promise<T> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body as string) : null;

    // Mock responses based on endpoint
    if (method === 'POST' && endpoint === '/compliance/requirements') {
      return {
        id: `req_${Date.now()}`,
        requestId: `REQ-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
      } as T;
    }

    if (method === 'POST' && endpoint === '/compliance/check') {
      const checkRequest = body as ComplianceCheckRequest;
      return this.mockComplianceCheck(checkRequest) as T;
    }

    if (method === 'GET' && endpoint.startsWith('/certificates')) {
      if (endpoint.includes('/document')) {
        // Mock certificate PDF download
        return {
          url: '/api/mock/certificate.pdf',
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        } as T;
      }

      // Mock certificate list
      return {
        data: [this.mockCertificate()],
        pagination: {
          cursor: null,
          hasMore: false,
          total: 1,
        },
      } as T;
    }

    if (method === 'POST' && endpoint === '/webhooks') {
      return {
        id: `wh_${Date.now()}`,
        url: body.url,
        events: body.events,
        status: 'active',
        createdAt: new Date().toISOString(),
      } as T;
    }

    if (method === 'GET' && endpoint.startsWith('/holders/')) {
      return {
        holderId: 'ch_columbia_gc',
        holderName: 'Columbia University',
        overallStatus: 'compliant',
        lastChecked: new Date().toISOString(),
        certificates: [
          {
            certificateId: 'cert_001',
            namedInsured: 'ABC Construction LLC',
            agency: 'Premier Insurance Agency',
            status: 'compliant',
            expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            daysUntilExpiration: 365,
            coverageGaps: [],
          },
        ],
      } as T;
    }

    throw new Error(`Mock endpoint not implemented: ${method} ${endpoint}`);
  }

  private mockCertificate(): Certificate {
    const now = new Date();
    const effectiveDate = new Date(now.getFullYear(), 0, 1);
    const expirationDate = new Date(now.getFullYear() + 1, 0, 1);
    const daysUntilExpiration = Math.floor((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      id: `cert_${Date.now()}`,
      certificateNumber: `CERT-${now.getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      status: 'active',
      complianceStatus: 'compliant',
      effectiveDate: effectiveDate.toISOString(),
      expirationDate: expirationDate.toISOString(),
      daysUntilExpiration,
      namedInsured: {
        name: 'ABC Construction LLC',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zip: '10001',
        },
      },
      certificateHolder: {
        companyName: 'Columbia University',
        address: {
          street: '615 West 131st Street',
          city: 'New York',
          state: 'NY',
          zip: '10027',
        },
      },
      coverages: [
        {
          type: 'general_liability',
          insurerName: 'Hartford Fire Insurance',
          policyNumber: `GL-${now.getFullYear()}-001`,
          policyEffectiveDate: effectiveDate.toISOString(),
          policyExpirationDate: expirationDate.toISOString(),
          limits: {
            eachOccurrence: 2000000,
            generalAggregate: 4000000,
            productsCompletedOps: 4000000,
            personalAdvertisingInjury: 2000000,
          },
          flags: {
            additionalInsured: true,
            waiverOfSubrogation: true,
            primaryNonContributory: true,
          },
        },
        {
          type: 'workers_compensation',
          insurerName: 'State Compensation Insurance Fund',
          policyNumber: `WC-${now.getFullYear()}-001`,
          policyEffectiveDate: effectiveDate.toISOString(),
          policyExpirationDate: expirationDate.toISOString(),
          limits: {
            statutoryLimits: true,
            elEachAccident: 500000,
            elDiseasePolicyLimit: 500000,
            elDiseaseEachEmployee: 500000,
          },
          flags: {
            waiverOfSubrogation: true,
          },
        },
        {
          type: 'commercial_auto',
          insurerName: 'Progressive Insurance',
          policyNumber: `CA-${now.getFullYear()}-001`,
          policyEffectiveDate: effectiveDate.toISOString(),
          policyExpirationDate: expirationDate.toISOString(),
          limits: {
            combinedSingleLimit: 1000000,
          },
          flags: {
            additionalInsured: true,
          },
        },
      ],
      documents: {
        certificatePdf: '/v1/certificates/cert_001/document',
        endorsementPages: '/v1/certificates/cert_001/endorsements',
      },
    };
  }

  private mockComplianceCheck(request: ComplianceCheckRequest): ComplianceCheckResponse {
    const results: ComplianceCheckResponse['results'] = {};

    // Check each required coverage
    if (request.requirements.generalLiability?.required) {
      results.generalLiability = {
        status: 'pass',
        policyNumber: `GL-${new Date().getFullYear()}-001`,
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        limitsCheck: {
          eachOccurrence: {
            required: request.requirements.generalLiability.minLimits?.eachOccurrence || 1000000,
            actual: 2000000,
            pass: true,
          },
          generalAggregate: {
            required: request.requirements.generalLiability.minLimits?.generalAggregate || 2000000,
            actual: 4000000,
            pass: true,
          },
        },
        flagsCheck: {
          additionalInsured: {
            required: request.requirements.generalLiability.requireAdditionalInsured || false,
            actual: true,
            pass: true,
          },
          waiverOfSubrogation: {
            required: request.requirements.generalLiability.requireWaiverOfSubrogation || false,
            actual: true,
            pass: true,
          },
        },
      };
    }

    if (request.requirements.workersCompensation?.required) {
      results.workersCompensation = {
        status: 'pass',
        policyNumber: `WC-${new Date().getFullYear()}-001`,
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        flagsCheck: {
          waiverOfSubrogation: {
            required: request.requirements.workersCompensation.requireWaiverOfSubrogation || false,
            actual: true,
            pass: true,
          },
        },
      };
    }

    if (request.requirements.autoLiability?.required) {
      results.autoLiability = {
        status: 'pass',
        policyNumber: `CA-${new Date().getFullYear()}-001`,
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        limitsCheck: {
          combinedSingleLimit: {
            required: request.requirements.autoLiability.minLimits?.combinedSingleLimit || 1000000,
            actual: 1000000,
            pass: true,
          },
        },
      };
    }

    const allPass = Object.values(results).every(r => r.status === 'pass');

    return {
      certificateId: request.certificateId,
      overallResult: allPass ? 'compliant' : 'non_compliant',
      checkedAt: new Date().toISOString(),
      results,
    };
  }

  /**
   * Submit compliance requirements to Brokermatic
   */
  async submitRequirements(data: ComplianceRequirement): Promise<RequirementResponse> {
    return this.request<RequirementResponse>('/compliance/requirements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Check certificate compliance against requirements
   */
  async checkCompliance(data: ComplianceCheckRequest): Promise<ComplianceCheckResponse> {
    return this.request<ComplianceCheckResponse>('/compliance/check', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get list of certificates
   */
  async getCertificates(params?: {
    holder_id?: string;
    insured_name?: string;
    status?: 'active' | 'expired' | 'cancelled';
    compliance_status?: 'compliant' | 'action_needed' | 'non_compliant';
    expiring_within_days?: number;
    updated_since?: string;
    cursor?: string;
    limit?: number;
  }): Promise<{ data: Certificate[]; pagination: any }> {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request<{ data: Certificate[]; pagination: any }>(`/certificates${queryString}`);
  }

  /**
   * Get single certificate
   */
  async getCertificate(id: string): Promise<Certificate> {
    return this.request<Certificate>(`/certificates/${id}`);
  }

  /**
   * Download certificate PDF
   */
  async downloadCertificate(id: string): Promise<{ url: string; expiresAt: string }> {
    return this.request<{ url: string; expiresAt: string }>(`/certificates/${id}/document`);
  }

  /**
   * Get holder compliance summary
   */
  async getHolderCompliance(holderId: string): Promise<any> {
    return this.request(`/holders/${holderId}/compliance`);
  }

  /**
   * Subscribe to webhook events
   */
  async subscribeToWebhooks(data: WebhookSubscription): Promise<WebhookSubscriptionResponse> {
    return this.request<WebhookSubscriptionResponse>('/webhooks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Test webhook delivery
   */
  async testWebhook(webhookId: string): Promise<void> {
    return this.request(`/webhooks/${webhookId}/test`, {
      method: 'POST',
    });
  }
}

// Singleton instance
export const brokermaticClient = new BrokermaticSmartCOIClient();
