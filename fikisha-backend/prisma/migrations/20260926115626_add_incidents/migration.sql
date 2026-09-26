-- CreateEnum
CREATE TYPE "IncidentType" AS ENUM ('DELAY', 'HAZARD', 'MECHANICAL', 'EMERGENCY');

-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "busId" TEXT NOT NULL,
    "type" "IncidentType" NOT NULL,
    "description" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Incident_schoolId_idx" ON "Incident"("schoolId");

-- CreateIndex
CREATE INDEX "Incident_busId_idx" ON "Incident"("busId");

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_busId_fkey" FOREIGN KEY ("busId") REFERENCES "Bus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
