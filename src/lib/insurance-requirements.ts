/**
 * Columbia University Insurance Requirements
 *
 * Standard insurance requirements for all vendors and contractors
 * performing work on Columbia University premises or on behalf of
 * Columbia University.
 */

export const COLUMBIA_INSURANCE_REQUIREMENTS = `
COLUMBIA UNIVERSITY INSURANCE REQUIREMENTS FOR VENDORS

All vendors and contractors performing work on Columbia University premises or on behalf of Columbia University must maintain the following insurance coverage:

1. COMMERCIAL GENERAL LIABILITY
   - Minimum Limits:
     * $2,000,000 per occurrence
     * $4,000,000 general aggregate
   - Additional Insured: Columbia University, its trustees, officers, employees, and agents must be named as additional insured
   - Waiver of Subrogation in favor of Columbia University
   - Primary and Non-Contributory coverage

2. WORKERS' COMPENSATION AND EMPLOYER'S LIABILITY
   - Workers' Compensation: Statutory limits for the state in which work is performed
   - Employer's Liability:
     * $500,000 each accident
     * $500,000 disease - policy limit
     * $500,000 disease - each employee
   - Waiver of Subrogation in favor of Columbia University

3. COMMERCIAL AUTOMOBILE LIABILITY (if applicable)
   - Minimum Limits: $1,000,000 combined single limit
   - Coverage for owned, hired, and non-owned vehicles
   - Additional Insured: Columbia University

4. PROFESSIONAL LIABILITY (if applicable to scope of work)
   - Minimum Limits: $1,000,000 per claim and aggregate

5. UMBRELLA/EXCESS LIABILITY (recommended for high-risk work)
   - Minimum Limits: $5,000,000 per occurrence

CERTIFICATE HOLDER:
Columbia University
615 West 131st Street
New York, NY 10027

Description of Operations: [Project-specific work description will be added based on contract]

ADDITIONAL REQUIREMENTS:
- All insurance must be placed with insurers rated A- VII or better by A.M. Best
- Certificates of Insurance must be provided prior to commencement of work
- 30 days advance notice of cancellation, non-renewal, or material change required
- Coverage must be maintained for the duration of the contract and any warranty period
- Contractor is responsible for ensuring all subcontractors maintain adequate insurance

COMPLIANCE:
Failure to maintain required insurance coverage may result in:
- Suspension of work authorization
- Withholding of payments
- Termination of contract
- Vendor suspension from Columbia University vendor list

For questions regarding insurance requirements, contact:
Columbia University Risk Management
insurance@columbia.edu
(212) 854-1234
`;

/**
 * Get Columbia's standard compliance requirements in Brokermatic Smart COI API format
 */
export function getColumbiaComplianceRequirements(projectDescription: string = 'General work for Columbia University') {
  return {
    holderId: 'ch_columbia_university',
    projectDescription,
    deadline: undefined, // No specific deadline for ongoing vendors
    requirements: {
      generalLiability: {
        required: true,
        minLimits: {
          eachOccurrence: 2000000,
          generalAggregate: 4000000,
        },
        requireAdditionalInsured: true,
        requireWaiverOfSubrogation: true,
        requirePrimaryNonContributory: true,
      },
      workersCompensation: {
        required: true,
        requireStatutoryLimits: true,
        requireWaiverOfSubrogation: true,
      },
      autoLiability: {
        required: false, // Optional - only if vendor uses vehicles
        minLimits: {
          combinedSingleLimit: 1000000,
        },
      },
      umbrellaLiability: {
        required: false, // Recommended but not required
        minLimits: {
          eachOccurrence: 5000000,
        },
      },
    },
  };
}

/**
 * Coverage types that Columbia typically requires
 */
export const COLUMBIA_REQUIRED_COVERAGES = [
  'general_liability',
  'workers_compensation',
] as const;

/**
 * Optional coverage types based on vendor work type
 */
export const COLUMBIA_OPTIONAL_COVERAGES = {
  autoLiability: 'For vendors using vehicles on university property',
  professionalLiability: 'For professional services (consulting, design, etc.)',
  umbrellaLiability: 'For high-risk construction work',
  cyberLiability: 'For IT vendors with access to university systems',
} as const;

/**
 * Minimum limits by coverage type
 */
export const COLUMBIA_MINIMUM_LIMITS = {
  general_liability: {
    eachOccurrence: 2000000,
    generalAggregate: 4000000,
    productsCompletedOps: 4000000,
    personalAdvertisingInjury: 2000000,
  },
  workers_compensation: {
    statutoryLimits: true,
    elEachAccident: 500000,
    elDiseasePolicyLimit: 500000,
    elDiseaseEachEmployee: 500000,
  },
  auto_liability: {
    combinedSingleLimit: 1000000,
  },
  professional_liability: {
    perClaim: 1000000,
    aggregate: 1000000,
  },
  umbrella_liability: {
    eachOccurrence: 5000000,
    aggregate: 5000000,
  },
} as const;
