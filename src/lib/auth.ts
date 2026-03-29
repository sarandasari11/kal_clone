import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })
        
        if (!user || !user.password) return null
        
        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        )
        
        if (passwordsMatch) return { id: user.id, name: user.name, email: user.email, username: user.username }
        
        return null
      }
    })
  ],
  pages: {
    signIn: '/login'
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = (user as { username?: string }).username
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        const user = session.user as typeof session.user & {
          id?: string
          username?: string
        }
        user.id = token.id as string
        user.username = token.username as string
      }
      return session
    }
  },
  session: {
    strategy: "jwt"
  }
})
