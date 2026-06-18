import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const plans = [
    { name: "Core", tier: "core", billingPeriod: "monthly" as const, priceCents: 0, currency: "usd" },
    { name: "Premium Monthly", tier: "premium", billingPeriod: "monthly" as const, priceCents: 1499, currency: "usd" },
    { name: "Premium Annual", tier: "premium", billingPeriod: "annual" as const, priceCents: 10799, currency: "usd" },
    { name: "Elite Monthly", tier: "elite", billingPeriod: "monthly" as const, priceCents: 3499, currency: "usd" },
    { name: "Elite Annual", tier: "elite", billingPeriod: "annual" as const, priceCents: 23999, currency: "usd" },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { tier_billingPeriod: { tier: plan.tier, billingPeriod: plan.billingPeriod } },
      create: plan,
      update: plan,
    });
  }

  console.log("Plans seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
