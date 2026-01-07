# When ready to enable email verification, uncomment lines 27-29 in lib/auth.ts:

# From:
# // if (!user.emailVerified) {
# //   throw new Error("Please verify your email before logging in");
# // }

# To:
if (!user.emailVerified) {
  throw new Error("Please verify your email before logging in");
}
