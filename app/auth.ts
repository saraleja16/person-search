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
          response_type: "code"
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ account }: { account?: Account | null }) {
      try {
        if (!account) {
          console.error("No account data received during sign in")
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
        
        // Handle absolute URLs
        const urlObj = new URL(url)
        if (urlObj.origin === baseUrl) {
          return url
        }
        
        // Default to baseUrl for security
        return baseUrl
      } catch (error) {
        console.error("Error in redirect callback:", error)
        return baseUrl
      }
    },
    async session({ session }): Promise<Session | DefaultSession> {
      try {
        return session
      } catch (error) {
        console.error("Error in session callback:", error)
        // Return empty session instead of null
        return {} as DefaultSession
      }
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET
} satisfies NextAuthConfig)