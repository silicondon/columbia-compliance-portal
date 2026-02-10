import { v4 as uuid } from "uuid";
import type { BrokermaticClient } from "./client";
import type {
  Certificate,
  CertificateFilters,
  ComplianceGap,
  ComplianceResult,
  ComplianceSummary,
  CreateCertificateRequest,
  CreateInsuredRequest,
  CreateRequirementRequest,
  DocumentDownloadResponse,
  ExpiringCertificate,
  Insured,
  InsuredCompliance,
  InsuredFilters,
  PaginatedResponse,
  ParseResponse,
  Requirement,
  UploadUrlResponse,
} from "./types";

export class MockBrokermaticClient implements BrokermaticClient {
  async getUploadUrl(fileName: string): Promise<UploadUrlResponse> {
    return {
      uploadUrl: `https://mock-s3.example.com/upload/${uuid()}`,
      storageKey: `uploads/mock/${Date.now()}-${fileName}`,
      expiresIn: 900,
    };
  }

  async parseCertificate(_storageKey: string): Promise<ParseResponse> {
    return {
      extractedData: {
        certificateNumber: `CERT-${Date.now()}`,
        issueDate: new Date().toISOString().split("T")[0],
        producer: {
          name: "Premier Insurance Agency",
          address: { line1: "100 Park Ave", city: "New York", state: "NY", zip: "10017" },
          contact: { name: "Jane Doe", phone: "212-555-0200", email: "jane@premierins.com" },
        },
        namedInsured: {
          name: "Sample Vendor Corp",
          dba: null,
          address: { line1: "123 Main St", city: "New York", state: "NY", zip: "10001" },
        },
        certificateHolder: {
          name: "Columbia University",
          address: { line1: "2960 Broadway", city: "New York", state: "NY", zip: "10027" },
        },
        coverages: [
          {
            type: "general_liability",
            policyNumber: "GL-2026-001",
            carrierName: "Hartford Fire Insurance",
            effectiveDate: "2026-01-15",
            expirationDate: "2027-01-15",
            limits: { eachOccurrence: 2000000, aggregate: 4000000 },
            flags: { additionalInsured: true, waiverOfSubrogation: true },
          },
          {
            type: "auto_liability",
            policyNumber: "AU-2026-001",
            carrierName: "Hartford Fire Insurance",
            effectiveDate: "2026-01-15",
            expirationDate: "2027-01-15",
            limits: { combinedSingleLimit: 1000000 },
            flags: {},
          },
          {
            type: "workers_compensation",
            policyNumber: "WC-2026-001",
            carrierName: "Hartford Fire Insurance",
            effectiveDate: "2026-01-15",
            expirationDate: "2027-01-15",
            limits: { eachAccident: 1000000, diseaseEachEmployee: 1000000 },
            flags: { waiverOfSubrogation: true },
          },
        ],
        descriptionOfOperations: "General construction operations for university facilities.",
        cancellationNotice: {
          daysNotice: 30,
          text: "SHOULD ANY OF THE ABOVE DESCRIBED POLICIES BE CANCELLED...",
        },
      },
      confidence: 0.94,
      warnings: [],
    };
  }

  async createCertificate(data: CreateCertificateRequest): Promise<Certificate> {
    const now = new Date().toISOString();
    return {
      id: `cert_${uuid().slice(0, 8)}`,
      insuredId: data.insuredId,
      certificateNumber: data.certificateNumber || null,
      issueDate: data.issueDate || null,
      source: data.source,
      status: "active",
      complianceStatus: "compliant",
      coverages: data.coverages.map((c) => ({
        ...c,
        id: `cov_${uuid().slice(0, 8)}`,
        daysUntilExpiration: Math.ceil(
          (new Date(c.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        ),
      })),
      hasDocument: !!data.storageKey,
      createdAt: now,
      updatedAt: now,
    };
  }

  async getCertificate(id: string): Promise<Certificate> {
    return {
      id,
      insuredId: "ins_mock",
      certificateNumber: "CERT-MOCK-001",
      issueDate: "2026-01-15",
      source: "ai_extraction",
      status: "active",
      complianceStatus: "compliant",
      coverages: [
        {
          id: "cov_mock1",
          type: "general_liability",
          policyNumber: "GL-2026-001",
          carrierName: "Hartford Fire Insurance",
          effectiveDate: "2026-01-15",
          expirationDate: "2027-01-15",
          daysUntilExpiration: 342,
          limits: { eachOccurrence: 2000000, aggregate: 4000000 },
          flags: { additionalInsured: true },
        },
      ],
      hasDocument: true,
      createdAt: "2026-01-15T10:00:00Z",
      updatedAt: "2026-01-15T10:00:00Z",
    };
  }

  async listCertificates(_filters: CertificateFilters): Promise<PaginatedResponse<Certificate>> {
    return { data: [], pagination: { cursor: null, hasMore: false, total: 0 } };
  }

  async updateCertificate(id: string, _data: Partial<CreateCertificateRequest>): Promise<Certificate> {
    return this.getCertificate(id);
  }

  async deleteCertificate(_id: string): Promise<void> {}

  async getCertificateDocument(_id: string): Promise<DocumentDownloadResponse> {
    return {
      downloadUrl: "https://mock-s3.example.com/download/mock-cert.pdf",
      fileName: "certificate.pdf",
      fileSize: 245760,
      contentType: "application/pdf",
      checksum: "sha256:mock_checksum",
      uploadedAt: new Date().toISOString(),
      expiresIn: 900,
    };
  }

  async createInsured(data: CreateInsuredRequest): Promise<Insured> {
    const now = new Date().toISOString();
    return {
      id: `ins_${uuid().slice(0, 8)}`,
      name: data.name,
      dba: data.dba || null,
      ein: data.ein || null,
      address: data.address,
      contactEmail: data.contactEmail || null,
      contactPhone: data.contactPhone || null,
      contactName: data.contactName || null,
      externalId: data.externalId || null,
      metadata: data.metadata || {},
      certificateCount: 0,
      complianceStatus: "no_certificate",
      createdAt: now,
      updatedAt: now,
    };
  }

  async getInsured(id: string): Promise<Insured> {
    return {
      id,
      name: "Mock Insured",
      dba: null,
      ein: null,
      address: { line1: "123 Main St", city: "New York", state: "NY", zip: "10001" },
      contactEmail: null,
      contactPhone: null,
      contactName: null,
      externalId: null,
      metadata: {},
      certificateCount: 0,
      complianceStatus: "no_certificate",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async listInsureds(_filters: InsuredFilters): Promise<PaginatedResponse<Insured>> {
    return { data: [], pagination: { cursor: null, hasMore: false, total: 0 } };
  }

  async updateInsured(id: string, _data: Partial<CreateInsuredRequest>): Promise<Insured> {
    return this.getInsured(id);
  }

  async deleteInsured(_id: string): Promise<void> {}

  async getInsuredCertificates(_insuredId: string): Promise<PaginatedResponse<Certificate>> {
    return { data: [], pagination: { cursor: null, hasMore: false, total: 0 } };
  }

  async getInsuredCompliance(insuredId: string): Promise<InsuredCompliance> {
    return {
      insuredId,
      insuredName: "Mock Insured",
      overallStatus: "compliant",
      assignedRequirement: { id: "req_mock", name: "Standard Contractor" },
      coverages: [],
      lastCheckedAt: new Date().toISOString(),
    };
  }

  async checkCompliance(certificateId: string): Promise<ComplianceResult> {
    return {
      certificateId,
      insuredId: "ins_mock",
      requirementId: "req_mock",
      overallStatus: "compliant",
      checkedAt: new Date().toISOString(),
      results: [
        {
          coverageType: "general_liability",
          status: "pass",
          details: {
            limitsCheck: [
              { limitName: "eachOccurrence", required: 2000000, actual: 2000000, pass: true },
              { limitName: "aggregate", required: 4000000, actual: 4000000, pass: true },
            ],
            flagsCheck: [
              { flag: "additionalInsured", required: true, actual: true, pass: true },
            ],
            expirationCheck: {
              expirationDate: "2027-01-15",
              isExpired: false,
              daysUntilExpiration: 342,
            },
          },
        },
      ],
    };
  }

  async getComplianceSummary(): Promise<ComplianceSummary> {
    return {
      totalInsureds: 50,
      withRequirements: 45,
      compliant: 30,
      nonCompliant: 5,
      partiallyCompliant: 3,
      expiringWithin30Days: 4,
      expiringWithin60Days: 7,
      expiringWithin90Days: 12,
      expired: 3,
      noCertificateOnFile: 4,
      exempt: 5,
      lastCalculatedAt: new Date().toISOString(),
    };
  }

  async getExpiringCertificates(_days: number): Promise<PaginatedResponse<ExpiringCertificate>> {
    return { data: [], pagination: { cursor: null, hasMore: false, total: 0 } };
  }

  async getComplianceGaps(): Promise<PaginatedResponse<ComplianceGap>> {
    return { data: [], pagination: { cursor: null, hasMore: false, total: 0 } };
  }

  async createRequirement(data: CreateRequirementRequest): Promise<Requirement> {
    const now = new Date().toISOString();
    return {
      id: `req_${uuid().slice(0, 8)}`,
      name: data.name,
      description: data.description || null,
      coverages: data.coverages,
      assignedInsuredCount: 0,
      createdAt: now,
      updatedAt: now,
    };
  }

  async getRequirement(id: string): Promise<Requirement> {
    return {
      id,
      name: "Standard Contractor",
      description: "Default requirement template",
      coverages: [],
      assignedInsuredCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async listRequirements(): Promise<PaginatedResponse<Requirement>> {
    return { data: [], pagination: { cursor: null, hasMore: false, total: 0 } };
  }

  async assignRequirement(_insuredId: string, _requirementId: string): Promise<void> {}
}
