import { Navigation } from "@/components/navigation"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>

        <div className="bg-white rounded-lg shadow-md p-8 prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

          <h2>Acceptance of Terms</h2>
          <p>
            By accessing and using Resume Rewriter, you accept and agree to be bound by the terms and provision of this
            agreement.
          </p>

          <h2>Use License</h2>
          <p>
            Permission is granted to temporarily use Resume Rewriter for personal, non-commercial transitory viewing
            only. This is the grant of a license, not a transfer of title.
          </p>

          <h2>Service Description</h2>
          <p>
            Resume Rewriter is an AI-powered service that helps optimize resumes to match job descriptions. We offer
            both free and paid subscription tiers.
          </p>

          <h2>User Accounts</h2>
          <p>
            You are responsible for safeguarding the password and for maintaining the confidentiality of your account.
            You agree to accept responsibility for all activities under your account.
          </p>

          <h2>Payment Terms</h2>
          <p>
            Paid subscriptions are billed monthly. You may cancel your subscription at any time. Refunds are handled on
            a case-by-case basis.
          </p>

          <h2>Prohibited Uses</h2>
          <ul>
            <li>Using the service for any unlawful purpose</li>
            <li>Attempting to interfere with the service's security features</li>
            <li>Using the service to generate false or misleading information</li>
          </ul>

          <h2>Limitation of Liability</h2>
          <p>
            Resume Rewriter shall not be liable for any indirect, incidental, special, consequential, or punitive
            damages resulting from your use of the service.
          </p>

          <h2>Contact Information</h2>
          <p>
            Questions about the Terms of Service should be sent to{" "}
            <a href="mailto:legal@resumerewriter.com" className="text-blue-600 hover:text-blue-700">
              legal@resumerewriter.com
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}
