-- CreateEnum
CREATE TYPE "CalculationType" AS ENUM ('SECCION', 'CAIDA_TENSION', 'CORRIENTE_POTENCIA', 'EMPALME', 'SECCION_RIC');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('PRESUPUESTO', 'RESISTIVIDAD_SEV', 'FOTOGRAFICO_RIC18', 'INSPECCION');

-- CreateTable
CREATE TABLE "Calculation" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "CalculationType" NOT NULL,
    "title" TEXT,
    "input" JSONB NOT NULL,
    "result" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Calculation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedReport" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "ReportType" NOT NULL,
    "title" TEXT NOT NULL,
    "clientName" TEXT,
    "reference" TEXT,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Calculation_userId_createdAt_idx" ON "Calculation"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SavedReport_userId_createdAt_idx" ON "SavedReport"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Calculation" ADD CONSTRAINT "Calculation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedReport" ADD CONSTRAINT "SavedReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
