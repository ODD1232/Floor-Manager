-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('unskilled', 'skilled', 'highly_skilled');

-- CreateEnum
CREATE TYPE "Round2Type" AS ENUM ('test', 'interview');

-- CreateEnum
CREATE TYPE "RoundStatus" AS ENUM ('pending', 'passed', 'failed');

-- CreateEnum
CREATE TYPE "CandidateStatus" AS ENUM ('PENDING', 'IN_ROUND2', 'IN_ROUND3', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "Contractor" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contractor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "aadharNo" TEXT NOT NULL,
    "qualification" TEXT NOT NULL,
    "photoPath" TEXT,
    "aadharPhotoPath" TEXT,
    "resumePath" TEXT,
    "hasExperience" BOOLEAN NOT NULL DEFAULT false,
    "prevPosition" TEXT,
    "prevCompany" TEXT,
    "prevLocation" TEXT,
    "experienceLetterPath" TEXT,
    "relevanceLetterPath" TEXT,
    "wasOnContract" BOOLEAN NOT NULL DEFAULT false,
    "contractDuration" TEXT,
    "contractorId" INTEGER,
    "skillLevel" "SkillLevel",
    "department" TEXT,
    "currentRound" INTEGER NOT NULL DEFAULT 1,
    "round2Type" "Round2Type",
    "round21Status" "RoundStatus",
    "round22Status" "RoundStatus",
    "round3Status" "RoundStatus",
    "overallStatus" "CandidateStatus" NOT NULL DEFAULT 'PENDING',
    "signaturePath" TEXT,
    "signedById" INTEGER,
    "signedAt" TIMESTAMP(3),
    "remarks" TEXT,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contractor_name_key" ON "Contractor"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_aadharNo_key" ON "Candidate"("aadharNo");

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "Contractor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
