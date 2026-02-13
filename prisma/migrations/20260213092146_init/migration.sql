-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "offerName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "researchUrls" TEXT[],
    "brandUrls" TEXT[],
    "destinationUrl" TEXT NOT NULL,
    "trackingUrls" TEXT[],
    "geos" TEXT[],
    "languages" TEXT[],
    "popunderEnabled" BOOLEAN NOT NULL DEFAULT false,
    "silentFetchEnabled" BOOLEAN NOT NULL DEFAULT false,
    "autoTriggerDelay" INTEGER NOT NULL DEFAULT 3000,
    "autoRedirectDelay" INTEGER NOT NULL DEFAULT 0,
    "autoTriggerOnInaction" BOOLEAN NOT NULL DEFAULT false,
    "subdomain" TEXT,
    "metadata" JSONB,
    "lastResearchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClickSession" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL DEFAULT 'default',
    "ip" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "referrer" TEXT,
    "gclid" TEXT,
    "gbraid" TEXT,
    "wbraid" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClickSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversion" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL DEFAULT 'default',
    "ip" TEXT,
    "userAgent" TEXT,
    "revenue" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lander" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "cta" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lander_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_subdomain_key" ON "Campaign"("subdomain");

-- AddForeignKey
ALTER TABLE "ClickSession" ADD CONSTRAINT "ClickSession_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversion" ADD CONSTRAINT "Conversion_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
