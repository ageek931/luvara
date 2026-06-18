import { Router } from "express";
import Stripe from "stripe";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createCheckoutSchema, createSubscriptionSchema, updateSubscriptionSchema } from "../schemas/payment.schema";
import { config } from "../config";
import { NotFoundError } from "../utils/errors";

const stripe = new Stripe(config.STRIPE_SECRET_KEY, { apiVersion: "2024-11-20.acacia" as any });
const router = Router();

function getPlanPrice(tier: string, period: string): { cents: number; stripePriceId: string } {
  if (tier === "premium") {
    return period === "monthly"
      ? { cents: 1499, stripePriceId: "price_premium_monthly" }
      : { cents: 10799, stripePriceId: "price_premium_annual" };
  }
  return period === "monthly"
    ? { cents: 3499, stripePriceId: "price_elite_monthly" }
    : { cents: 23999, stripePriceId: "price_elite_annual" };
}

router.get("/plans", async (_req, res, next) => {
  try {
    const plans = await prisma.plan.findMany({ where: { isActive: true } });
    res.json({ success: true, data: { plans } });
  } catch (error) {
    next(error);
  }
});

router.post("/create-checkout", authenticate, validate(createCheckoutSchema), async (req, res, next) => {
  try {
    const { priceId, successUrl, cancelUrl } = req.body;
    const userId = req.user!.userId;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      metadata: { userId },
    });

    res.json({ success: true, data: { url: session.url, sessionId: session.id } });
  } catch (error) {
    next(error);
  }
});

router.post("/create-subscription", authenticate, validate(createSubscriptionSchema), async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const { planTier, billingPeriod } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("User not found");

    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId },
      });
      stripeCustomerId = customer.id;
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId },
      });
    }

    const { stripePriceId } = getPlanPrice(planTier, billingPeriod);

    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: stripePriceId }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
      metadata: { userId, planTier, billingPeriod },
    });

    const plan = await prisma.plan.findFirst({
      where: { tier: planTier, billingPeriod: billingPeriod as any, isActive: true },
    });

    if (plan) {
      await prisma.subscription.create({
        data: {
          userId,
          planId: plan.id,
          stripeSubscriptionId: subscription.id,
          status: subscription.status as any,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        },
      });
    }

    res.json({
      success: true,
      data: {
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/subscription", authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;

    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: { in: ["active", "trialing", "past_due"] } },
      orderBy: { createdAt: "desc" },
      include: { plan: true },
    });

    res.json({ success: true, data: { subscription } });
  } catch (error) {
    next(error);
  }
});

router.post("/subscription/cancel", authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;

    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: { in: ["active", "trialing"] } },
      orderBy: { createdAt: "desc" },
    });

    if (!subscription?.stripeSubscriptionId) {
      res.status(400).json({ success: false, error: "No active subscription found" });
      return;
    }

    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "canceled", canceledAt: new Date() },
    });

    res.json({ success: true, data: { message: "Subscription canceled" } });
  } catch (error) {
    next(error);
  }
});

router.get("/history", authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: { userId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.payment.count({ where: { userId } }),
    ]);

    res.json({
      success: true,
      data: {
        payments,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/webhook", async (req, res, next) => {
  try {
    const sig = req.headers["stripe-signature"] as string;
    let event: Stripe.Event;

    if (config.STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(req.body, sig, config.STRIPE_WEBHOOK_SECRET);
    } else {
      event = req.body;
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: { stripeCustomerId: session.customer as string },
          });
        }
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = invoice.subscription as string;
        if (subId) {
          await prisma.subscription.update({
            where: { stripeSubscriptionId: subId },
            data: { status: "active" },
          });
          const sub = await prisma.subscription.findUnique({
            where: { stripeSubscriptionId: subId },
          });
          if (sub && invoice.amount_paid > 0) {
            await prisma.payment.create({
              data: {
                userId: sub.userId,
                stripePaymentIntentId: invoice.payment_intent as string,
                stripeInvoiceId: invoice.id,
                amountCents: invoice.amount_paid,
                status: "succeeded",
                planId: sub.planId,
              },
            });
          }
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.subscription.update({
          where: { stripeSubscriptionId: sub.id },
          data: { status: sub.status as any },
        });
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
});

export default router;
