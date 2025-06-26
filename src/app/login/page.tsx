"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"
import { useAuth } from "@/components/auth-provider"
import { locale } from "@/lib/localization"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [linkSent, setLinkSent] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { login } = useAuth()
  const token = searchParams.get("token")

  useEffect(() => {
    if (token) {
      verifyToken(token)
    }
  }, [token])

  const verifyToken = async (token: string) => {
    setIsVerifying(true)
    try {
      const response = await fetch(`/api/auth/verify?token=${token}`)
      const data = await response.json()

      if (response.ok) {
        login(data.user)
        toast.success(locale.success_login)
        router.push("/")
      } else {
        toast.error(data.error || locale.error_unauthorized)
        router.push("/login")
      }
    } catch (error) {
      toast.error(locale.error_network)
      router.push("/login")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/request-magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setLinkSent(true)
        toast.success(locale.success_magic_link_sent)
      } else {
        toast.error(data.error || locale.error_internal)
      }
    } catch (error) {
      toast.error(locale.error_network)
    } finally {
      setIsLoading(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{locale.verifying}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <Mail className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {linkSent ? locale.check_your_email : locale.sign_in}
            </h1>
            <p className="text-gray-600">
              {linkSent ? locale.magic_link_sent : locale.enter_email_for_magic_link}
            </p>
          </div>

          {linkSent ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-500">
                Sent to: <span className="font-medium">{email}</span>
              </p>
              <button
                onClick={() => setLinkSent(false)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {locale.try_different_email}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {locale.email_address}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? locale.sending : locale.send_magic_link}
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-4 w-4 mr-1" />
              {locale.back_to_app}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
