import { Link } from "wouter";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-[calc(100dvh-5rem)] bg-secondary/30 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">

        <div>
          <Link href="/">
            <Button variant="ghost" className="text-muted-foreground -ml-2">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium">
            <Shield className="w-4 h-4" />
            Legal
          </div>
          <h1 className="font-serif text-4xl font-semibold text-foreground">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: May 2025 &nbsp;·&nbsp; Loansbetter.com, Inc. (NMLS# 2641696)</p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 md:p-10 space-y-8 shadow-sm text-sm text-foreground leading-relaxed">

          <section className="space-y-3">
            <h2 className="font-semibold text-base text-foreground">Overview</h2>
            <p className="text-muted-foreground">This Privacy Policy describes how Loansbetter.com, Inc. ("LoansBetter," "we," "us," or "our") collects, uses, shares, and protects information you provide when using our website and services. By using this site, you agree to the terms of this policy.</p>
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="font-semibold text-base text-foreground">Information We Collect</h2>
            <p className="text-muted-foreground">We collect information you voluntarily provide, including:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
              <li>Contact information (name, email address, phone number)</li>
              <li>Financial profile information (income, debt, credit range, down payment, home value, mortgage balance)</li>
              <li>Mortgage goal and loan preferences</li>
              <li>Questions and messages submitted through our AI chat or contact forms</li>
              <li>Consent records, including timestamps and disclosure version accepted</li>
            </ul>
            <p className="text-muted-foreground">We may also collect certain technical data automatically, including browser type, referring URL, and device information, for site analytics and security purposes.</p>
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="font-semibold text-base text-foreground">How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
              <li>To respond to your mortgage inquiry and connect you with a licensed loan officer</li>
              <li>To provide personalized mortgage estimates and educational content</li>
              <li>To contact you via phone, text message, or email about mortgage products and services — consistent with your consent</li>
              <li>To share your information with approved lending or marketing partners when you have provided explicit consent for such sharing</li>
              <li>To improve our platform and comply with applicable laws and regulations</li>
            </ul>
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="font-semibold text-base text-foreground">Lead Sharing with Approved Partners</h2>
            <p className="text-muted-foreground">When you submit a lead form on this site and consent to partner contact, your information — including your name, contact details, and financial profile — may be shared with approved lending or marketing partners for the purpose of presenting mortgage-related products and services.</p>
            <p className="text-muted-foreground">We only share leads with partners who have agreed to maintain equivalent privacy and contact standards. We do not share your information with partners if you have not provided explicit consent, or if you have opted out.</p>
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="font-semibold text-base text-foreground">Your Rights and Opt-Out</h2>
            <p className="text-muted-foreground">You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
              <li>Request access to or deletion of personal information we hold about you</li>
              <li>Opt out of communications at any time by contacting us directly</li>
              <li>Revoke your consent to partner sharing — requests received will be honored on a going-forward basis</li>
              <li>Request correction of any inaccurate data</li>
            </ul>
            <p className="text-muted-foreground">
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:info@loansbetter.com" className="text-primary hover:underline">info@loansbetter.com</a>
              {" "}or{" "}
              <a href="tel:7144944172" className="text-primary hover:underline">714-494-4172</a>.
            </p>
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="font-semibold text-base text-foreground">Data Retention</h2>
            <p className="text-muted-foreground">We retain your information for as long as necessary to fulfill the purpose for which it was collected, comply with legal obligations, resolve disputes, and enforce agreements. Consent records are retained for a minimum of five years for compliance purposes.</p>
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="font-semibold text-base text-foreground">Security</h2>
            <p className="text-muted-foreground">We implement reasonable technical and organizational measures to protect your information from unauthorized access, disclosure, or loss. However, no system is completely secure, and we cannot guarantee absolute security.</p>
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="font-semibold text-base text-foreground">Third-Party Links</h2>
            <p className="text-muted-foreground">This site may contain links to third-party websites. We are not responsible for the privacy practices or content of those sites. We encourage you to review the privacy policies of any site you visit.</p>
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="font-semibold text-base text-foreground">Changes to This Policy</h2>
            <p className="text-muted-foreground">We may update this Privacy Policy periodically. Continued use of this website following any changes constitutes your acceptance of the revised policy. Material changes will be noted with an updated date above.</p>
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="font-semibold text-base text-foreground">Contact Us</h2>
            <p className="text-muted-foreground">
              Loansbetter.com, Inc. &nbsp;·&nbsp; NMLS# 2641696<br />
              17220 Newhope Street #214A, Fountain Valley, CA 92708<br />
              <a href="mailto:info@loansbetter.com" className="text-primary hover:underline">info@loansbetter.com</a>
              {" "}·{" "}
              <a href="tel:7144944172" className="text-primary hover:underline">714-494-4172</a>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
