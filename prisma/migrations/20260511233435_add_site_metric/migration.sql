-- CreateTable
CREATE TABLE "SiteMetric" (
    "id" SERIAL NOT NULL,
    "visits" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SiteMetric_pkey" PRIMARY KEY ("id")
);
