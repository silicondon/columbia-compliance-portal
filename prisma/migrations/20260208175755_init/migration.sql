-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "vmsId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dba" TEXT,
    "ein" TEXT,
    "address1" TEXT,
    "address2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "phone" TEXT,
    "fax" TEXT,
    "email" TEXT,
    "emailMaximo" TEXT,
    "emailUnifier" TEXT,
    "contactPerson" TEXT,
    "primaryTrade" TEXT,
    "unionStatus" TEXT,
    "mwlStatus" TEXT,
    "maximoEnabled" BOOLEAN NOT NULL DEFAULT false,
    "facilities" BOOLEAN NOT NULL DEFAULT false,
    "construction" BOOLEAN NOT NULL DEFAULT false,
    "paymentLien" BOOLEAN NOT NULL DEFAULT false,
    "exemptFromInsurance" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'active',
    "suspendedDate" TIMESTAMP(3),
    "suspendedReason" TEXT,
    "brokermaticInsuredId" TEXT,
    "arcVendorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceRequirement" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "brokermaticReqId" TEXT,
    "glRequired" DECIMAL(15,2),
    "glAggregate" DECIMAL(15,2),
    "glEachOccurrence" DECIMAL(15,2),
    "excessRequired" DECIMAL(15,2),
    "excessAggregate" DECIMAL(15,2),
    "excessEachOccurrence" DECIMAL(15,2),
    "autoRequired" DECIMAL(15,2),
    "autoAggregate" DECIMAL(15,2),
    "autoEachOccurrence" DECIMAL(15,2),
    "envRequired" DECIMAL(15,2),
    "envAggregate" DECIMAL(15,2),
    "envEachOccurrence" DECIMAL(15,2),
    "profRequired" DECIMAL(15,2),
    "profAggregate" DECIMAL(15,2),
    "profEachOccurrence" DECIMAL(15,2),
    "workersCompRequired" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsuranceRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "brokermaticCertId" TEXT,
    "coverageType" TEXT NOT NULL,
    "policyNumber" TEXT,
    "carrierName" TEXT,
    "requiredAmount" DECIMAL(15,2),
    "aggregateAmount" DECIMAL(15,2),
    "eachOccurrenceAmount" DECIMAL(15,2),
    "effectiveDate" TIMESTAMP(3),
    "expirationDate" TIMESTAMP(3),
    "complianceStatus" TEXT NOT NULL DEFAULT 'pending',
    "lastCheckedAt" TIMESTAMP(3),
    "documentPath" TEXT,
    "documentFilename" TEXT,
    "documentSize" INTEGER,
    "documentChecksum" TEXT,
    "notifiedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "contractType" TEXT NOT NULL,
    "title" TEXT,
    "contractNumber" TEXT,
    "signature" TEXT,
    "beginDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "saContractValue" DECIMAL(15,2),
    "saContractLength" TEXT,
    "notifiedDate" TIMESTAMP(3),
    "documentPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorRate" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rateCategory" TEXT NOT NULL,
    "rateSubCategory" TEXT,
    "regularHourly" DECIMAL(10,2),
    "premiumHourly" DECIMAL(10,2),
    "doubleHourly" DECIMAL(10,2),
    "materialMarkup" DECIMAL(5,2),
    "subMarkup" DECIMAL(5,2),
    "equipmentMarkup" DECIMAL(5,2),
    "effectiveDate" TIMESTAMP(3),
    "expirationDate" TIMESTAMP(3),
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnionRateSheet" (
    "id" TEXT NOT NULL,
    "trade" TEXT NOT NULL,
    "code" TEXT,
    "unionName" TEXT,
    "fund" TEXT,
    "regularRate" DECIMAL(10,2),
    "premiumRate" DECIMAL(10,2),
    "doubleRate" DECIMAL(10,2),
    "foremanRegular" DECIMAL(10,2),
    "foremanPremium" DECIMAL(10,2),
    "foremanDouble" DECIMAL(10,2),
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnionRateSheet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_vmsId_key" ON "Vendor"("vmsId");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_brokermaticInsuredId_key" ON "Vendor"("brokermaticInsuredId");

-- CreateIndex
CREATE INDEX "Vendor_name_idx" ON "Vendor"("name");

-- CreateIndex
CREATE INDEX "Vendor_primaryTrade_idx" ON "Vendor"("primaryTrade");

-- CreateIndex
CREATE INDEX "Vendor_status_idx" ON "Vendor"("status");

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceRequirement_vendorId_key" ON "InsuranceRequirement"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_brokermaticCertId_key" ON "Certificate"("brokermaticCertId");

-- CreateIndex
CREATE INDEX "Certificate_vendorId_idx" ON "Certificate"("vendorId");

-- CreateIndex
CREATE INDEX "Certificate_coverageType_idx" ON "Certificate"("coverageType");

-- CreateIndex
CREATE INDEX "Certificate_expirationDate_idx" ON "Certificate"("expirationDate");

-- CreateIndex
CREATE INDEX "Certificate_complianceStatus_idx" ON "Certificate"("complianceStatus");

-- CreateIndex
CREATE INDEX "Contract_vendorId_idx" ON "Contract"("vendorId");

-- CreateIndex
CREATE INDEX "VendorRate_vendorId_idx" ON "VendorRate"("vendorId");

-- CreateIndex
CREATE INDEX "VendorRate_rateCategory_idx" ON "VendorRate"("rateCategory");

-- CreateIndex
CREATE INDEX "UnionRateSheet_trade_idx" ON "UnionRateSheet"("trade");

-- CreateIndex
CREATE INDEX "UnionRateSheet_effectiveDate_idx" ON "UnionRateSheet"("effectiveDate");

-- AddForeignKey
ALTER TABLE "InsuranceRequirement" ADD CONSTRAINT "InsuranceRequirement_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorRate" ADD CONSTRAINT "VendorRate_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
