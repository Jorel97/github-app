ALTER TABLE "Bounty"
ADD COLUMN "issueTitle" TEXT,
ADD COLUMN "issueUrl" TEXT,
ADD COLUMN "issueState" TEXT,
ADD COLUMN "issueExcerpt" TEXT,
ADD COLUMN "issueCreatedAt" TIMESTAMP(3),
ADD COLUMN "issueUpdatedAt" TIMESTAMP(3);
