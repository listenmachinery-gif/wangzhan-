BEGIN;

-- CreateEnum
CREATE TYPE "CrmRecordOrigin" AS ENUM ('WEBSITE_FORM', 'MANUAL', 'INTEGRATION');

-- CreateEnum
CREATE TYPE "CrmSourceChannel" AS ENUM ('WEBSITE', 'EMAIL', 'WHATSAPP', 'PHONE', 'FACEBOOK', 'LINKEDIN', 'TRADE_SHOW', 'REFERRAL', 'OTHER');

-- CreateEnum
CREATE TYPE "CustomerLevel" AS ENUM ('A', 'B', 'C', 'D');

-- CreateEnum
CREATE TYPE "CrmTeamMembershipRole" AS ENUM ('MEMBER', 'MANAGER', 'VIEWER');

-- CreateEnum
CREATE TYPE "CrmStageTransitionSource" AS ENUM ('SYSTEM', 'LEGACY_API', 'CRM_API', 'BACKFILL');

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "attributionSnapshot" JSONB,
ADD COLUMN     "companyId" TEXT,
ADD COLUMN     "contactId" TEXT,
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "customerLevel" "CustomerLevel",
ADD COLUMN     "estimatedCloseDate" TIMESTAMP(3),
ADD COLUMN     "estimatedCurrency" TEXT,
ADD COLUMN     "estimatedDealAmount" DECIMAL(19,4),
ADD COLUMN     "inquiryNumber" TEXT,
ADD COLUMN     "intentScore" INTEGER,
ADD COLUMN     "lastFollowUpAt" TIMESTAMP(3),
ADD COLUMN     "lastResultCode" TEXT,
ADD COLUMN     "lostReasonCode" TEXT,
ADD COLUMN     "lostReasonNote" TEXT,
ADD COLUMN     "preSpamStageId" TEXT,
ADD COLUMN     "recordOrigin" "CrmRecordOrigin",
ADD COLUMN     "sourceChannel" "CrmSourceChannel",
ADD COLUMN     "stageId" TEXT,
ADD COLUMN     "updatedById" TEXT,
ADD COLUMN     "wonAmount" DECIMAL(19,4),
ADD COLUMN     "wonCurrency" TEXT,
ADD COLUMN     "wonOrderNumber" TEXT;

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "companyCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "website" TEXT,
    "industry" TEXT,
    "companySize" TEXT,
    "countryCode" TEXT,
    "state" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "address" TEXT,
    "ownerId" TEXT,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "customerCode" TEXT NOT NULL,
    "companyId" TEXT,
    "fullName" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "jobTitle" TEXT,
    "department" TEXT,
    "email" TEXT,
    "normalizedEmail" TEXT,
    "phone" TEXT,
    "phoneE164" TEXT,
    "whatsapp" TEXT,
    "whatsappE164" TEXT,
    "countryCode" TEXT,
    "state" TEXT,
    "city" TEXT,
    "timezone" TEXT,
    "preferredLanguage" TEXT,
    "preferredContactMethod" TEXT,
    "preferredContactTime" TEXT,
    "customerLevel" "CustomerLevel",
    "customerStatus" TEXT,
    "ownerId" TEXT,
    "internalNotes" TEXT,
    "firstInquiryAt" TIMESTAMP(3),
    "lastInquiryAt" TIMESTAMP(3),
    "lastFollowUpAt" TIMESTAMP(3),
    "nextFollowUpAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmStage" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isTerminal" BOOLEAN NOT NULL DEFAULT false,
    "requiresReason" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CrmStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmTeam" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmTeamMembership" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "CrmTeamMembershipRole" NOT NULL DEFAULT 'MEMBER',
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmTeamMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadStageHistory" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "previousStageId" TEXT,
    "newStageId" TEXT NOT NULL,
    "previousStatus" "LeadStatus",
    "newStatus" "LeadStatus" NOT NULL,
    "actorId" TEXT,
    "reasonCode" TEXT,
    "reasonNote" TEXT,
    "source" "CrmStageTransitionSource" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadStageHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_companyCode_key" ON "Company"("companyCode");

-- CreateIndex
CREATE INDEX "Company_normalizedName_countryCode_idx" ON "Company"("normalizedName", "countryCode");

-- CreateIndex
CREATE INDEX "Company_ownerId_idx" ON "Company"("ownerId");

-- CreateIndex
CREATE INDEX "Company_createdById_idx" ON "Company"("createdById");

-- CreateIndex
CREATE INDEX "Company_updatedById_idx" ON "Company"("updatedById");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_customerCode_key" ON "Contact"("customerCode");

-- CreateIndex
CREATE INDEX "Contact_companyId_idx" ON "Contact"("companyId");

-- CreateIndex
CREATE INDEX "Contact_ownerId_idx" ON "Contact"("ownerId");

-- CreateIndex
CREATE INDEX "Contact_createdById_idx" ON "Contact"("createdById");

-- CreateIndex
CREATE INDEX "Contact_updatedById_idx" ON "Contact"("updatedById");

-- CreateIndex
CREATE INDEX "Contact_normalizedEmail_idx" ON "Contact"("normalizedEmail");

-- CreateIndex
CREATE INDEX "Contact_phoneE164_idx" ON "Contact"("phoneE164");

-- CreateIndex
CREATE INDEX "Contact_whatsappE164_idx" ON "Contact"("whatsappE164");

-- CreateIndex
CREATE UNIQUE INDEX "CrmStage_code_key" ON "CrmStage"("code");

-- CreateIndex
CREATE INDEX "CrmStage_isActive_position_idx" ON "CrmStage"("isActive", "position");

-- CreateIndex
CREATE INDEX "CrmTeam_createdById_idx" ON "CrmTeam"("createdById");

-- CreateIndex
CREATE INDEX "CrmTeam_updatedById_idx" ON "CrmTeam"("updatedById");

-- CreateIndex
CREATE INDEX "CrmTeamMembership_teamId_startsAt_endsAt_idx" ON "CrmTeamMembership"("teamId", "startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "CrmTeamMembership_userId_role_startsAt_endsAt_idx" ON "CrmTeamMembership"("userId", "role", "startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "CrmTeamMembership_createdById_idx" ON "CrmTeamMembership"("createdById");

-- CreateIndex
CREATE INDEX "CrmTeamMembership_updatedById_idx" ON "CrmTeamMembership"("updatedById");

-- CreateIndex
CREATE INDEX "LeadStageHistory_leadId_createdAt_idx" ON "LeadStageHistory"("leadId", "createdAt");

-- CreateIndex
CREATE INDEX "LeadStageHistory_previousStageId_idx" ON "LeadStageHistory"("previousStageId");

-- CreateIndex
CREATE INDEX "LeadStageHistory_newStageId_idx" ON "LeadStageHistory"("newStageId");

-- CreateIndex
CREATE INDEX "LeadStageHistory_actorId_idx" ON "LeadStageHistory"("actorId");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_inquiryNumber_key" ON "Lead"("inquiryNumber");

-- CreateIndex
CREATE INDEX "Lead_companyId_createdAt_idx" ON "Lead"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "Lead_contactId_createdAt_idx" ON "Lead"("contactId", "createdAt");

-- CreateIndex
CREATE INDEX "Lead_stageId_createdAt_idx" ON "Lead"("stageId", "createdAt");

-- CreateIndex
CREATE INDEX "Lead_preSpamStageId_idx" ON "Lead"("preSpamStageId");

-- CreateIndex
CREATE INDEX "Lead_createdById_idx" ON "Lead"("createdById");

-- CreateIndex
CREATE INDEX "Lead_updatedById_idx" ON "Lead"("updatedById");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmTeam" ADD CONSTRAINT "CrmTeam_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmTeam" ADD CONSTRAINT "CrmTeam_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmTeamMembership" ADD CONSTRAINT "CrmTeamMembership_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "CrmTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmTeamMembership" ADD CONSTRAINT "CrmTeamMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmTeamMembership" ADD CONSTRAINT "CrmTeamMembership_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmTeamMembership" ADD CONSTRAINT "CrmTeamMembership_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "CrmStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_preSpamStageId_fkey" FOREIGN KEY ("preSpamStageId") REFERENCES "CrmStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadStageHistory" ADD CONSTRAINT "LeadStageHistory_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadStageHistory" ADD CONSTRAINT "LeadStageHistory_previousStageId_fkey" FOREIGN KEY ("previousStageId") REFERENCES "CrmStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadStageHistory" ADD CONSTRAINT "LeadStageHistory_newStageId_fkey" FOREIGN KEY ("newStageId") REFERENCES "CrmStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadStageHistory" ADD CONSTRAINT "LeadStageHistory_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed the default sales stages
INSERT INTO "CrmStage" ("id", "code", "name", "position", "color", "isActive", "isTerminal", "requiresReason")
VALUES
    ('crm_stage_new_inquiry', 'NEW_INQUIRY', '新询盘', 1, '#2563EB', true, false, false),
    ('crm_stage_to_contact', 'TO_CONTACT', '待联系', 2, '#7C3AED', true, false, false),
    ('crm_stage_contacted', 'CONTACTED', '已联系', 3, '#0891B2', true, false, false),
    ('crm_stage_requirement_confirmed', 'REQUIREMENT_CONFIRMED', '需求已确认', 4, '#0D9488', true, false, false),
    ('crm_stage_solution_preparation', 'SOLUTION_PREPARATION', '方案准备中', 5, '#4F46E5', true, false, false),
    ('crm_stage_quotation_sent', 'QUOTATION_SENT', '已发送报价', 6, '#D97706', true, false, false),
    ('crm_stage_negotiation', 'NEGOTIATION', '商务谈判', 7, '#EA580C', true, false, false),
    ('crm_stage_awaiting_decision', 'AWAITING_DECISION', '等待客户决策', 8, '#CA8A04', true, false, false),
    ('crm_stage_order_confirmed', 'ORDER_CONFIRMED', '订单已确认', 9, '#65A30D', true, false, false),
    ('crm_stage_won', 'WON', '已成交', 10, '#16A34A', true, true, false),
    ('crm_stage_lost', 'LOST', '已流失', 11, '#DC2626', true, true, true),
    ('crm_stage_on_hold', 'ON_HOLD', '暂缓跟进', 12, '#64748B', true, false, false);

COMMIT;
