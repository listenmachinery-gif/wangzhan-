-- CreateTable
CREATE TABLE "SitePage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "pageType" TEXT NOT NULL DEFAULT 'CUSTOM',
    "status" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "draftContent" JSONB NOT NULL,
    "publishedContent" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "publishedVersion" INTEGER,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SitePage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageVersion" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "action" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "PageVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SitePage_slug_key" ON "SitePage"("slug");
CREATE INDEX "SitePage_status_updatedAt_idx" ON "SitePage"("status", "updatedAt");
CREATE INDEX "SitePage_pageType_updatedAt_idx" ON "SitePage"("pageType", "updatedAt");
CREATE UNIQUE INDEX "PageVersion_pageId_version_key" ON "PageVersion"("pageId", "version");
CREATE INDEX "PageVersion_pageId_createdAt_idx" ON "PageVersion"("pageId", "createdAt");
CREATE INDEX "PageVersion_createdById_createdAt_idx" ON "PageVersion"("createdById", "createdAt");

-- AddForeignKey
ALTER TABLE "PageVersion" ADD CONSTRAINT "PageVersion_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "SitePage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PageVersion" ADD CONSTRAINT "PageVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
