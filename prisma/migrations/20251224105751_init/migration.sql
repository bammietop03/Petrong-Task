-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('LIKE', 'LAUGH', 'DISLIKE', 'CLAP');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "isSubscribed" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionEndDate" TIMESTAMP(3),
    "paystackCustomerId" TEXT,
    "paystackSubscriptionCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "todos" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "todos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reactions" (
    "id" TEXT NOT NULL,
    "type" "ReactionType" NOT NULL,
    "todoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "todoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shares" (
    "id" TEXT NOT NULL,
    "todoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "todos_userId_idx" ON "todos"("userId");

-- CreateIndex
CREATE INDEX "reactions_todoId_idx" ON "reactions"("todoId");

-- CreateIndex
CREATE INDEX "reactions_userId_idx" ON "reactions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "reactions_todoId_userId_type_key" ON "reactions"("todoId", "userId", "type");

-- CreateIndex
CREATE INDEX "comments_todoId_idx" ON "comments"("todoId");

-- CreateIndex
CREATE INDEX "comments_userId_idx" ON "comments"("userId");

-- CreateIndex
CREATE INDEX "shares_todoId_idx" ON "shares"("todoId");

-- CreateIndex
CREATE INDEX "shares_userId_idx" ON "shares"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "shares_todoId_userId_key" ON "shares"("todoId", "userId");

-- AddForeignKey
ALTER TABLE "todos" ADD CONSTRAINT "todos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_todoId_fkey" FOREIGN KEY ("todoId") REFERENCES "todos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_todoId_fkey" FOREIGN KEY ("todoId") REFERENCES "todos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shares" ADD CONSTRAINT "shares_todoId_fkey" FOREIGN KEY ("todoId") REFERENCES "todos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shares" ADD CONSTRAINT "shares_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
