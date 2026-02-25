import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function TermsOfService() {
  return (
    <>
      <Helmet>
        <title>Terms of Service | Dalil</title>
        <meta name="description" content="Terms of Service for Dalil by Invesense Asset Management, a DFSA-regulated Shariah screening platform." />
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

          <h1 className="text-4xl font-serif font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground mb-10">Last updated: February 25, 2026</p>

          <div className="prose prose-invert max-w-none space-y-8 text-foreground/90">
            <section className="space-y-3">
              <h2 className="text-2xl font-serif font-semibold text-foreground">1. Introduction</h2>
              <p className="leading-relaxed text-muted-foreground">
                These Terms of Service ("Terms") govern your access to and use of the Dalil platform ("Platform"), 
                operated by Dalil Asset Management Limited ("Dalil", "we", "us", or "our"), a DIFC-registered company 
                and Authorized Firm regulated by the Dubai Financial Services Authority (DFSA) under a Category 3C license, 
                reference number F002331.
              </p>
              <p className="leading-relaxed text-muted-foreground">
                By accessing or using the Platform, you agree to be bound by these Terms. If you do not agree, 
                you must not use the Platform.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-serif font-semibold text-foreground">2. Eligibility</h2>
              <p className="leading-relaxed text-muted-foreground">
                The Platform is intended for professional and institutional investors. By using the Platform, you represent 
                that you are at least 18 years of age and have the legal capacity to enter into these Terms. Access to 
                screening tools and data is restricted to approved clients who have been granted credentials by Dalil.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-serif font-semibold text-foreground">3. Platform Services</h2>
              <p className="leading-relaxed text-muted-foreground">
                Dalil provides Shariah compliance screening services, including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Individual ticker Shariah compliance screening</li>
                <li>Portfolio-level screening and purification calculations</li>
                <li>AI-powered analysis and explanations of screening results</li>
                <li>Screening request submissions for professional review</li>
                <li>Access to compliance dashboards and historical screening data</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-serif font-semibold text-foreground">4. No Financial Advice</h2>
              <p className="leading-relaxed text-muted-foreground">
                The information provided on the Platform is for informational and educational purposes only and does not 
                constitute financial, investment, legal, or tax advice. Screening results and compliance assessments are 
                based on available data and our proprietary methodology and should not be the sole basis for any investment 
                decision. You should consult with qualified financial and Shariah advisors before making investment decisions.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-serif font-semibold text-foreground">5. Accuracy of Information</h2>
              <p className="leading-relaxed text-muted-foreground">
                While we strive to ensure the accuracy and completeness of screening data and analysis, we make no 
                warranties or representations regarding the accuracy, reliability, or completeness of any information 
                on the Platform. Financial data is sourced from third-party providers and may be subject to delays, 
                errors, or omissions. AI-generated analysis is provided as a supplementary tool and may contain inaccuracies.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-serif font-semibold text-foreground">6. User Accounts and Security</h2>
              <p className="leading-relaxed text-muted-foreground">
                You are responsible for maintaining the confidentiality of your account credentials and for all 
                activities that occur under your account. You agree to notify Dalil immediately of any unauthorized 
                use of your account. We reserve the right to suspend or terminate accounts that violate these Terms 
                or that we reasonably believe have been compromised.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-serif font-semibold text-foreground">7. Intellectual Property</h2>
              <p className="leading-relaxed text-muted-foreground">
                All content, screening methodologies, algorithms, data compilations, analyses, reports, and materials 
                on the Platform are the intellectual property of Dalil or its licensors and are protected by applicable 
                intellectual property laws. You may not reproduce, distribute, modify, or create derivative works from 
                any content without our prior written consent.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-serif font-semibold text-foreground">8. Prohibited Conduct</h2>
              <p className="leading-relaxed text-muted-foreground">You agree not to:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Use the Platform for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to any part of the Platform</li>
                <li>Scrape, crawl, or use automated means to extract data from the Platform</li>
                <li>Redistribute, resell, or sublicense Platform data or screening results</li>
                <li>Interfere with or disrupt the Platform's functionality</li>
                <li>Share your account credentials with unauthorized third parties</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-serif font-semibold text-foreground">9. Limitation of Liability</h2>
              <p className="leading-relaxed text-muted-foreground">
                To the maximum extent permitted by applicable law, Dalil, its directors, officers, employees, and 
                affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive 
                damages arising from or related to your use of the Platform, including but not limited to investment 
                losses based on screening results, errors in data, or interruption of service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-serif font-semibold text-foreground">10. Regulatory Compliance</h2>
              <p className="leading-relaxed text-muted-foreground">
                Dalil operates in compliance with the rules and regulations of the DFSA and applicable DIFC laws. 
                Nothing in these Terms shall be construed as a solicitation or offer to buy or sell securities in 
                any jurisdiction where such offer or solicitation is not permitted.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-serif font-semibold text-foreground">11. Modifications</h2>
              <p className="leading-relaxed text-muted-foreground">
                We reserve the right to modify these Terms at any time. Material changes will be communicated to 
                registered users via email or through the Platform. Your continued use of the Platform after such 
                modifications constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-serif font-semibold text-foreground">12. Governing Law</h2>
              <p className="leading-relaxed text-muted-foreground">
                These Terms shall be governed by and construed in accordance with the laws of the Dubai International 
                Financial Centre (DIFC). Any disputes arising under or in connection with these Terms shall be subject 
                to the exclusive jurisdiction of the DIFC Courts.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-serif font-semibold text-foreground">13. Contact</h2>
              <p className="leading-relaxed text-muted-foreground">
                For questions about these Terms, please contact us at:{' '}
                <a href="mailto:support@dalil.me" className="text-primary hover:underline">support@dalil.me</a>
              </p>
              <p className="leading-relaxed text-muted-foreground">
                Dalil Asset Management Limited<br />
                Dubai International Financial Centre (DIFC)<br />
                Dubai, United Arab Emirates
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
