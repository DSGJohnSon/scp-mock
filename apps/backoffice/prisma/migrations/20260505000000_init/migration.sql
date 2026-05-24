-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'MONITEUR', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "public"."StageType" AS ENUM ('INITIATION', 'PROGRESSION', 'AUTONOMIE', 'DOUBLE');

-- CreateEnum
CREATE TYPE "public"."StageBookingType" AS ENUM ('INITIATION', 'PROGRESSION', 'AUTONOMIE');

-- CreateEnum
CREATE TYPE "public"."CartItemType" AS ENUM ('STAGE');

-- CreateEnum
CREATE TYPE "public"."DiscountType" AS ENUM ('FIXED', 'PERCENTAGE');

-- CreateEnum
CREATE TYPE "public"."AudienceRuleType" AS ENUM ('CLIENT_RESERVED_STAGE', 'STAGIAIRE_STAGE', 'ORDER_ABOVE_AMOUNT', 'CLIENT_NO_ORDER', 'STAGIAIRE_NO_BOOKING');

-- CreateEnum
CREATE TYPE "public"."CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."SmsStatus" AS ENUM ('ACCEPTED', 'QUEUED', 'SENDING', 'SENT', 'DELIVERED', 'UNDELIVERED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('PENDING', 'PAID', 'PARTIALLY_PAID', 'FULLY_PAID', 'CONFIRMED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."ManualPaymentMethod" AS ENUM ('CARD', 'BANK_TRANSFER', 'CASH', 'CHECK');

-- CreateEnum
CREATE TYPE "public"."PaymentType" AS ENUM ('STRIPE', 'MANUAL');

-- CreateTable
CREATE TABLE "public"."user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "avatarUrl" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Stage" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 7,
    "places" INTEGER NOT NULL DEFAULT 6,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 350.0,
    "acomptePrice" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    "type" "public"."StageType" NOT NULL DEFAULT 'INITIATION',
    "promotionOriginalPrice" DOUBLE PRECISION,
    "promotionEndDate" TIMESTAMP(3),
    "promotionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StagePromotionHistory" (
    "id" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "originalPrice" DOUBLE PRECISION NOT NULL,
    "promotedPrice" DOUBLE PRECISION NOT NULL,
    "discountPercent" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "endDate" TIMESTAMP(3),
    "appliedBy" TEXT,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StagePromotionHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StageMoniteur" (
    "id" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "moniteurId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StageMoniteur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StageBooking" (
    "id" TEXT NOT NULL,
    "shortCode" TEXT,
    "type" "public"."StageBookingType" NOT NULL DEFAULT 'INITIATION',
    "stageId" TEXT NOT NULL,
    "stagiaireId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StageBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Client" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "rgpdConsentAt" TIMESTAMP(3),
    "rgpdConsentIp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Stagiaire" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "weight" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "rgpdConsentAt" TIMESTAMP(3),
    "rgpdConsentIp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stagiaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CartSession" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CartItem" (
    "id" TEXT NOT NULL,
    "type" "public"."CartItemType" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "stageId" TEXT,
    "participantData" JSONB NOT NULL,
    "cartSessionId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "isExpired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Order" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'PENDING',
    "subtotal" DOUBLE PRECISION NOT NULL,
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "promoCodeId" TEXT,
    "promoDiscountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "clientId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "type" "public"."CartItemType" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "stageId" TEXT,
    "participantData" JSONB NOT NULL,
    "depositAmount" DOUBLE PRECISION,
    "remainingAmount" DOUBLE PRECISION,
    "isFullyPaid" BOOLEAN NOT NULL DEFAULT false,
    "finalPaymentDate" TIMESTAMP(3),
    "finalPaymentNote" TEXT,
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "effectiveDepositAmount" DOUBLE PRECISION,
    "effectiveRemainingAmount" DOUBLE PRECISION,
    "finalDiscountAmount" DOUBLE PRECISION,
    "finalDiscountNote" TEXT,
    "finalDiscountDate" TIMESTAMP(3),
    "stageBookingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PaymentAllocation" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "allocatedAmount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "paymentType" "public"."PaymentType" NOT NULL DEFAULT 'STRIPE',
    "stripePaymentIntentId" TEXT,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'eur',
    "stripeMetadata" JSONB,
    "isManual" BOOLEAN NOT NULL DEFAULT false,
    "manualPaymentMethod" "public"."ManualPaymentMethod",
    "manualPaymentNote" TEXT,
    "recordedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProcessedWebhookEvent" (
    "id" TEXT NOT NULL,
    "stripeEventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "orderId" TEXT,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PromoCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT,
    "recipientNote" TEXT,
    "discountType" "public"."DiscountType" NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL,
    "maxDiscountAmount" DOUBLE PRECISION,
    "minCartAmount" DOUBLE PRECISION,
    "maxUses" INTEGER,
    "currentUses" INTEGER NOT NULL DEFAULT 0,
    "applicableProductTypes" "public"."CartItemType"[] DEFAULT ARRAY[]::"public"."CartItemType"[],
    "expiryDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "campaignId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PromoCodeUsage" (
    "id" TEXT NOT NULL,
    "promoCodeId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "discountApplied" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromoCodeUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Audience" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Audience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AudienceRule" (
    "id" TEXT NOT NULL,
    "audienceId" TEXT NOT NULL,
    "ruleType" "public"."AudienceRuleType" NOT NULL,
    "stageType" "public"."StageBookingType",
    "minOrderAmount" DOUBLE PRECISION,
    "dateFrom" TIMESTAMP(3),
    "dateTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AudienceRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AudienceContact" (
    "id" TEXT NOT NULL,
    "audienceId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AudienceContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SmsCampaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "public"."CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "generatePromoCode" BOOLEAN NOT NULL DEFAULT false,
    "promoDiscountType" "public"."DiscountType",
    "promoDiscountValue" DOUBLE PRECISION,
    "promoMaxDiscountAmount" DOUBLE PRECISION,
    "promoMinCartAmount" DOUBLE PRECISION,
    "promoMaxUses" INTEGER,
    "promoExpiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmsCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SmsCampaignLog" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "recipientPhone" TEXT NOT NULL,
    "recipientName" TEXT,
    "messageSid" TEXT,
    "status" "public"."SmsStatus" NOT NULL DEFAULT 'QUEUED',
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmsCampaignLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_AudienceToSmsCampaign" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AudienceToSmsCampaign_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "public"."session"("token");

-- CreateIndex
CREATE INDEX "StagePromotionHistory_stageId_idx" ON "public"."StagePromotionHistory"("stageId");

-- CreateIndex
CREATE UNIQUE INDEX "StageMoniteur_stageId_moniteurId_key" ON "public"."StageMoniteur"("stageId", "moniteurId");

-- CreateIndex
CREATE UNIQUE INDEX "StageBooking_shortCode_key" ON "public"."StageBooking"("shortCode");

-- CreateIndex
CREATE INDEX "StageBooking_stageId_idx" ON "public"."StageBooking"("stageId");

-- CreateIndex
CREATE INDEX "StageBooking_stagiaireId_idx" ON "public"."StageBooking"("stagiaireId");

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "public"."Client"("email");

-- CreateIndex
CREATE INDEX "Client_email_idx" ON "public"."Client"("email");

-- CreateIndex
CREATE INDEX "Stagiaire_email_idx" ON "public"."Stagiaire"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CartSession_sessionId_key" ON "public"."CartSession"("sessionId");

-- CreateIndex
CREATE INDEX "CartSession_expiresAt_idx" ON "public"."CartSession"("expiresAt");

-- CreateIndex
CREATE INDEX "CartSession_sessionId_idx" ON "public"."CartSession"("sessionId");

-- CreateIndex
CREATE INDEX "CartItem_cartSessionId_idx" ON "public"."CartItem"("cartSessionId");

-- CreateIndex
CREATE INDEX "CartItem_expiresAt_idx" ON "public"."CartItem"("expiresAt");

-- CreateIndex
CREATE INDEX "CartItem_isExpired_idx" ON "public"."CartItem"("isExpired");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "public"."Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_orderNumber_idx" ON "public"."Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_clientId_idx" ON "public"."Order"("clientId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "public"."Order"("status");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "public"."Order"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "OrderItem_stageBookingId_key" ON "public"."OrderItem"("stageBookingId");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "public"."OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "PaymentAllocation_paymentId_idx" ON "public"."PaymentAllocation"("paymentId");

-- CreateIndex
CREATE INDEX "PaymentAllocation_orderItemId_idx" ON "public"."PaymentAllocation"("orderItemId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAllocation_paymentId_orderItemId_key" ON "public"."PaymentAllocation"("paymentId", "orderItemId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripePaymentIntentId_key" ON "public"."Payment"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "Payment_orderId_idx" ON "public"."Payment"("orderId");

-- CreateIndex
CREATE INDEX "Payment_stripePaymentIntentId_idx" ON "public"."Payment"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "Payment_status_createdAt_idx" ON "public"."Payment"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_status_isManual_createdAt_idx" ON "public"."Payment"("status", "isManual", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_status_paymentType_createdAt_idx" ON "public"."Payment"("status", "paymentType", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessedWebhookEvent_stripeEventId_key" ON "public"."ProcessedWebhookEvent"("stripeEventId");

-- CreateIndex
CREATE INDEX "ProcessedWebhookEvent_stripeEventId_idx" ON "public"."ProcessedWebhookEvent"("stripeEventId");

-- CreateIndex
CREATE INDEX "ProcessedWebhookEvent_eventType_idx" ON "public"."ProcessedWebhookEvent"("eventType");

-- CreateIndex
CREATE UNIQUE INDEX "PromoCode_code_key" ON "public"."PromoCode"("code");

-- CreateIndex
CREATE INDEX "PromoCode_code_idx" ON "public"."PromoCode"("code");

-- CreateIndex
CREATE INDEX "PromoCode_isActive_idx" ON "public"."PromoCode"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PromoCodeUsage_orderId_key" ON "public"."PromoCodeUsage"("orderId");

-- CreateIndex
CREATE INDEX "PromoCodeUsage_promoCodeId_idx" ON "public"."PromoCodeUsage"("promoCodeId");

-- CreateIndex
CREATE INDEX "AudienceRule_audienceId_idx" ON "public"."AudienceRule"("audienceId");

-- CreateIndex
CREATE INDEX "AudienceContact_audienceId_idx" ON "public"."AudienceContact"("audienceId");

-- CreateIndex
CREATE UNIQUE INDEX "AudienceContact_audienceId_phone_key" ON "public"."AudienceContact"("audienceId", "phone");

-- CreateIndex
CREATE INDEX "SmsCampaign_status_idx" ON "public"."SmsCampaign"("status");

-- CreateIndex
CREATE INDEX "SmsCampaignLog_campaignId_idx" ON "public"."SmsCampaignLog"("campaignId");

-- CreateIndex
CREATE INDEX "SmsCampaignLog_status_idx" ON "public"."SmsCampaignLog"("status");

-- CreateIndex
CREATE INDEX "_AudienceToSmsCampaign_B_index" ON "public"."_AudienceToSmsCampaign"("B");

-- AddForeignKey
ALTER TABLE "public"."session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StagePromotionHistory" ADD CONSTRAINT "StagePromotionHistory_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "public"."Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StageMoniteur" ADD CONSTRAINT "StageMoniteur_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "public"."Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StageMoniteur" ADD CONSTRAINT "StageMoniteur_moniteurId_fkey" FOREIGN KEY ("moniteurId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StageBooking" ADD CONSTRAINT "StageBooking_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "public"."Stage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StageBooking" ADD CONSTRAINT "StageBooking_stagiaireId_fkey" FOREIGN KEY ("stagiaireId") REFERENCES "public"."Stagiaire"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CartItem" ADD CONSTRAINT "CartItem_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "public"."Stage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CartItem" ADD CONSTRAINT "CartItem_cartSessionId_fkey" FOREIGN KEY ("cartSessionId") REFERENCES "public"."CartSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "public"."PromoCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "public"."Stage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_stageBookingId_fkey" FOREIGN KEY ("stageBookingId") REFERENCES "public"."StageBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentAllocation" ADD CONSTRAINT "PaymentAllocation_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "public"."Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentAllocation" ADD CONSTRAINT "PaymentAllocation_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "public"."OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_recordedBy_fkey" FOREIGN KEY ("recordedBy") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromoCode" ADD CONSTRAINT "PromoCode_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."SmsCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromoCodeUsage" ADD CONSTRAINT "PromoCodeUsage_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "public"."PromoCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromoCodeUsage" ADD CONSTRAINT "PromoCodeUsage_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AudienceRule" ADD CONSTRAINT "AudienceRule_audienceId_fkey" FOREIGN KEY ("audienceId") REFERENCES "public"."Audience"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AudienceContact" ADD CONSTRAINT "AudienceContact_audienceId_fkey" FOREIGN KEY ("audienceId") REFERENCES "public"."Audience"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SmsCampaignLog" ADD CONSTRAINT "SmsCampaignLog_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."SmsCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AudienceToSmsCampaign" ADD CONSTRAINT "_AudienceToSmsCampaign_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Audience"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AudienceToSmsCampaign" ADD CONSTRAINT "_AudienceToSmsCampaign_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."SmsCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

