-- AlterTable
ALTER TABLE "User" ADD COLUMN "avatarUrl" TEXT;

-- CreateTable
CREATE TABLE "StudentGroup" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT DEFAULT '#3B82F6',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdById" INTEGER NOT NULL,
    CONSTRAINT "StudentGroup_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudentGroupMember" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StudentGroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StudentGroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "StudentGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExamGroup" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "examId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    CONSTRAINT "ExamGroup_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExamGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "StudentGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'info',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER,
    "groupId" INTEGER,
    "examId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Notification_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "StudentGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Notification_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Exam" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "examTypeId" INTEGER,
    "startAt" DATETIME,
    "endAt" DATETIME,
    "questions" TEXT,
    "config" TEXT,
    "isScheduled" BOOLEAN NOT NULL DEFAULT false,
    "scheduledAt" DATETIME,
    "rescheduledAt" DATETIME,
    "rescheduleReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Exam_examTypeId_fkey" FOREIGN KEY ("examTypeId") REFERENCES "ExamType" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Exam" ("config", "createdAt", "description", "endAt", "examTypeId", "id", "questions", "startAt", "status", "title", "updatedAt") SELECT "config", "createdAt", "description", "endAt", "examTypeId", "id", "questions", "startAt", "status", "title", "updatedAt" FROM "Exam";
DROP TABLE "Exam";
ALTER TABLE "new_Exam" RENAME TO "Exam";
CREATE INDEX "Exam_status_examTypeId_createdAt_idx" ON "Exam"("status", "examTypeId", "createdAt");
CREATE INDEX "Exam_title_idx" ON "Exam"("title");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "StudentGroup_isActive_idx" ON "StudentGroup"("isActive");

-- CreateIndex
CREATE INDEX "StudentGroup_createdById_idx" ON "StudentGroup"("createdById");

-- CreateIndex
CREATE INDEX "StudentGroupMember_userId_idx" ON "StudentGroupMember"("userId");

-- CreateIndex
CREATE INDEX "StudentGroupMember_groupId_idx" ON "StudentGroupMember"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentGroupMember_userId_groupId_key" ON "StudentGroupMember"("userId", "groupId");

-- CreateIndex
CREATE INDEX "ExamGroup_examId_idx" ON "ExamGroup"("examId");

-- CreateIndex
CREATE INDEX "ExamGroup_groupId_idx" ON "ExamGroup"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamGroup_examId_groupId_key" ON "ExamGroup"("examId", "groupId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_groupId_idx" ON "Notification"("groupId");

-- CreateIndex
CREATE INDEX "Notification_examId_idx" ON "Notification"("examId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Question_title_idx" ON "Question"("title");

-- CreateIndex
CREATE INDEX "Question_status_idx" ON "Question"("status");

-- CreateIndex
CREATE INDEX "User_name_idx" ON "User"("name");

-- CreateIndex
CREATE INDEX "UserUpdateRequest_createdAt_idx" ON "UserUpdateRequest"("createdAt");
