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
      console.log('SignIn callback - Start')
      console.log('Account:', JSON.stringify(account, null, 2))
      
      try {
        if (!account) {
          console.error("No account data received during sign in")
          return false
        }
        if (account.provider === "google") {
          console.log('SignIn successful - Google provider')
          return true
        }
        console.error(`Unsupported provider: ${account.provider}`)
        return false
      } catch (error) {
        console.error("Error in signIn callback:", error)
        return false
      } finally {
        console.log('SignIn callback - End')
      }
    },
    async redirect({ url, baseUrl }) {
      console.log('Redirect callback - Start')
      console.log('URL:', url)
      console.log('Base URL:', baseUrl)
      
      try {
        // Allow both production and development URLs
        const allowedBaseUrls = [productionURL, developmentURL]
        if (!allowedBaseUrls.includes(baseUrl)) {
          console.warn(`Unexpected baseUrl: ${baseUrl}, expected one of:`, allowedBaseUrls)
        }

        // Default to baseUrl if URL is not provided
        if (!url) {
          console.log('No URL provided, using baseUrl:', baseUrl)
          return baseUrl
        }
        
        // Handle relative URLs
        if (url.startsWith("/")) {
          const redirectUrl = `${baseUrl}${url}`
          console.log('Relative URL, redirecting to:', redirectUrl)
          return redirectUrl
        }
        
        // Handle absolute URLs
        const urlObj = new URL(url)
        if (allowedBaseUrls.includes(urlObj.origin)) {
          console.log('URL origin matches allowed URLs, redirecting to:', url)
          return url
        }
        
        console.log('URL origin not allowed, defaulting to baseUrl')
        return baseUrl
      } catch (error) {
        console.error("Error in redirect callback:", error)
        return baseUrl
      } finally {
        console.log('Redirect callback - End')
      }
    },
    async session({ session }): Promise<Session | DefaultSession> {
      console.log('Session callback - Start')
      console.log('Session:', JSON.stringify(session, null, 2))
      
      try {
        console.log('Returning session')
        return session
      } catch (error) {
        console.error("Error in session callback:", error)
        console.log('Returning default session')
        return {} as DefaultSession
      } finally {
        console.log('Session callback - End')
      }
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  debug: true, // Enable debug mode to see more detailed logs
  logger: {
    error(code, ...message) {
      console.error(code, ...message)
    },
    warn(code, ...message) {
      console.warn(code, ...message)
    },
    debug(code, ...message) {
      console.debug(code, ...message)
    }
  },
  secret: process.env.NEXTAUTH_SECRET
} satisfies NextAuthConfig)