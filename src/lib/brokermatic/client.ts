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

export interface BrokermaticClient {
  // Certificate ingestion
  getUploadUrl(fileName: string): Promise<UploadUrlResponse>;
  parseCertificate(storageKey: string): Promise<ParseResponse>;

  // Certificate CRUD
  createCertificate(data: CreateCertificateRequest): Promise<Certificate>;
  getCertificate(id: string): Promise<Certificate>;
  listCertificates(filters: CertificateFilters): Promise<PaginatedResponse<Certificate>>;
  updateCertificate(id: string, data: Partial<CreateCertificateRequest>): Promise<Certificate>;
  deleteCertificate(id: string): Promise<void>;

  // Certificate documents
  getCertificateDocument(id: string): Promise<DocumentDownloadResponse>;

  // Insured operations
  createInsured(data: CreateInsuredRequest): Promise<Insured>;
  getInsured(id: string): Promise<Insured>;
  listInsureds(filters: InsuredFilters): Promise<PaginatedResponse<Insured>>;
  updateInsured(id: string, data: Partial<CreateInsuredRequest>): Promise<Insured>;
  deleteInsured(id: string): Promise<void>;
  getInsuredCertificates(insuredId: string): Promise<PaginatedResponse<Certificate>>;
  getInsuredCompliance(insuredId: string): Promise<InsuredCompliance>;

  // Compliance
  checkCompliance(certificateId: string, requirementId?: string): Promise<ComplianceResult>;
  getComplianceSummary(): Promise<ComplianceSummary>;
  getExpiringCertificates(days: number): Promise<PaginatedResponse<ExpiringCertificate>>;
  getComplianceGaps(): Promise<PaginatedResponse<ComplianceGap>>;

  // Requirements
  createRequirement(data: CreateRequirementRequest): Promise<Requirement>;
  getRequirement(id: string): Promise<Requirement>;
  listRequirements(): Promise<PaginatedResponse<Requirement>>;
  assignRequirement(insuredId: string, requirementId: string): Promise<void>;
}

export function getBrokermaticClient(): BrokermaticClient {
  // When Brokermatic API is ready, swap in RealBrokermaticClient:
  // if (process.env.BROKERMATIC_API_KEY) {
  //   return new RealBrokermaticClient(process.env.BROKERMATIC_API_KEY);
  // }
  const { MockBrokermaticClient } = require("./mock-client");
  return new MockBrokermaticClient();
}
