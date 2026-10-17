-- DropIndex
DROP INDEX "form_submissions_email_idx";

-- DropIndex
DROP INDEX "newsletter_subscribers_email_idx";

-- DropIndex
DROP INDEX "newsletter_subscribers_email_key";

-- AlterTable
ALTER TABLE "form_submissions" ADD COLUMN     "email_index" TEXT;

-- AlterTable
ALTER TABLE "newsletter_subscribers" ADD COLUMN     "email_index" TEXT;

-- CreateIndex
CREATE INDEX "form_submissions_email_index_idx" ON "form_submissions"("email_index");

-- CreateIndex
CREATE INDEX "newsletter_subscribers_email_index_idx" ON "newsletter_subscribers"("email_index");

