import NextAuth, { type NextAuthConfig } from "next-auth"
import Google from "@auth/core/providers/google"
import type { Account, Session, DefaultSession, Profile } from "next-auth"

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET is not set in environment variables')
}

if (process.env.NEXTAUTH_SECRET.length < 32) {
  throw new Error('NEXTAUTH_SECRET should be at least 32 characters long')
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      authorization: {
        params: {
          scope: "openid email profile",
          access_type: "offline",
          include_granted_scopes: true,
          response_type: "code",
          prompt: "consent"
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ account, profile }: { account?: Account | null; profile?: Profile }) {
      try {
        if (!account || !profile) {
          console.error("Missing account or profile data")
          return false
        }

        if (account.provider === "google") {
          return true
        }
        
        console.error(`Unsupported provider: ${account.provider}`)
        return false
      } catch (error) {
        console.error("Error in signIn callback:", error)
        return false
      }
    },
    async redirect({ url, baseUrl }) {
      try {
        // Default to baseUrl if URL is not provided
        if (!url) return baseUrl
        
        // Handle relative URLs
        if (url.startsWith("/")) {
          return `${baseUrl}${url}`
        }
        
        // Handle absolute URLs - only allow same origin
        try {
          const urlObj = new URL(url)
          const baseUrlObj = new URL(baseUrl)
          if (urlObj.origin === baseUrlObj.origin) {
            return url
          }
        } catch {
          console.error("Invalid redirect URL")
        }
        
        return baseUrl
      } catch (error) {
        console.error("Error in redirect callback:", error)
        return baseUrl
      }
    },
    async session({ session }): Promise<Session | DefaultSession> {
      try {
        if (!session) {
          return {} as DefaultSession
        }
        return session
      } catch (error) {
        console.error("Error in session callback:", error)
        return {} as DefaultSession
      }
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  debug: true,
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true
} satisfies NextAuthConfig)