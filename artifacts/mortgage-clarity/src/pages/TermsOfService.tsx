import { Link } from "wouter";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
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
            <FileText className="w-4 h-4" />
            Legal
          </div>
          <h1 className="font-serif text-4xl font-semibold text-foreground">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: May 2025 &nbsp;·&nbsp; Loansbetter.com, Inc. (NMLS# 2641696)</p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 md:p-10 space-y-8 shadow-sm text-sm text-foreground leading-relaxed">

          <section className="space-y-3">
            <h2 className="font-semibold text-base text-foreground">Agreement to Terms</h2>
            <p className="text-muted-foreground">By accessing or using this website, you agree to be bound by these Terms of Service and all applicable laws. If you do not agree, please do not use this site. These terms apply to all visitors, users, and others who access the service.</p>
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="font-semibold text-base text-foreground">Platform Usage</h2>
            <p className="text-muted-foreground">This website is provided for informational and educational purposes related to residential mortgage and home financing. You agree to use this site only for lawful purposes and in a manner that does not infringe the rights of others.</p>
            <p className="text-muted-foreground">You may not use this site to submit false, misleading, or fraudulent information, or to interfere with the operation of the platform.</p>
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="font-semibold text-base text-foreground">No Warranty on Estimates</h2>
            <p className="text-muted-foreground">All mortgage estimates, affordability ranges, monthly payment calculations, and rate information provided on this site are for illustrative purposes only. They are not commitments to lend, pre-approvals, or guarantees of any specific loan terms. Actual loan terms are subject to full credit review, underwriting approval, and applicable state and federal regulations.</p>
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="font-semibold text-base text-foreground">Consent to Contact (TCPA)</h2>
            <p className="text-muted-foreground">By submitting personal information through any form on this site, you expressly consent to be contacted by Loansbetter.com, Inc. and its approved lending or marketing partners by phone (including autodialed or pre-recorded calls), text message, and email regarding mortgage-related products and services, at the contact information you provide.</p>
            <p className="text-muted-foreground font-medium text-foreground">Consent is not a condition of purchase or obtaining any loan product.</p>
            <p className="text-muted-foreground">You may revoke consent at any time by contacting us at <a href="mailto:info@loansbetter.com" className="text-primary hover:underline">info@loansbetter.com</a> or <a href="tel:7144944172" className="text-primary hover:underline">714-494-4172</a>. Message and data rates may apply for text communications.</p>
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="font-semibold text-base text-foreground">Lead Handling Policies</h2>
            <p className="text-muted-foreground">Information you submit may be shared with approved lending or marketing partners for the purpose of presenting mortgage products and services, subject to your consent. All partner sharing is consent-based and subject to audit logging. We do not transfer lead information to parties who have not agreed to our partner standards.</p>
            <p className="text-muted-foreground">Consent records — including timestamp, disclosure version, and source — are retained for compliance purposes.</p>
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="font-semibold text-base text-foreground">User Responsibilities</h2>
            <p className="text-muted-foreground">You are responsible for ensuring the accuracy of information you submit. You agree not to impersonate another person or submit information on behalf of someone else without their authorization.</p>
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="font-semibold text-base text-foreground">Limitation of Liability</h2>
            <p className="text-muted-foreground">To the fullest extent permitted by applicable law, Loansbetter.com, Inc. and its officers, employees, and agents shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from your use of, or inability to use, this website or its content — including but not limited to reliance on any estimate, calculation, or information provided herein.</p>
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="font-semibold text-base text-foreground">Compliance</h2>
            <p className="text-muted-foreground">Loansbetter.com, Inc. operates in compliance with the Telephone Consumer Protection Act (TCPA), CAN-SPAM Act, California Consumer Privacy Act (CCPA), Equal Credit Opportunity Act (ECOA), Fair Housing Act, and all other applicable federal and state regulations. We maintain records sufficient to demonstrate compliance with these laws.</p>
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="font-semibold text-base text-foreground">Intellectual Property</h2>
            <p className="text-muted-foreground">All content on this site — including text, graphics, logos, and software — is the property of Loansbetter.com, Inc. and is protected by applicable copyright and trademark laws. You may not reproduce, distribute, or create derivative works without our express written consent.</p>
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="font-semibold text-base text-foreground">Governing Law</h2>
            <p className="text-muted-foreground">These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions. Any disputes shall be resolved in the courts of Orange County, California.</p>
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="font-semibold text-base text-foreground">Changes to These Terms</h2>
            <p className="text-muted-foreground">We reserve the right to update these Terms of Service at any time. Continued use of this website following any update constitutes acceptance of the revised terms. Material changes will be reflected in the updated date above.</p>
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="font-semibold text-base text-foreground">Contact</h2>
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
