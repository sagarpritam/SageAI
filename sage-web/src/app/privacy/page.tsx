export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-300 py-24">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-emerald-400 font-mono mb-8">Privacy Policy</h1>
        <div className="space-y-6">
          <p className="text-sm text-zinc-500">Last updated: November 11, 2026 &bull; SageAI v6.8.0</p>
          
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Information We Collect</h2>
          <p>
            We collect account information (email, name), usage data, and scan results.
            This information is necessary to provide you with secure access to your account and to deliver accurate and contextual security assessments. We may also collect metadata related to your scanning activity, such as timestamps, target IPs, and the configurations used during the scanning process.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. How We Use Information</h2>
          <p>
            Data is used exclusively to provide the SageAI service, generate reports, and improve our AI models. 
            We do not sell your personal data or scan results to third parties.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Data Retention & Deletion</h2>
          <p>
            Scan data is retained for active accounts to provide historical context.
            You can request data deletion or export your data at any time via your account settings.
            Upon account deletion, all associated scan data is permanently purged within 30 days.
          </p>

          <h2 className="text-2xl font-bold text-emerald-300 mt-8 mb-4">4. GDPR & Data Rights (Article 17, 20, 30)</h2>
          <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-lg text-zinc-300">
            <p>Under the General Data Protection Regulation (GDPR), you have the right to:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li><strong>Right to Access & Portability:</strong> Request an export of your personal and scan data in a machine-readable format.</li>
              <li><strong>Right to Erasure (Right to be Forgotten):</strong> Request complete deletion of your account and associated data.</li>
              <li><strong>Right to Rectification:</strong> Correct inaccurate personal data.</li>
            </ul>
            <p className="mt-4 text-sm text-emerald-400">
              Access these controls via the API or Contact support@sageai.com for assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
