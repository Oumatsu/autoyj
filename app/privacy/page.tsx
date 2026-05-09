export default function PrivacyPage() {
  return (
    <main className="pt-32 pb-24 bg-a min-h-screen">
      <div className="container mx-auto px-6 md:px-12 max-w-3xl">
        <div className="label label-gold mb-6">Legal</div>
        <h1 className="sh mb-4">Privacy <span className="text-theme">Policy</span>.</h1>
        <p className="text-gray-500 text-sm font-light mb-12">
          Last Updated: January 2026
        </p>

        <div className="prose prose-invert max-w-none space-y-10">
          <section>
            <h2 className="text-xl font-black italic text-white uppercase tracking-tight mb-4">
              1. Information We Collect
            </h2>
            <p className="text-gray-400 font-light leading-relaxed">
              When you submit a dealer application or contact form on our
              website, we collect the following information: your name, company
              name, WhatsApp number, email address, target market, estimated
              monthly volume, and vehicle category preferences. We also collect
              standard web server log data including IP address, browser type,
              and pages visited for analytics purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black italic text-white uppercase tracking-tight mb-4">
              2. How We Use Your Information
            </h2>
            <p className="text-gray-400 font-light leading-relaxed mb-4">
              We use the information you provide exclusively for:
            </p>
            <ul className="list-disc list-inside text-gray-400 font-light space-y-2 ml-4">
              <li>Processing and responding to your dealer application or inquiry</li>
              <li>Providing you with relevant batch pricing and inventory information</li>
              <li>Communicating about your orders, shipments, and account status</li>
              <li>Improving our website and services based on usage analytics</li>
              <li>Complying with legal and regulatory obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black italic text-white uppercase tracking-tight mb-4">
              3. Data Sharing & Third Parties
            </h2>
            <p className="text-gray-400 font-light leading-relaxed">
              We do not sell, rent, or trade your personal information to third
              parties. We may share your data with logistics partners and
              customs agents solely for the purpose of fulfilling your export
              orders. All third-party service providers are contractually bound
              to maintain the confidentiality and security of your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black italic text-white uppercase tracking-tight mb-4">
              4. Data Security
            </h2>
            <p className="text-gray-400 font-light leading-relaxed">
              We implement industry-standard security measures including SSL/TLS
              encryption for all data transmission, secure server
              infrastructure, and access controls to protect your personal
              information. However, no method of electronic storage or
              transmission is 100% secure, and we cannot guarantee absolute
              security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black italic text-white uppercase tracking-tight mb-4">
              5. Data Retention
            </h2>
            <p className="text-gray-400 font-light leading-relaxed">
              We retain your dealer application data and communication records
              for the duration of our business relationship plus a period of 3
              years for legal and audit purposes. Web server logs are retained
              for 90 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black italic text-white uppercase tracking-tight mb-4">
              6. Your Rights
            </h2>
            <p className="text-gray-400 font-light leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-400 font-light space-y-2 ml-4">
              <li>Request access to the personal data we hold about you</li>
              <li>Request correction of any inaccurate data</li>
              <li>Request deletion of your data (subject to legal retention requirements)</li>
              <li>Withdraw consent for marketing communications at any time</li>
              <li>Lodge a complaint with your local data protection authority</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black italic text-white uppercase tracking-tight mb-4">
              7. Cookies
            </h2>
            <p className="text-gray-400 font-light leading-relaxed">
              Our website uses essential cookies for session management and
              security. We also use analytics cookies to understand how visitors
              interact with our site. You can control cookie preferences through
              your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black italic text-white uppercase tracking-tight mb-4">
              8. Contact Us
            </h2>
            <p className="text-gray-400 font-light leading-relaxed">
              For any questions about this Privacy Policy or to exercise your
              data rights, please contact us at{" "}
              <a href="mailto:privacy@evexportweb.com" className="text-theme hover:underline">
                privacy@evexportweb.com
              </a>{" "}
              or via WhatsApp at our business number.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
