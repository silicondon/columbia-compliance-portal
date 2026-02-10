// Brokermatic Certificate Holder API - TypeScript Types
// These types match the API specification in docs/BROKERMATIC_CERTIFICATE_HOLDER_API.md

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    cursor: string | null;
    hasMore: boolean;
    total: number;
  };
}

// Insureds
export interface Insured {
  id: string;
  name: string;
  dba: string | null;
  ein: string | null;
  address: Address;
  contactEmail: string | null;
  contactPhone: string | null;
  contactName: string | null;
  externalId: string | null;
  metadata: Record<string, string>;
  certificateCount: number;
  complianceStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInsuredRequest {
  name: string;
  dba?: string | null;
  ein?: string | null;
  address: Address;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactName?: string | null;
  externalId?: string | null;
  metadata?: Record<string, string>;
}

export interface InsuredFilters {
  name?: string;
  external_id?: string;
  compliance_status?: string;
  limit?: number;
  cursor?: string;
}

// Certificates
export interface Coverage {
  id?: string;
  type: string;
  policyNumber: string | null;
  carrierName: string | null;
  effectiveDate: string;
  expirationDate: string;
  daysUntilExpiration?: number;
  limits: Record<string, number>;
  flags: Record<string, boolean>;
}

export interface Certificate {
  id: string;
  insuredId: string;
  certificateNumber: string | null;
  issueDate: string | null;
  source: "ai_extraction" | "manual_entry";
  status: "active" | "expired" | "expiring";
  complianceStatus: "compliant" | "non_compliant" | "partial" | "pending";
  coverages: Coverage[];
  hasDocument: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCertificateRequest {
  insuredId: string;
  storageKey?: string | null;
  certificateNumber?: string | null;
  issueDate?: string | null;
  source: "ai_extraction" | "manual_entry";
  coverages: Omit<Coverage, "id" | "daysUntilExpiration">[];
}

export interface CertificateFilters {
  insured_id?: string;
  insured_name?: string;
  status?: string;
  compliance_status?: string;
  coverage_type?: string;
  expiring_within_days?: number;
  updated_since?: string;
  limit?: number;
  cursor?: string;
}

// Documents
export interface UploadUrlResponse {
  uploadUrl: string;
  storageKey: string;
  expiresIn: number;
}

export interface DocumentDownloadResponse {
  downloadUrl: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  checksum: string;
  uploadedAt: string;
  expiresIn: number;
}

// Parsing
export interface ParseResponse {
  extractedData: {
    certificateNumber: string | null;
    issueDate: string | null;
    producer: {
      name: string;
      address: Address;
      contact: { name: string; phone: string; email: string };
    };
    namedInsured: { name: string; dba: string | null; address: Address };
    certificateHolder: { name: string; address: Address };
    coverages: Coverage[];
    descriptionOfOperations: string | null;
    cancellationNotice: { daysNotice: number; text: string } | null;
  };
  confidence: number;
  warnings: string[];
}

// Requirements
export interface CoverageRequirement {
  type: string;
  required: boolean;
  minLimits: Record<string, number>;
  requiredFlags: string[];
}

export interface Requirement {
  id: string;
  name: string;
  description: string | null;
  coverages: CoverageRequirement[];
  assignedInsuredCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRequirementRequest {
  name: string;
  description?: string | null;
  coverages: CoverageRequirement[];
}

// Compliance
export interface ComplianceResult {
  certificateId: string;
  insuredId: string;
  requirementId: string;
  overallStatus: "compliant" | "non_compliant" | "partial";
  checkedAt: string;
  results: {
    coverageType: string;
    status: "pass" | "fail" | "missing";
    details: {
      limitsCheck: { limitName: string; required: number; actual: number | null; pass: boolean }[];
      flagsCheck: { flag: string; required: boolean; actual: boolean; pass: boolean }[];
      expirationCheck: { expirationDate: string | null; isExpired: boolean; daysUntilExpiration: number | null };
    };
  }[];
}

export interface ComplianceSummary {
  totalInsureds: number;
  withRequirements: number;
  compliant: number;
  nonCompliant: number;
  partiallyCompliant: number;
  expiringWithin30Days: number;
  expiringWithin60Days: number;
  expiringWithin90Days: number;
  expired: number;
  noCertificateOnFile: number;
  exempt: number;
  lastCalculatedAt: string;
}

export interface ExpiringCertificate {
  certificateId: string;
  insuredId: string;
  insuredName: string;
  insuredExternalId: string | null;
  insuredContactEmail: string | null;
  insuredContactPhone: string | null;
  coverageType: string;
  policyNumber: string | null;
  carrierName: string | null;
  expirationDate: string;
  daysUntilExpiration: number;
}

export interface ComplianceGap {
  insuredId: string;
  insuredName: string;
  insuredExternalId: string | null;
  certificateId: string | null;
  gapType: "missing_coverage" | "insufficient_limits" | "expired" | "missing_flag" | "expiring_soon";
  coverageType: string;
  details: string;
  severity: "critical" | "warning" | "info";
  detectedAt: string;
}

export interface InsuredCompliance {
  insuredId: string;
  insuredName: string;
  overallStatus: string;
  assignedRequirement: { id: string; name: string } | null;
  coverages: {
    type: string;
    status: string;
    certificateId: string | null;
    policyNumber: string | null;
    expirationDate: string | null;
    daysUntilExpiration: number | null;
    limitsStatus: string;
    flagsStatus: string;
  }[];
  lastCheckedAt: string | null;
}
