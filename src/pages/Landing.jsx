import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="ml-2 text-xl font-bold">API Testing Tool</span>
            </div>
            <div>
              <Link
                to="/requests"
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Open App
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Test Your APIs with Ease
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            A powerful web-based tool for sending API requests, managing headers
            and parameters, viewing responses, and validating API status and data.
          </p>
          <Link
            to="/requests"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg text-lg font-medium transition"
          >
            Get Started
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M4 7l5 5" />
            </svg>
          </Link>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="text-blue-400 mb-4">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a2 2 0 104 0v1a9 9 0 11-18 0 2 2 0 00-2-1V4a2 2 0 114 0" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Send Requests</h3>
              <p className="text-gray-400 text-sm">
                Support for GET, POST, PUT, PATCH, DELETE, HEAD, and OPTIONS methods.
              </p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="text-blue-400 mb-4">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Manage Headers & Params</h3>
              <p className="text-gray-400 text-sm">
                Add custom headers, query parameters, and request bodies with ease.
              </p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="text-blue-400 mb-4">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Authentication</h3>
              <p className="text-gray-400 text-sm">
                Support for Basic Auth, Bearer tokens, and API keys.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          API Testing Tool - Built with React, Express, and MongoDB
        </div>
      </footer>
    </div>
  );
}