"use client"

import { useState } from "react"
import { Check, Crown, Zap, CreditCard, Globe } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/components/auth-provider"
import toast from "react-hot-toast"

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPaymentOptions, setShowPaymentOptions] = useState(false)
  const { user } = useAuth()

  const handleUpgrade = () => {
    if (!user) {
      toast.error("Please sign in first")
      return
    }
    setShowPaymentOptions(true)
  }

  const handlePaymentMethod = (method: string) => {
    setIsLoading(true)
    
    switch (method) {
      case 'lemonsqueezy':
        window.location.href = "https://your-store.lemonsqueezy.com/checkout/buy/PRODUCT_ID"
        break
      case 'gumroad':
        window.location.href = "https://your-gumroad-link.gumroad.com/l/resume-rewriter-pro"
        break
      case 'paddle':
        window.location.href = "https://checkout.paddle.com/product/PRODUCT_ID"
        break
      case 'paypal':
    window.location.href = "https://paypal.me/timnyota@gmail.com/7"
        break
      default:
        toast.error("Payment method not available")
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Start free and upgrade when you need more rewrites</p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div className="bg-white rounded-lg shadow-md p-8 border-2 border-gray-200">
            <div className="text-center mb-8">
              <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Free</h2>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                $0<span className="text-lg font-normal text-gray-600">/month</span>
              </div>
              <p className="text-gray-600">Perfect for trying out the service</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3" />
                <span>1 resume rewrite per day</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3" />
                <span>All template options</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3" />
                <span>PDF download</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3" />
                <span>Copy to clipboard</span>
              </li>
            </ul>

            <button disabled className="w-full bg-gray-100 text-gray-400 py-3 px-4 rounded-md cursor-not-allowed">
              Current Plan
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-lg shadow-md p-8 border-2 border-blue-500 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">Most Popular</span>
            </div>

            <div className="text-center mb-8">
              <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Pro</h2>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                $7<span className="text-lg font-normal text-gray-600">/month</span>
              </div>
              <p className="text-gray-600">For serious job seekers</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3" />
                <span className="font-medium">Unlimited resume rewrites</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3" />
                <span>All template options</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3" />
                <span>PDF download</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3" />
                <span>Copy to clipboard</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3" />
                <span>Priority support</span>
              </li>
            </ul>

            <button
              onClick={handleUpgrade}
              disabled={isLoading || user?.isPro}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {user?.isPro ? "Current Plan" : isLoading ? "Processing..." : "Upgrade to Pro"}
            </button>
          </div>
        </div>

        {/* Payment Options Modal */}
        {showPaymentOptions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Choose Payment Method</h3>
              <p className="text-gray-600 mb-6">Select your preferred payment method for international transactions:</p>
              
              <div className="space-y-3">
                <button
                  onClick={() => handlePaymentMethod('lemonsqueezy')}
                  className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="font-medium">Credit Card (LemonSqueezy)</span>
                  </div>
                  <Globe className="h-4 w-4 text-gray-400" />
                </button>
                
                <button
                  onClick={() => handlePaymentMethod('gumroad')}
                  className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 text-green-600 mr-3" />
                    <span className="font-medium">Gumroad</span>
                  </div>
                  <Globe className="h-4 w-4 text-gray-400" />
                </button>
                
                <button
                  onClick={() => handlePaymentMethod('paypal')}
                  className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 text-blue-500 mr-3" />
                    <span className="font-medium">PayPal</span>
                  </div>
                  <Globe className="h-4 w-4 text-gray-400" />
                </button>
              </div>
              
              <button
                onClick={() => setShowPaymentOptions(false)}
                className="w-full mt-6 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {user && (
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Current Status: <span className="font-medium">{user.isPro ? "Pro" : "Free"}</span>
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
