import NextAuth, { type NextAuthConfig } from "next-auth"
import Google from "@auth/core/providers/google"
import type { Account, Session, DefaultSession } from "next-auth"

const productionURL = 'https://person-search-plum.vercel.app'
const developmentURL = 'http://localhost:3000'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile"
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ account, profile }: { account?: Account | null; profile?: any }) {
      try {
        if (!account || !profile) {
          console.error("Missing account or profile data")
          return false
        }
        
        // Verify email is verified
        if (!profile.email_verified) {
          console.error("Email not verified")
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
        // Strict URL validation for security
        if (!url) return baseUrl
        
        // Only allow specific origins
        const allowedOrigins = [productionURL, developmentURL]
        const currentOrigin = allowedOrigins.find(origin => baseUrl.startsWith(origin))
        
        if (!currentOrigin) {
          console.error(`Invalid base URL: ${baseUrl}`)
          throw new Error("Invalid base URL")
        }

        // Handle relative URLs
        if (url.startsWith("/")) {
          const finalUrl = `${currentOrigin}${url}`
          // Validate the constructed URL
          try {
            new URL(finalUrl)
            return finalUrl
          } catch {
            return currentOrigin
          }
        }
        
        // Handle absolute URLs - strict validation
        try {
          const urlObj = new URL(url)
          if (allowedOrigins.includes(urlObj.origin)) {
            return url
          }
        } catch {
          console.error("Invalid redirect URL")
        }
        
        return currentOrigin
      } catch (error) {
        console.error("Error in redirect callback:", error)
        return baseUrl
      }
    },
    async session({ session }): Promise<Session | DefaultSession> {
      try {
        if (!session) {
          console.error("No session data")
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
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true, // Enable CSRF protection
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true
      }
    }
  }
} satisfies NextAuthConfig)