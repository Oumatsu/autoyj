export default function TermsPage() {
  return (
    <main className="pt-32 pb-24 bg-a min-h-screen">
      <div className="container mx-auto px-6 md:px-12 max-w-3xl">
        <div className="label label-gold mb-6">Legal</div>
        <h1 className="sh mb-4">
          Terms of <span className="text-theme">Service</span>.
        </h1>
        <p className="text-gray-500 text-sm font-light mb-12">
          Last Updated: January 2026
        </p>

        <div className="prose prose-invert max-w-none space-y-10">
          <section>
            <h2 className="text-xl font-black italic text-white uppercase tracking-tight mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-400 font-light leading-relaxed">
              By accessing and using the autoYJ website and services, you
              agree to be bound by these Terms of Service. If you do not agree
              with any part of these terms, you must not use our website or
              services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black italic text-white uppercase tracking-tight mb-4">
              2. Services Description
            </h2>
            <p className="text-gray-400 font-light leading-relaxed">
              autoYJ provides electric vehicle sourcing, export logistics,
              and dealership support services connecting Chinese OEMs with
              African markets. Our services include but are not limited to:
              vehicle procurement, pre-delivery inspection (PDI), export
              documentation, shipping logistics, starter parts kit supply, and
              dealership consulting.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black italic text-white uppercase tracking-tight mb-4">
              3. Trade Terms & Payment
            </h2>
            <p className="text-gray-400 font-light leading-relaxed mb-4">
              Our standard trade terms are as follows:
            </p>
            <ul className="list-disc list-inside text-gray-400 font-light space-y-2 ml-4">
              <li>
                <strong className="text-white">30/70 T/T Structure:</strong> 30%
                deposit to confirm order, 70% balance against shipping documents
                (Bill of Lading)
              </li>
              <li>
                <strong className="text-white">FOB/CIF Options:</strong> Pricing
                can be quoted on FOB (Free on Board) or CIF (Cost, Insurance,
                Freight) basis per client preference
              </li>
              <li>
                <strong className="text-white">Currency:</strong> All
                transactions are denominated in USD unless otherwise agreed in
                writing
              </li>
              <li>
                <strong className="text-white">Documentation:</strong> Original
                compliance documents (BoL, Commercial Invoice, Certificate of
                Origin) are released upon final settlement
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black italic text-white uppercase tracking-tight mb-4">
              4. Order Process & Lead Times
            </h2>
            <p className="text-gray-400 font-light leading-relaxed">
              Vehicle lead times vary by model and factory production schedules.
              Typical lead times range from 2-8 weeks from order confirmation to
              port loading. Shipping transit times vary by destination (28-45
              days for most African ports). autoYJ provides estimated
              timelines in good faith but cannot guarantee exact delivery dates
              due to factors beyond our control including factory delays, port
              congestion, and customs processing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black italic text-white uppercase tracking-tight mb-4">
              5. Quality Assurance & PDI
            </h2>
            <p className="text-gray-400 font-light leading-relaxed">
              All vehicles undergo our 50-point Pre-Delivery Inspection (PDI)
              before port loading. Digital PDI reports and HD loading videos are
              provided to the buyer. Any defects identified during PDI are
              communicated to the buyer before shipment. autoYJ acts as a
              sourcing and logistics agent; vehicle warranties are provided by
              the respective OEMs per their standard terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black italic text-white uppercase tracking-tight mb-4">
              6. Intellectual Property
            </h2>
            <p className="text-gray-400 font-light leading-relaxed">
              All content on this website including text, graphics, logos,
              images, and software is the property of autoYJ or its content
              suppliers and is protected by international copyright laws. The
              autoYJ name, logo, and brand assets are trademarks and may
              not be used without prior written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black italic text-white uppercase tracking-tight mb-4">
              7. Limitation of Liability
            </h2>
            <p className="text-gray-400 font-light leading-relaxed">
              autoYJ shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages resulting from your
              use of our services. Our total liability for any claim arising
              from our services shall not exceed the total fees paid by you for
              the specific transaction giving rise to the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black italic text-white uppercase tracking-tight mb-4">
              8. Force Majeure
            </h2>
            <p className="text-gray-400 font-light leading-relaxed">
              autoYJ shall not be liable for any failure or delay in
              performance due to circumstances beyond our reasonable control,
              including but not limited to: acts of God, war, terrorism, natural
              disasters, pandemics, government actions, port closures, shipping
              line disruptions, or factory production halts.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black italic text-white uppercase tracking-tight mb-4">
              9. Governing Law
            </h2>
            <p className="text-gray-400 font-light leading-relaxed">
              These Terms of Service shall be governed by and construed in
              accordance with the laws of the People&apos;s Republic of China.
              Any disputes arising from these terms shall be subject to the
              exclusive jurisdiction of the courts in Shanghai, China.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black italic text-white uppercase tracking-tight mb-4">
              10. Changes to Terms
            </h2>
            <p className="text-gray-400 font-light leading-relaxed">
              We reserve the right to modify these Terms of Service at any time.
              Changes will be effective immediately upon posting to this
              website. Your continued use of our services after any
              modifications constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black italic text-white uppercase tracking-tight mb-4">
              11. Contact Information
            </h2>
            <p className="text-gray-400 font-light leading-relaxed">
              For questions about these Terms of Service, please contact us at{" "}
              <a href="mailto:legal@autoyj.com" className="text-theme hover:underline">
                legal@autoyj.com
              </a>{" "}
              or via our contact page.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
