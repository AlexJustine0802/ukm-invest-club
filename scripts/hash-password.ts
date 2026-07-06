import bcrypt from "bcryptjs";

/**
 * Generate the ADMIN_PASSWORD_HASH value for the admin login.
 * Usage: npm run hash-password -- "YourSecretPassword"
 *
 * The value is base64-encoded so it contains no `$` characters, which would
 * otherwise be mangled by Next.js's dotenv-expand in local `.env` files.
 * You can paste the printed value into `.env` or the Vercel dashboard as-is.
 */
async function main() {
  const password = process.argv[2];
  if (!password) {
    console.error('Usage: npm run hash-password -- "YourSecretPassword"');
    process.exit(1);
  }
  const hash = await bcrypt.hash(password, 10);
  const encoded = Buffer.from(hash).toString("base64");
  console.log("\nAdd this line to your .env (or Vercel env vars):\n");
  console.log(`ADMIN_PASSWORD_HASH="${encoded}"\n`);
}

main();
