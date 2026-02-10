-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "brokerEmail" TEXT,
ADD COLUMN     "brokerName" TEXT,
ADD COLUMN     "insuranceComplianceAt" TIMESTAMP(3),
ADD COLUMN     "insuranceRequestedAt" TIMESTAMP(3),
ADD COLUMN     "insuranceStatus" TEXT;

-- CreateTable
CREATE TABLE "CertificateRequest" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "brokermaticRequestId" TEXT,
    "externalId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "legalText" TEXT NOT NULL,
    "coverageTypes" JSONB NOT NULL,
    "minimumLimits" JSONB,
    "uploadedAt" TIMESTAMP(3),
    "validatedAt" TIMESTAMP(3),
    "complianceResult" JSONB,
    "certificateUrl" TEXT,
    "certificatePdfKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CertificateRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CertificateRequest_externalId_key" ON "CertificateRequest"("externalId");

-- CreateIndex
CREATE INDEX "CertificateRequest_vendorId_idx" ON "CertificateRequest"("vendorId");

-- CreateIndex
CREATE INDEX "CertificateRequest_status_idx" ON "CertificateRequest"("status");

-- CreateIndex
CREATE INDEX "CertificateRequest_externalId_idx" ON "CertificateRequest"("externalId");

-- AddForeignKey
ALTER TABLE "CertificateRequest" ADD CONSTRAINT "CertificateRequest_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
