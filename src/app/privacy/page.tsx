import { Navigation } from "@/components/navigation"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

        <div className="bg-white rounded-lg shadow-md p-8 prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

          <h2>Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you create an account, use our resume
            rewriting service, or contact us for support.
          </p>

          <h2>How We Use Your Information</h2>
          <ul>
            <li>To provide and improve our resume rewriting services</li>
            <li>To process payments and manage subscriptions</li>
            <li>To send you important updates about our service</li>
            <li>To respond to your questions and provide customer support</li>
          </ul>

          <h2>Information Sharing</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personal information to third parties except as described
            in this policy. We may share information with service providers who assist us in operating our website and
            conducting our business.
          </p>

          <h2>Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information against unauthorized access,
            alteration, disclosure, or destruction.
          </p>

          <h2>Your Rights</h2>
          <p>
            You have the right to access, update, or delete your personal information. You can also request that we stop
            processing your data by contacting us.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at{" "}
            <a href="mailto:privacy@resumerewriter.com" className="text-blue-600 hover:text-blue-700">
              privacy@resumerewriter.com
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}
