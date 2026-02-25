import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function PrivacyPolicy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | Dalil</title>
        <meta name="description" content="Privacy Policy for Dalil by Invesense Asset Management. Learn how we collect, use, and protect your data." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-12 lg:py-20">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <h1 className="text-4xl font-serif font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-10">Last updated: February 25, 2026</p>

          <div className="prose prose-invert max-w-none space-y-8 text-foreground/90">
            <section className="space-y-3">
              <h2 className="text-2xl font-serif font-semibold text-foreground">1. Introduction</h2>
              <p className="leading-relaxed text-muted-foreground">
                Dalil Asset Management Limited ("Dalil", "we", "us", or "our"), a DIFC-registered company regulated 
                by the Dubai Financial Services Authority (DFSA), is committed to protecting your privacy and personal 
                data. This Privacy Policy describes how we collect, use, disclose, and safeguard your information when 
                you use the Dalil platform ("Platform").
              </p>
              <p className="leading-relaxed text-muted-foreground">
                We process personal data in accordance with the DIFC Data Protection Law (DIFC Law No. 5 of 2020) 
                and applicable DFSA regulations.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-serif font-semibold text-foreground">2. Data We Collect</h2>
              <p className="leading-relaxed text-muted-foreground">We may collect the following categories of personal data:</p>
              
              <h3 className="text-xl font-serif font-medium text-foreground mt-4">2.1 Information You Provide</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>Account Information:</strong> Full name, email address, company name when requesting access or creating an account</li>
                <li><strong>Authentication Data:</strong> Encrypted credentials for secure login</li>
                <li><strong>Screening Requests:</strong> Ticker symbols and portfolio data submitted for compliance screening</li>
                <li><strong>Communications:</strong> Feedback, support inquiries, and messages sent through the Platform</li>
              </ul>

              <h3 className="text-xl font-serif font-medium text-foreground mt-4">2.2 Information Collected Automatically</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>Usage Data:</strong> Pages visited, features used, screening queries, and session duration</li>
                <li><strong>Device Information:</strong> Browser type, operating system, and device identifiers</li>
                <li><strong>Log Data:</strong> IP address, access timestamps, and activity logs for security monitoring</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-serif font-semibold text-foreground">3. How We Use Your Data</h2>
              <p className="leading-relaxed text-muted-foreground">We use your personal data for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>Service Delivery:</strong> To provide Shariah compliance screening services and platform access</li>
                <li><strong>Account Management:</strong> To create, maintain, and secure your user account</li>
                <li><strong>Communication:</strong> To send service-related notifications, including access approvals and password resets</li>
                <li><strong>Security:</strong> To detect, prevent, and respond to unauthorized access, fraud, and security incidents</li>
                <li><strong>Improvement:</strong> To analyze usage patterns and improve platform functionality and user experience</li>
                <li><strong>Compliance:</strong> To fulfil regulatory obligations under DFSA rules and applicable laws</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-serif font-semibold text-foreground">4. Legal Basis for Processing</h2>
              <p className="leading-relaxed text-muted-foreground">We process your personal data on the following legal bases:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>Contractual Necessity:</strong> Processing necessary to provide the services you have requested</li>
                <li><strong>Legal Obligation:</strong> Processing required to comply with DFSA regulatory requirements and DIFC law</li>
                <li><strong>Legitimate Interest:</strong> Processing for platform security, fraud prevention, and service improvement</li>
                <li><strong>Consent:</strong> Where required, we will obtain your explicit consent before processing</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-serif font-semibold text-foreground">5. Data Sharing and Disclosure</h2>
              <p className="leading-relaxed text-muted-foreground">
                We do not sell, rent, or trade your personal data. We may share your information with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>Service Providers:</strong> Trusted third-party providers who assist in platform operations (e.g., email delivery, hosting), bound by confidentiality agreements</li>
                <li><strong>Regulatory Authorities:</strong> The DFSA or other regulatory bodies when required by law or regulation</li>
                <li><strong>Legal Proceedings:</strong> When required by court order, subpoena, or to protect our legal rights</li>
                <li><strong>Affiliates:</strong> Invesense Asset Management and its subsidiaries, for operational and administrative purposes</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-serif font-semibold text-foreground">6. Data Security</h2>
              <p className="leading-relaxed text-muted-foreground">
                We implement industry-standard security measures to protect your personal data, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Encryption in transit (TLS) and at rest</li>
                <li>Role-based access controls and authentication</li>
                <li>Activity logging and security monitoring</li>
                <li>Regular security assessments and audits</li>
                <li>Secure credential storage using industry-standard hashing</li>
              </ul>
              <p className="leading-relaxed text-muted-foreground">
                While we employ robust security practices, no method of transmission over the Internet is 100% secure. 
                We cannot guarantee absolute security of your data.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-serif font-semibold text-foreground">7. Data Retention</h2>
              <p className="leading-relaxed text-muted-foreground">
                We retain your personal data for as long as necessary to fulfil the purposes described in this policy, 
                comply with regulatory retention requirements, and resolve disputes. Account data is retained for the 
                duration of your active account and for a period thereafter as required by DFSA record-keeping obligations. 
                Activity logs are retained for security and compliance audit purposes.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-serif font-semibold text-foreground">8. Your Rights</h2>
              <p className="leading-relaxed text-muted-foreground">
                Under the DIFC Data Protection Law, you have the following rights:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
                <li><strong>Rectification:</strong> Request correction of inaccurate or incomplete data</li>
                <li><strong>Erasure:</strong> Request deletion of your personal data, subject to regulatory retention requirements</li>
                <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
                <li><strong>Portability:</strong> Request your data in a structured, machine-readable format</li>
                <li><strong>Objection:</strong> Object to processing based on legitimate interest</li>
              </ul>
              <p className="leading-relaxed text-muted-foreground">
                To exercise these rights, contact us at{' '}
                <a href="mailto:privacy@dalil.me" className="text-primary hover:underline">privacy@dalil.me</a>. 
                We will respond within 30 days of receiving your request.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-serif font-semibold text-foreground">9. International Data Transfers</h2>
              <p className="leading-relaxed text-muted-foreground">
                Your data may be processed in jurisdictions outside the DIFC. Where such transfers occur, we ensure 
                adequate safeguards are in place in accordance with the DIFC Data Protection Law, including contractual 
                protections with our service providers.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-serif font-semibold text-foreground">10. Cookies and Tracking</h2>
              <p className="leading-relaxed text-muted-foreground">
                The Platform uses essential cookies for authentication and session management. These are strictly 
                necessary for the Platform to function and cannot be disabled. We do not use advertising or 
                third-party tracking cookies.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-serif font-semibold text-foreground">11. Children's Privacy</h2>
              <p className="leading-relaxed text-muted-foreground">
                The Platform is not intended for individuals under the age of 18. We do not knowingly collect 
                personal data from minors. If we become aware that we have collected data from a minor, we will 
                take steps to delete it promptly.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-serif font-semibold text-foreground">12. Changes to This Policy</h2>
              <p className="leading-relaxed text-muted-foreground">
                We may update this Privacy Policy from time to time. Material changes will be communicated to registered 
                users via email or through the Platform. The "Last updated" date at the top of this page indicates when 
                the policy was last revised.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-serif font-semibold text-foreground">13. Contact Us</h2>
              <p className="leading-relaxed text-muted-foreground">
                For questions or concerns about this Privacy Policy or our data practices, contact:
              </p>
              <p className="leading-relaxed text-muted-foreground">
                Data Protection Officer<br />
                Dalil Asset Management Limited<br />
                Dubai International Financial Centre (DIFC)<br />
                Dubai, United Arab Emirates<br />
                Email: <a href="mailto:privacy@dalil.me" className="text-primary hover:underline">privacy@dalil.me</a>
              </p>
              <p className="leading-relaxed text-muted-foreground">
                If you are unsatisfied with our response, you may lodge a complaint with the DIFC Commissioner 
                of Data Protection.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
