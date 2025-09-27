-- CreateIndex
CREATE INDEX "Category_active_idx" ON "Category"("active");

-- CreateIndex
CREATE INDEX "Category_order_idx" ON "Category"("order");

-- CreateIndex
CREATE INDEX "Exam_status_examTypeId_createdAt_idx" ON "Exam"("status", "examTypeId", "createdAt");

-- CreateIndex
CREATE INDEX "ExamType_active_idx" ON "ExamType"("active");

-- CreateIndex
CREATE INDEX "ExamType_order_idx" ON "ExamType"("order");

-- CreateIndex
CREATE INDEX "Option_questionId_idx" ON "Option"("questionId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");

-- CreateIndex
CREATE INDEX "Question_subjectId_subSubjectId_categoryId_idx" ON "Question"("subjectId", "subSubjectId", "categoryId");

-- CreateIndex
CREATE INDEX "Question_difficulty_idx" ON "Question"("difficulty");

-- CreateIndex
CREATE INDEX "Question_createdAt_idx" ON "Question"("createdAt");

-- CreateIndex
CREATE INDEX "SubSubject_subjectId_idx" ON "SubSubject"("subjectId");

-- CreateIndex
CREATE INDEX "Subject_active_idx" ON "Subject"("active");

-- CreateIndex
CREATE INDEX "Subject_order_idx" ON "Subject"("order");

-- CreateIndex
CREATE INDEX "User_status_role_createdAt_idx" ON "User"("status", "role", "createdAt");

-- CreateIndex
CREATE INDEX "UserUpdateRequest_userId_idx" ON "UserUpdateRequest"("userId");

-- CreateIndex
CREATE INDEX "UserUpdateRequest_status_idx" ON "UserUpdateRequest"("status");

-- CreateIndex
CREATE INDEX "UserUpdateRequest_reviewedById_idx" ON "UserUpdateRequest"("reviewedById");
