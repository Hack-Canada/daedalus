#!/usr/bin/env bun
import * as readline from "readline";
/**
 * Script to reset ALL user passwords to a common password for testing purposes.
 *
 * ⚠️  WARNING: This is for development/testing ONLY. Never run in production!
 *
 * Usage:
 *   bun run scripts/reset-all-passwords.ts --dry-run    # Preview what would happen
 *   bun run scripts/reset-all-passwords.ts --confirm    # Actually reset passwords
 */

import { loadEnvConfig } from "@next/env";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";

import { db } from "../lib/db";
import { users } from "../lib/db/schema";

loadEnvConfig(process.cwd());

const NEW_PASSWORD = "Hello123@.";

function maskDbUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Mask password if present
    if (parsed.password) {
      parsed.password = "****";
    }
    return parsed.toString();
  } catch {
    // If URL parsing fails, just show first/last parts
    if (url.length > 40) {
      return url.slice(0, 20) + "..." + url.slice(-15);
    }
    return url;
  }
}

async function promptConfirmation(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "yes");
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes("--dry-run");
  const isConfirmed = args.includes("--confirm");

  // Always show DB URL first
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ ERROR: DATABASE_URL environment variable is not set!");
    process.exit(1);
  }

  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║          ⚠️  PASSWORD RESET SCRIPT - USE WITH CAUTION ⚠️          ║
╠══════════════════════════════════════════════════════════════════╣
║  This script will reset ALL user passwords to: ${NEW_PASSWORD}        ║
║                                                                  ║
║  ⚠️  WARNING: Only use this for development/testing!             ║
║  Never run this in production!                                   ║
╚══════════════════════════════════════════════════════════════════╝
`);

  console.log(`📦 Target Database:`);
  console.log(`   ${maskDbUrl(dbUrl)}\n`);

  if (!isDryRun && !isConfirmed) {
    console.log(`Usage:
  bun run scripts/reset-all-passwords.ts --dry-run    # Preview changes
  bun run scripts/reset-all-passwords.ts --confirm    # Apply changes
`);
    process.exit(0);
  }

  // Fetch all users
  const allUsers = await db
    .select({ id: users.id, email: users.email })
    .from(users);

  console.log(`Found ${allUsers.length} users in the database.\n`);

  if (isDryRun) {
    console.log("🔍 DRY RUN MODE - No changes will be made.\n");
    console.log("Users that would have their passwords reset:");
    allUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.email}`);
    });
    console.log(`\nTo actually reset passwords, run with --confirm flag.`);
    process.exit(0);
  }

  // Production safety check
  if (process.env.NODE_ENV === "production") {
    console.error("❌ ERROR: This script cannot be run in production!");
    console.error("   Set NODE_ENV to 'development' or 'test' to proceed.");
    process.exit(1);
  }

  // Interactive confirmation
  const confirmed = await promptConfirmation(
    `⚠️  Are you sure you want to reset ALL ${allUsers.length} user passwords in this database?\n   Type "yes" to confirm: `,
  );

  if (!confirmed) {
    console.log("\n❌ Operation cancelled.");
    process.exit(0);
  }

  console.log(`\n🔐 Hashing new password...`);
  const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);

  console.log(`📝 Updating all ${allUsers.length} user passwords...\n`);

  // Update all users
  const result = await db
    .update(users)
    .set({
      password: hashedPassword,
      sessionVersion: sql`${users.sessionVersion} + 1`,
    })
    .returning({ id: users.id, email: users.email });

  console.log(`✅ Successfully updated ${result.length} user passwords.\n`);
  console.log(
    `All accounts can now be accessed with password: ${NEW_PASSWORD}`,
  );
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
