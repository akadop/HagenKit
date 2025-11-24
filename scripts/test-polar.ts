#!/usr/bin/env tsx
/**
 * Polar Integration Test Script
 * 
 * This script tests your Polar integration to ensure:
 * - Environment variables are configured correctly
 * - API connection is working
 * - You can create checkout sessions
 * - Products are accessible
 * 
 * Usage: pnpm test:polar
 */

import { Polar } from "@polar-sh/sdk";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const REQUIRED_VARS = ["POLAR_ACCESS_TOKEN", "POLAR_SERVER"];

function checkEnvVars(): boolean {
  console.log("🔍 Checking environment variables...\n");
  
  let allPresent = true;
  for (const varName of REQUIRED_VARS) {
    const value = process.env[varName];
    if (!value) {
      console.error(`❌ Missing: ${varName}`);
      allPresent = false;
    } else {
      console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
    }
  }
  
  console.log("");
  return allPresent;
}

async function testPolarConnection() {
  console.log("🔌 Testing Polar API connection...\n");
  
  try {
    const client = new Polar({
      accessToken: process.env.POLAR_ACCESS_TOKEN,
      server: process.env.POLAR_SERVER === "production" ? "production" : "sandbox",
    });

    // Test connection by listing products
    const products = await client.products.list({
      organizationId: process.env.POLAR_ORG_ID,
    });

    console.log(`✅ Successfully connected to Polar ${process.env.POLAR_SERVER} API`);
    console.log(`📦 Found ${products.items?.length || 0} products\n`);
    
    return { client, products };
  } catch (error: any) {
    console.error("❌ Failed to connect to Polar API");
    console.error("Error:", error.message);
    return null;
  }
}

async function listProducts(client: Polar) {
  console.log("📋 Listing available products...\n");
  
  try {
    const products = await client.products.list({
      organizationId: process.env.POLAR_ORG_ID,
    });

    if (!products.items || products.items.length === 0) {
      console.log("⚠️  No products found. Create some in your Polar dashboard first.");
      return;
    }

    products.items.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Type: ${product.type || 'N/A'}`);
      console.log(`   Status: ${product.isArchived ? 'Archived' : 'Active'}`);
      console.log("");
    });
  } catch (error: any) {
    console.error("❌ Failed to list products");
    console.error("Error:", error.message);
  }
}

async function testCheckoutCreation(client: Polar) {
  console.log("🛒 Testing checkout session creation...\n");
  
  try {
    // Get first product for testing
    const products = await client.products.list({
      organizationId: process.env.POLAR_ORG_ID,
    });

    if (!products.items || products.items.length === 0) {
      console.log("⚠️  Skipping checkout test - no products available");
      return;
    }

    const testProduct = products.items[0];
    console.log(`Using product: ${testProduct.name} (${testProduct.id})`);

    const checkout = await client.checkouts.custom.create({
      productId: testProduct.id,
      successUrl: "http://localhost:3000/dashboard/billing?success=true",
    });

    console.log(`✅ Checkout session created successfully`);
    console.log(`   Checkout URL: ${checkout.url}`);
    console.log(`   ID: ${checkout.id}`);
    console.log("");
    console.log("💡 You can test the checkout by visiting the URL above");
  } catch (error: any) {
    console.error("❌ Failed to create checkout session");
    console.error("Error:", error.message);
  }
}

async function main() {
  console.log("╔════════════════════════════════════════╗");
  console.log("║   Polar Integration Test Script       ║");
  console.log("╚════════════════════════════════════════╝\n");

  // Check environment variables
  const envOk = checkEnvVars();
  if (!envOk) {
    console.error("\n❌ Please configure missing environment variables");
    process.exit(1);
  }

  // Test API connection
  const result = await testPolarConnection();
  if (!result) {
    console.error("\n❌ Cannot proceed without API connection");
    process.exit(1);
  }

  const { client } = result;

  // List products
  await listProducts(client);

  // Test checkout creation
  await testCheckoutCreation(client);

  console.log("╔════════════════════════════════════════╗");
  console.log("║   ✅ All tests completed!              ║");
  console.log("╚════════════════════════════════════════╝\n");
  
  console.log("Next steps:");
  console.log("1. Copy Product IDs from above to config/plans.ts");
  console.log("2. Set up your webhook URL in Polar dashboard");
  console.log("3. Test the checkout flow in your app");
}

main().catch((error) => {
  console.error("\n💥 Unexpected error:", error);
  process.exit(1);
});
