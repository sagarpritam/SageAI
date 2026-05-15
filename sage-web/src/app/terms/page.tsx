export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-300 py-24">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-emerald-400 font-mono mb-8">Terms of Service</h1>
        <div className="space-y-6">
          <p className="text-sm text-zinc-500">Last updated: May 15, 2026</p>
          
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By using SageAI, you agree to these terms. If you do not agree, do not use the service.
            These terms constitute a legally binding agreement between you and SageAI regarding your use of the platform and any related services. We reserve the right to update these terms at any time. Your continued use of the service following any changes indicates your acceptance of the new terms.
          </p>

          <h2 className="text-2xl font-bold text-emerald-300 mt-8 mb-4">2. Scan Authorization & Liability</h2>
          <div className="bg-emerald-900/20 border border-emerald-500/30 p-6 rounded-lg text-emerald-100">
            <p className="font-bold mb-2">CRITICAL AUTHORIZATION REQUIRED:</p>
            <p>
              By initiating any security scan, pentest, or reconnaissance activity through SageAI, you explicitly affirm that:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>You own the target domain, IP, or infrastructure being scanned.</li>
              <li>OR you possess explicit, written authorization from the owner to conduct security testing against the target.</li>
              <li>You agree to indemnify and hold harmless SageAI and its operators from any claims, damages, or legal actions arising from unauthorized scanning.</li>
            </ul>
          </div>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Acceptable Use</h2>
          <p>
            SageAI is provided for defensive security purposes only. Using the platform to discover vulnerabilities for malicious exploitation is strictly prohibited and will result in immediate termination and reporting to relevant authorities.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Limitation of Liability</h2>
          <p>
            The service is provided "as is". We are not responsible for any damage to your systems resulting from active scanning features.
            In no event shall SageAI, its directors, employees, or agents be liable for any indirect, punitive, incidental, special, or consequential damages arising out of or in any way connected with the use of this service. Your sole remedy for dissatisfaction with the service is to stop using it.
          </p>
        </div>
      </div>
    </div>
  );
}
