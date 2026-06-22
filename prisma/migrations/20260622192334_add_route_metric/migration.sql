-- CreateTable
CREATE TABLE "RouteMetric" (
    "id" SERIAL NOT NULL,
    "path" TEXT NOT NULL,
    "visits" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RouteMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RouteMetric_path_key" ON "RouteMetric"("path");
