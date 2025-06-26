"use client"

import type React from "react"

import { useState } from "react"
import { Users, FileText, Key } from "lucide-react"
import toast from "react-hot-toast"

interface User {
  id: string
  email: string
  isPro: boolean
  createdAt: string
}

interface Submission {
  id: string
  email: string | null
  input: {
    resume: string
    jobDescription: string
    template: string
  }
  output: {
    sections: Record<string, string>
    markdown: string
  }
  createdAt: string
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState<"submissions" | "users">("submissions")
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminKey) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/users", {
        headers: { "x-admin-key": adminKey },
      })

      if (response.ok) {
        setIsAuthenticated(true)
        toast.success("Admin access granted")
        fetchData()
      } else {
        toast.error("Invalid admin key")
      }
    } catch (error) {
      toast.error("Authentication failed")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [submissionsRes, usersRes] = await Promise.all([
        fetch("/api/admin/submissions", {
          headers: { "x-admin-key": adminKey },
        }),
        fetch("/api/admin/users", {
          headers: { "x-admin-key": adminKey },
        }),
      ])

      if (submissionsRes.ok && usersRes.ok) {
        const submissionsData = await submissionsRes.json()
        const usersData = await usersRes.json()
        setSubmissions(submissionsData.submissions)
        setUsers(usersData.users)
      }
    } catch (error) {
      toast.error("Failed to fetch data")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <Key className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Access</h1>
              <p className="text-gray-600">Enter admin key to continue</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">
              <div>
                <label htmlFor="adminKey" className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Key
                </label>
                <input
                  id="adminKey"
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter admin key"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !adminKey}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "Authenticating..." : "Access Admin Panel"}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab("submissions")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "submissions" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              Submissions
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "users" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Users
            </button>
          </div>
        </div>

        {activeTab === "submissions" && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Submissions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Template
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.map((submission) => (
                    <tr key={submission.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {submission.email || "Anonymous"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{submission.input.template}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedSubmission(submission)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Preview
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Users</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isPro ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.isPro ? "Pro" : "Free"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Submission Preview Modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Submission Preview</h3>
                <button onClick={() => setSelectedSubmission(null)} className="text-gray-400 hover:text-gray-600">
                  ×
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Original Resume</h4>
                  <div className="bg-gray-50 p-4 rounded-md text-sm">
                    {selectedSubmission.input.resume.substring(0, 500)}...
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Job Description</h4>
                  <div className="bg-gray-50 p-4 rounded-md text-sm">
                    {selectedSubmission.input.jobDescription.substring(0, 500)}...
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Rewritten Resume</h4>
                  <div className="bg-gray-50 p-4 rounded-md text-sm whitespace-pre-wrap">
                    {selectedSubmission.output.markdown}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
