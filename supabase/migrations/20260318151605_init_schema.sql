-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "WorkspacePlan" AS ENUM ('free', 'starter', 'growth', 'agency');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('owner', 'admin', 'member', 'viewer');

-- CreateEnum
CREATE TYPE "ContactBounceType" AS ENUM ('hard', 'soft');

-- CreateEnum
CREATE TYPE "ContactListType" AS ENUM ('static', 'dynamic');

-- CreateEnum
CREATE TYPE "PipelineStageType" AS ENUM ('open', 'won', 'lost');

-- CreateEnum
CREATE TYPE "DealStatus" AS ENUM ('open', 'won', 'lost');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('note', 'call', 'meeting', 'email_sent', 'email_opened', 'email_clicked', 'email_bounced', 'email_complained', 'deal_created', 'deal_stage_changed', 'deal_won', 'deal_lost', 'contact_created', 'task_completed', 'sequence_enrolled', 'sequence_completed', 'sequence_unsubscribed');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('call', 'email', 'meeting', 'task');

-- CreateEnum
CREATE TYPE "EmailConfigMode" AS ENUM ('flowlyst_pool', 'byos');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "CampaignRecipientType" AS ENUM ('list', 'segment', 'tag', 'all');

-- CreateEnum
CREATE TYPE "EmailQueueStatus" AS ENUM ('pending', 'sending', 'sent', 'failed', 'skipped');

-- CreateEnum
CREATE TYPE "EmailEventType" AS ENUM ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'unsubscribed');

-- CreateEnum
CREATE TYPE "TrackingTokenType" AS ENUM ('open', 'click');

-- CreateEnum
CREATE TYPE "SequenceTriggerType" AS ENUM ('manual', 'list_added', 'tag_added', 'deal_stage_changed', 'webhook');

-- CreateEnum
CREATE TYPE "SequenceStatus" AS ENUM ('draft', 'active', 'paused', 'archived');

-- CreateEnum
CREATE TYPE "SequenceStepType" AS ENUM ('email', 'wait', 'condition');

-- CreateEnum
CREATE TYPE "SequenceStepDelayUnit" AS ENUM ('hours', 'days', 'business_days');

-- CreateEnum
CREATE TYPE "SequenceStepConditionType" AS ENUM ('opened', 'clicked', 'replied');

-- CreateEnum
CREATE TYPE "SequenceEnrollmentStatus" AS ENUM ('active', 'completed', 'unsubscribed', 'exited', 'failed');

-- CreateTable
CREATE TABLE "workspaces" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "logo_url" TEXT,
    "timezone" VARCHAR(255) NOT NULL DEFAULT 'America/New_York',
    "plan" "WorkspacePlan" NOT NULL DEFAULT 'free',
    "trial_ends_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_members" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'member',
    "invited_by" UUID,
    "joined_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspace_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_invites" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'member',
    "token" VARCHAR(255) NOT NULL,
    "invited_by" UUID NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "accepted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspace_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(255),
    "last_name" VARCHAR(255),
    "phone" VARCHAR(50),
    "company" VARCHAR(255),
    "title" VARCHAR(255),
    "website" TEXT,
    "avatar_url" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "custom_fields" JSONB NOT NULL DEFAULT '{}',
    "unsubscribed" BOOLEAN NOT NULL DEFAULT false,
    "unsubscribed_at" TIMESTAMPTZ,
    "bounced" BOOLEAN NOT NULL DEFAULT false,
    "bounced_at" TIMESTAMPTZ,
    "bounce_type" "ContactBounceType",
    "source" VARCHAR(50),
    "owner_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_lists" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "type" "ContactListType" NOT NULL DEFAULT 'static',
    "filter_rules" JSONB,
    "contact_count" INTEGER NOT NULL DEFAULT 0,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_list_members" (
    "list_id" UUID NOT NULL,
    "contact_id" UUID NOT NULL,
    "added_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_list_members_pkey" PRIMARY KEY ("list_id","contact_id")
);

-- CreateTable
CREATE TABLE "pipelines" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL DEFAULT 'Sales Pipeline',
    "is_default" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pipelines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pipeline_stages" (
    "id" UUID NOT NULL,
    "pipeline_id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "type" "PipelineStageType" NOT NULL DEFAULT 'open',
    "probability" INTEGER NOT NULL DEFAULT 50,
    "color" VARCHAR(20) NOT NULL DEFAULT '#6366f1',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pipeline_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deals" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "value" DECIMAL(12,2),
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "stage_id" UUID NOT NULL,
    "pipeline_id" UUID NOT NULL,
    "owner_id" UUID,
    "close_date" DATE,
    "probability" INTEGER,
    "status" "DealStatus" NOT NULL DEFAULT 'open',
    "custom_fields" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deal_contacts" (
    "deal_id" UUID NOT NULL,
    "contact_id" UUID NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "deal_contacts_pkey" PRIMARY KEY ("deal_id","contact_id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "contact_id" UUID,
    "deal_id" UUID,
    "type" "ActivityType" NOT NULL,
    "subject" VARCHAR(500),
    "body" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "performed_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "contact_id" UUID,
    "deal_id" UUID,
    "title" VARCHAR(500) NOT NULL,
    "notes" TEXT,
    "type" "TaskType" NOT NULL DEFAULT 'task',
    "due_at" TIMESTAMPTZ,
    "assigned_to" UUID,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMPTZ,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_email_configs" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "mode" "EmailConfigMode" NOT NULL DEFAULT 'flowlyst_pool',
    "aws_region" VARCHAR(50) NOT NULL DEFAULT 'us-east-1',
    "aws_key_vault_id" TEXT,
    "from_name" VARCHAR(255) NOT NULL DEFAULT 'Flowlyst',
    "from_email" VARCHAR(255),
    "reply_to" VARCHAR(255),
    "max_send_rate" INTEGER NOT NULL DEFAULT 14,
    "verified_at" TIMESTAMPTZ,
    "dkim_status" VARCHAR(50),
    "spf_status" VARCHAR(50),
    "dmarc_status" VARCHAR(50),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspace_email_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_templates" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(998) NOT NULL,
    "html_content" TEXT NOT NULL,
    "text_content" TEXT,
    "blocks_json" JSONB,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(998) NOT NULL,
    "preheader" VARCHAR(255),
    "from_name" VARCHAR(255) NOT NULL,
    "from_email" VARCHAR(255) NOT NULL,
    "reply_to" VARCHAR(255),
    "html_content" TEXT NOT NULL,
    "text_content" TEXT,
    "blocks_json" JSONB,
    "recipient_type" "CampaignRecipientType" NOT NULL,
    "recipient_ids" UUID[],
    "recipient_tags" TEXT[],
    "status" "CampaignStatus" NOT NULL DEFAULT 'draft',
    "scheduled_for" TIMESTAMPTZ,
    "sent_at" TIMESTAMPTZ,
    "total_recipients" INTEGER NOT NULL DEFAULT 0,
    "stat_sent" INTEGER NOT NULL DEFAULT 0,
    "stat_delivered" INTEGER NOT NULL DEFAULT 0,
    "stat_opened" INTEGER NOT NULL DEFAULT 0,
    "stat_clicked" INTEGER NOT NULL DEFAULT 0,
    "stat_bounced" INTEGER NOT NULL DEFAULT 0,
    "stat_complained" INTEGER NOT NULL DEFAULT 0,
    "stat_unsubscribed" INTEGER NOT NULL DEFAULT 0,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_queue" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "campaign_id" UUID,
    "sequence_step_id" UUID,
    "contact_id" UUID NOT NULL,
    "to_email" VARCHAR(255) NOT NULL,
    "from_name" VARCHAR(255) NOT NULL,
    "from_email" VARCHAR(255) NOT NULL,
    "reply_to" VARCHAR(255),
    "subject" VARCHAR(998) NOT NULL,
    "html_content" TEXT NOT NULL,
    "text_content" TEXT,
    "status" "EmailQueueStatus" NOT NULL DEFAULT 'pending',
    "send_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sent_at" TIMESTAMPTZ,
    "ses_message_id" TEXT,
    "error_message" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_events" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "contact_id" UUID,
    "campaign_id" UUID,
    "sequence_step_id" UUID,
    "email_queue_id" UUID,
    "ses_message_id" TEXT,
    "type" "EmailEventType" NOT NULL,
    "link_url" TEXT,
    "bounce_type" VARCHAR(10),
    "user_agent" TEXT,
    "ip_address" VARCHAR(45),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_tracking_tokens" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "contact_id" UUID NOT NULL,
    "campaign_id" UUID,
    "sequence_step_id" UUID,
    "email_queue_id" UUID,
    "type" "TrackingTokenType" NOT NULL,
    "destination_url" TEXT,
    "token" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_tracking_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sequences" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "trigger_type" "SequenceTriggerType" NOT NULL,
    "trigger_config" JSONB NOT NULL DEFAULT '{}',
    "status" "SequenceStatus" NOT NULL DEFAULT 'draft',
    "exit_conditions" JSONB NOT NULL DEFAULT '{}',
    "created_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sequences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sequence_steps" (
    "id" UUID NOT NULL,
    "sequence_id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "type" "SequenceStepType" NOT NULL,
    "subject" VARCHAR(998),
    "html_content" TEXT,
    "text_content" TEXT,
    "from_name" VARCHAR(255),
    "from_email" VARCHAR(255),
    "delay_value" INTEGER,
    "delay_unit" "SequenceStepDelayUnit",
    "condition_type" "SequenceStepConditionType",
    "yes_step_id" UUID,
    "no_step_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sequence_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sequence_enrollments" (
    "id" UUID NOT NULL,
    "sequence_id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "contact_id" UUID NOT NULL,
    "current_step_id" UUID,
    "status" "SequenceEnrollmentStatus" NOT NULL DEFAULT 'active',
    "next_step_at" TIMESTAMPTZ,
    "enrolled_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ,

    CONSTRAINT "sequence_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "body" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth_key" TEXT NOT NULL,
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "workspaces_slug_key" ON "workspaces"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_members_workspace_id_user_id_key" ON "workspace_members"("workspace_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_invites_token_key" ON "workspace_invites"("token");

-- CreateIndex
CREATE INDEX "idx_contacts_workspace" ON "contacts"("workspace_id");

-- CreateIndex
CREATE INDEX "idx_contacts_email" ON "contacts"("workspace_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_workspace_id_email_key" ON "contacts"("workspace_id", "email");

-- CreateIndex
CREATE INDEX "idx_deals_workspace" ON "deals"("workspace_id");

-- CreateIndex
CREATE INDEX "idx_deals_stage" ON "deals"("stage_id");

-- CreateIndex
CREATE INDEX "idx_deals_owner" ON "deals"("owner_id");

-- CreateIndex
CREATE INDEX "idx_activities_contact" ON "activities"("contact_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_activities_deal" ON "activities"("deal_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_activities_workspace" ON "activities"("workspace_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "workspace_email_configs_workspace_id_key" ON "workspace_email_configs"("workspace_id");

-- CreateIndex
CREATE INDEX "idx_campaigns_workspace" ON "campaigns"("workspace_id");

-- CreateIndex
CREATE INDEX "idx_campaigns_status" ON "campaigns"("status", "scheduled_for");

-- CreateIndex
CREATE INDEX "idx_email_queue_pending" ON "email_queue"("workspace_id", "status", "send_at");

-- CreateIndex
CREATE INDEX "idx_email_events_contact" ON "email_events"("contact_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_email_events_campaign" ON "email_events"("campaign_id", "type");

-- CreateIndex
CREATE INDEX "idx_email_events_ses" ON "email_events"("ses_message_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_tracking_tokens_token_key" ON "email_tracking_tokens"("token");

-- CreateIndex
CREATE INDEX "idx_tracking_token" ON "email_tracking_tokens"("token");

-- CreateIndex
CREATE INDEX "idx_sequence_enrollments_active" ON "sequence_enrollments"("workspace_id", "status", "next_step_at");

-- CreateIndex
CREATE UNIQUE INDEX "sequence_enrollments_sequence_id_contact_id_enrolled_at_key" ON "sequence_enrollments"("sequence_id", "contact_id", "enrolled_at");

-- CreateIndex
CREATE INDEX "idx_notifications_user" ON "notifications"("user_id", "read", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_user_id_endpoint_key" ON "push_subscriptions"("user_id", "endpoint");

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_invites" ADD CONSTRAINT "workspace_invites_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_lists" ADD CONSTRAINT "contact_lists_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_list_members" ADD CONSTRAINT "contact_list_members_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "contact_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_list_members" ADD CONSTRAINT "contact_list_members_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pipelines" ADD CONSTRAINT "pipelines_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pipeline_stages" ADD CONSTRAINT "pipeline_stages_pipeline_id_fkey" FOREIGN KEY ("pipeline_id") REFERENCES "pipelines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pipeline_stages" ADD CONSTRAINT "pipeline_stages_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_stage_id_fkey" FOREIGN KEY ("stage_id") REFERENCES "pipeline_stages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_pipeline_id_fkey" FOREIGN KEY ("pipeline_id") REFERENCES "pipelines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deal_contacts" ADD CONSTRAINT "deal_contacts_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deal_contacts" ADD CONSTRAINT "deal_contacts_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_email_configs" ADD CONSTRAINT "workspace_email_configs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_queue" ADD CONSTRAINT "email_queue_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_queue" ADD CONSTRAINT "email_queue_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_queue" ADD CONSTRAINT "email_queue_sequence_step_id_fkey" FOREIGN KEY ("sequence_step_id") REFERENCES "sequence_steps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_queue" ADD CONSTRAINT "email_queue_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_events" ADD CONSTRAINT "email_events_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_events" ADD CONSTRAINT "email_events_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_events" ADD CONSTRAINT "email_events_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_events" ADD CONSTRAINT "email_events_sequence_step_id_fkey" FOREIGN KEY ("sequence_step_id") REFERENCES "sequence_steps"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_events" ADD CONSTRAINT "email_events_email_queue_id_fkey" FOREIGN KEY ("email_queue_id") REFERENCES "email_queue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_tracking_tokens" ADD CONSTRAINT "email_tracking_tokens_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_tracking_tokens" ADD CONSTRAINT "email_tracking_tokens_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_tracking_tokens" ADD CONSTRAINT "email_tracking_tokens_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_tracking_tokens" ADD CONSTRAINT "email_tracking_tokens_sequence_step_id_fkey" FOREIGN KEY ("sequence_step_id") REFERENCES "sequence_steps"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_tracking_tokens" ADD CONSTRAINT "email_tracking_tokens_email_queue_id_fkey" FOREIGN KEY ("email_queue_id") REFERENCES "email_queue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sequences" ADD CONSTRAINT "sequences_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sequence_steps" ADD CONSTRAINT "sequence_steps_sequence_id_fkey" FOREIGN KEY ("sequence_id") REFERENCES "sequences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sequence_steps" ADD CONSTRAINT "sequence_steps_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sequence_steps" ADD CONSTRAINT "sequence_steps_yes_step_id_fkey" FOREIGN KEY ("yes_step_id") REFERENCES "sequence_steps"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sequence_steps" ADD CONSTRAINT "sequence_steps_no_step_id_fkey" FOREIGN KEY ("no_step_id") REFERENCES "sequence_steps"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sequence_enrollments" ADD CONSTRAINT "sequence_enrollments_sequence_id_fkey" FOREIGN KEY ("sequence_id") REFERENCES "sequences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sequence_enrollments" ADD CONSTRAINT "sequence_enrollments_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sequence_enrollments" ADD CONSTRAINT "sequence_enrollments_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sequence_enrollments" ADD CONSTRAINT "sequence_enrollments_current_step_id_fkey" FOREIGN KEY ("current_step_id") REFERENCES "sequence_steps"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;



-- RLS helper function
CREATE OR REPLACE FUNCTION public.user_workspace_ids()
RETURNS uuid[] AS $$
  SELECT array_agg(DISTINCT wm.workspace_id)::uuid[]
  FROM public.workspace_members wm
  WHERE wm.user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

ALTER TABLE public."workspaces" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."workspace_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."workspace_invites" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."contacts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."contact_lists" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."contact_list_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."pipelines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."pipeline_stages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."deals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."deal_contacts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."activities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."workspace_email_configs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."email_templates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."campaigns" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."email_queue" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."email_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."email_tracking_tokens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."sequences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."sequence_steps" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."sequence_enrollments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."push_subscriptions" ENABLE ROW LEVEL SECURITY;

-- Policy for workspace_members
CREATE POLICY "Workspace members can manage workspace_members" ON public."workspace_members"
  FOR ALL USING (workspace_id = ANY(user_workspace_ids())) WITH CHECK (workspace_id = ANY(user_workspace_ids()));

-- Policy for workspace_invites
CREATE POLICY "Workspace members can manage workspace_invites" ON public."workspace_invites"
  FOR ALL USING (workspace_id = ANY(user_workspace_ids())) WITH CHECK (workspace_id = ANY(user_workspace_ids()));

-- Policy for contacts
CREATE POLICY "Workspace members can manage contacts" ON public."contacts"
  FOR ALL USING (workspace_id = ANY(user_workspace_ids())) WITH CHECK (workspace_id = ANY(user_workspace_ids()));

-- Policy for contact_lists
CREATE POLICY "Workspace members can manage contact_lists" ON public."contact_lists"
  FOR ALL USING (workspace_id = ANY(user_workspace_ids())) WITH CHECK (workspace_id = ANY(user_workspace_ids()));

-- Policy for pipelines
CREATE POLICY "Workspace members can manage pipelines" ON public."pipelines"
  FOR ALL USING (workspace_id = ANY(user_workspace_ids())) WITH CHECK (workspace_id = ANY(user_workspace_ids()));

-- Policy for pipeline_stages
CREATE POLICY "Workspace members can manage pipeline_stages" ON public."pipeline_stages"
  FOR ALL USING (workspace_id = ANY(user_workspace_ids())) WITH CHECK (workspace_id = ANY(user_workspace_ids()));

-- Policy for deals
CREATE POLICY "Workspace members can manage deals" ON public."deals"
  FOR ALL USING (workspace_id = ANY(user_workspace_ids())) WITH CHECK (workspace_id = ANY(user_workspace_ids()));

-- Policy for activities
CREATE POLICY "Workspace members can manage activities" ON public."activities"
  FOR ALL USING (workspace_id = ANY(user_workspace_ids())) WITH CHECK (workspace_id = ANY(user_workspace_ids()));

-- Policy for tasks
CREATE POLICY "Workspace members can manage tasks" ON public."tasks"
  FOR ALL USING (workspace_id = ANY(user_workspace_ids())) WITH CHECK (workspace_id = ANY(user_workspace_ids()));

-- Policy for workspace_email_configs
CREATE POLICY "Workspace members can manage workspace_email_configs" ON public."workspace_email_configs"
  FOR ALL USING (workspace_id = ANY(user_workspace_ids())) WITH CHECK (workspace_id = ANY(user_workspace_ids()));

-- Policy for email_templates
CREATE POLICY "Workspace members can manage email_templates" ON public."email_templates"
  FOR ALL USING (workspace_id = ANY(user_workspace_ids())) WITH CHECK (workspace_id = ANY(user_workspace_ids()));

-- Policy for campaigns
CREATE POLICY "Workspace members can manage campaigns" ON public."campaigns"
  FOR ALL USING (workspace_id = ANY(user_workspace_ids())) WITH CHECK (workspace_id = ANY(user_workspace_ids()));

-- Policy for email_queue
CREATE POLICY "Workspace members can manage email_queue" ON public."email_queue"
  FOR ALL USING (workspace_id = ANY(user_workspace_ids())) WITH CHECK (workspace_id = ANY(user_workspace_ids()));

-- Policy for email_events
CREATE POLICY "Workspace members can manage email_events" ON public."email_events"
  FOR ALL USING (workspace_id = ANY(user_workspace_ids())) WITH CHECK (workspace_id = ANY(user_workspace_ids()));

-- Policy for email_tracking_tokens
CREATE POLICY "Workspace members can manage email_tracking_tokens" ON public."email_tracking_tokens"
  FOR ALL USING (workspace_id = ANY(user_workspace_ids())) WITH CHECK (workspace_id = ANY(user_workspace_ids()));

-- Policy for sequences
CREATE POLICY "Workspace members can manage sequences" ON public."sequences"
  FOR ALL USING (workspace_id = ANY(user_workspace_ids())) WITH CHECK (workspace_id = ANY(user_workspace_ids()));

-- Policy for sequence_steps
CREATE POLICY "Workspace members can manage sequence_steps" ON public."sequence_steps"
  FOR ALL USING (workspace_id = ANY(user_workspace_ids())) WITH CHECK (workspace_id = ANY(user_workspace_ids()));

-- Policy for sequence_enrollments
CREATE POLICY "Workspace members can manage sequence_enrollments" ON public."sequence_enrollments"
  FOR ALL USING (workspace_id = ANY(user_workspace_ids())) WITH CHECK (workspace_id = ANY(user_workspace_ids()));

-- Policy for notifications
CREATE POLICY "Workspace members can manage notifications" ON public."notifications"
  FOR ALL USING (workspace_id = ANY(user_workspace_ids())) WITH CHECK (workspace_id = ANY(user_workspace_ids()));

-- Policy for push_subscriptions
CREATE POLICY "Workspace members can manage push_subscriptions" ON public."push_subscriptions"
  FOR ALL USING (workspace_id = ANY(user_workspace_ids())) WITH CHECK (workspace_id = ANY(user_workspace_ids()));

-- TODO: Add RLS policy for workspaces
-- Policy for contact_list_members
CREATE POLICY "Workspace members can manage contact_list_members" ON public."contact_list_members"
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.contact_lists cl
    WHERE cl.id = list_id AND cl.workspace_id = ANY(user_workspace_ids())
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM public.contact_lists cl
    WHERE cl.id = list_id AND cl.workspace_id = ANY(user_workspace_ids())
  ));

-- Policy for deal_contacts
CREATE POLICY "Workspace members can manage deal_contacts" ON public."deal_contacts"
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.deals d
    WHERE d.id = deal_id AND d.workspace_id = ANY(user_workspace_ids())
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM public.deals d
    WHERE d.id = deal_id AND d.workspace_id = ANY(user_workspace_ids())
  ));

-- Helper functions (e.g., for pg_cron)
CREATE OR REPLACE FUNCTION public.process_email_queue()
RETURNS void AS $$
BEGIN
  -- Dequeue and send emails via SES Edge Function trigger
  PERFORM net.http_post(
    url := format('https://%s.supabase.co/functions/v1/email-sender', COALESCE((SELECT project_ref FROM public.project_config LIMIT 1), current_setting('app.project_ref', true)))::text,
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.current_jwt', true)),
    body := jsonb_build_object('batch_size', 14)
  );
END;
$$ LANGUAGE plpgsql;

-- pg_cron jobs
SELECT cron.schedule('email-queue-processor', '* * * * *', 'SELECT process_email_queue();');


  );
END;
$$ LANGUAGE plpgsql;

-- pg_cron jobs
SELECT cron.schedule('email-queue-processor', '* * * * *', 'SELECT process_email_queue();');

-queue-processor', '* * * * *', 'SELECT process_email_queue();');

obs
SELECT cron.schedule('email-queue-processor', '* * * * *', 'SELECT process_email_queue();');


  );
END;
$$ LANGUAGE plpgsql;

-- pg_cron jobs
SELECT cron.schedule('email-queue-processor', '* * * * *', 'SELECT process_email_queue();');

