-- CreateEnum
CREATE TYPE "ChatConversationStatus" AS ENUM ('OPEN', 'PENDING', 'CLOSED', 'SPAM');

-- CreateEnum
CREATE TYPE "ChatSenderType" AS ENUM ('VISITOR', 'AGENT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ChatMessageType" AS ENUM ('TEXT', 'SYSTEM');

-- CreateTable
CREATE TABLE "ChatConversation" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "sessionId" TEXT,
    "leadId" TEXT,
    "environment" "AnalyticsEnvironment" NOT NULL,
    "status" "ChatConversationStatus" NOT NULL DEFAULT 'OPEN',
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactWhatsapp" TEXT,
    "lastMessageAt" TIMESTAMP(3),
    "visitorUnreadCount" INTEGER NOT NULL DEFAULT 0,
    "agentUnreadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderType" "ChatSenderType" NOT NULL,
    "senderUserId" TEXT,
    "type" "ChatMessageType" NOT NULL DEFAULT 'TEXT',
    "clientMessageId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "metadata" JSONB,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatAssignment" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "assigneeId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "ChatAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatConversation_environment_status_lastMessageAt_id_idx" ON "ChatConversation"("environment", "status", "lastMessageAt", "id");
CREATE INDEX "ChatConversation_visitorId_updatedAt_idx" ON "ChatConversation"("visitorId", "updatedAt");
CREATE INDEX "ChatConversation_leadId_updatedAt_idx" ON "ChatConversation"("leadId", "updatedAt");
CREATE UNIQUE INDEX "ChatMessage_conversationId_clientMessageId_key" ON "ChatMessage"("conversationId", "clientMessageId");
CREATE INDEX "ChatMessage_conversationId_sentAt_id_idx" ON "ChatMessage"("conversationId", "sentAt", "id");
CREATE INDEX "ChatMessage_senderUserId_sentAt_idx" ON "ChatMessage"("senderUserId", "sentAt");
CREATE INDEX "ChatAssignment_conversationId_endedAt_idx" ON "ChatAssignment"("conversationId", "endedAt");
CREATE INDEX "ChatAssignment_assigneeId_endedAt_idx" ON "ChatAssignment"("assigneeId", "endedAt");
CREATE INDEX "ChatAssignment_assignedById_assignedAt_idx" ON "ChatAssignment"("assignedById", "assignedAt");

-- AddForeignKey
ALTER TABLE "ChatConversation" ADD CONSTRAINT "ChatConversation_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "AnalyticsVisitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatConversation" ADD CONSTRAINT "ChatConversation_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AnalyticsSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ChatConversation" ADD CONSTRAINT "ChatConversation_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ChatConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ChatAssignment" ADD CONSTRAINT "ChatAssignment_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ChatConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatAssignment" ADD CONSTRAINT "ChatAssignment_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ChatAssignment" ADD CONSTRAINT "ChatAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
