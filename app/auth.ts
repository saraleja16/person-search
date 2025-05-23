import NextAuth, { type NextAuthConfig } from "next-auth"
import Google from "@auth/core/providers/google"
import type { Account } from "next-auth"

const productionURL = 'https://person-search-plum.vercel.app'
const developmentURL = 'http://localhost:3000'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
      if (account?.provider === "google") {
        return true
      }
      return false
    },
    async redirect({ url, baseUrl }) {

      const allowedBaseUrls = [productionURL, developmentURL]
      const currentBaseUrl = allowedBaseUrls.find(allowed => baseUrl.startsWith(allowed))
      

      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
    async session({ session }) {
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  debug: process.env.NODE_ENV === 'development'
} satisfies NextAuthConfig)