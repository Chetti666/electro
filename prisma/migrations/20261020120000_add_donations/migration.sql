-- CreateEnum
CREATE TYPE "DonationStatus" AS ENUM ('PENDING', 'PAID', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Donation" (
    "id" SERIAL NOT NULL,
    "commerceOrder" TEXT NOT NULL,
    "token" TEXT,
    "flowOrder" INTEGER,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CLP',
    "email" TEXT NOT NULL,
    "name" TEXT,
    "message" TEXT,
    "status" "DonationStatus" NOT NULL DEFAULT 'PENDING',
    "payer" TEXT,
    "paymentData" JSONB,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Donation_commerceOrder_key" ON "Donation"("commerceOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Donation_token_key" ON "Donation"("token");

-- CreateIndex
CREATE INDEX "Donation_status_createdAt_idx" ON "Donation"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Donation_userId_createdAt_idx" ON "Donation"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
