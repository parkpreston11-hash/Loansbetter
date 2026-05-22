import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export function Footer() {
  const [legalOpen, setLegalOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [licensingOpen, setLicensingOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  return (
    <footer className="border-t border-border bg-secondary/40 mt-auto">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

        {/* Top row */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2">
            <img src="/logo.png" alt="LoansBetter" className="h-7 w-auto" />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Loansbetter.com, Inc. | NMLS# 2641696<br />
              17220 Newhope Street #214A<br />
              Fountain Valley, CA 92708
            </p>
            <a
              href="https://www.nmlsconsumeraccess.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline"
            >
              NMLS Consumer Access
            </a>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-muted-foreground/40 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-muted-foreground" aria-hidden="true">
                <path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm0 14a6 6 0 1 1 0-12 6 6 0 0 1 0 12zm8.95-5H17a7.01 7.01 0 0 0-5-5V4.05A9.01 9.01 0 0 1 18.95 11zM11 4.05V6a5.01 5.01 0 0 1 4 4h1.95A7.01 7.01 0 0 0 11 4.05z"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-muted-foreground">Equal Housing Lender</span>
          </div>
        </div>

        {/* Legal section */}
        <div className="space-y-3 border-t border-border pt-6">
          <button
            onClick={() => setLegalOpen(v => !v)}
            className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            {legalOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Legal
          </button>
          {legalOpen && (
            <div className="text-xs text-muted-foreground leading-relaxed space-y-3 pl-6">
              <p>
                Loansbetter.com, Inc. is an Equal Housing Lender. We fully comply with the Equal Credit Opportunity Act (ECOA), Fair Housing Act, and all other Federal and State regulations. All applicants applying for credit from Loansbetter.com, Inc. will be treated equally regardless of race, color, ethnicity, national origin, religion, sex or gender, sexual orientation, gender identification, military status, marital or familial status, age, disability or handicap, receipt of public assistance, exercise of any right under the Consumer Credit Protection Act, or any other prohibited basis. All information we request is voluntary, and will be kept confidential.
              </p>
              <p>
                For more information on the ECOA, please visit the Consumer Financial Protection Bureau website at:{" "}
                <a href="https://www.consumerfinance.gov" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  www.consumerfinance.gov
                </a>
              </p>
              <p>
                For more information on the Fair Housing Act, please visit the Department of Housing and Urban Development website at:{" "}
                <a href="https://portal.hud.gov/hudportal/HUD" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  portal.hud.gov
                </a>
              </p>
            </div>
          )}
        </div>

        {/* Privacy section */}
        <div className="space-y-3 border-t border-border pt-4">
          <button
            onClick={() => setPrivacyOpen(v => !v)}
            className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            {privacyOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Privacy Notice
          </button>
          {privacyOpen && (
            <div className="text-xs text-muted-foreground leading-relaxed space-y-3 pl-6">
              <p>This privacy notice discloses the privacy practices for Loansbetter.com, Inc. (www.loansbetter.com). This privacy notice applies solely to information collected by this website.</p>

              <p className="font-semibold text-foreground">Information Collection, Use, and Sharing</p>
              <p>We are the sole owners of the information collected on this site. We only have access to/collect information that you voluntarily give us via email or other direct contact from you.</p>
              <p>We will use your information to respond to you, regarding the reason you contacted us. We will not share your information with any third party outside of our organization, other than as necessary to fulfill your request.</p>
              <p>Unless you ask us not to, we may contact you via email in the future to tell you about specials, new products or services, or changes to this privacy policy.</p>

              <p className="font-semibold text-foreground">Your Access to and Control Over Information</p>
              <p>You may opt out of any future contacts from us at any time by contacting us. You may: see what data we have about you, change or correct any data, have us delete any data, or express any concern about our use of your data.</p>

              <p className="font-semibold text-foreground">Security</p>
              <p>We take precautions to protect your information. When you submit sensitive information via the website, your information is protected both online and offline. Wherever we collect sensitive information, that information is encrypted and transmitted to us in a secure way.</p>
              <p>
                If you feel that we are not abiding by this privacy policy, you should contact us immediately via telephone at{" "}
                <a href="tel:7144944172" className="text-primary hover:underline">714-494-4172</a>
                {" "}or via email at{" "}
                <a href="mailto:info@loansbetter.com" className="text-primary hover:underline">info@loansbetter.com</a>.
              </p>
              <p>This website contains links to other sites. Please be aware that we are not responsible for the content or privacy practices of such other sites.</p>
            </div>
          )}
        </div>

        {/* Licensing section */}
        <div className="space-y-3 border-t border-border pt-4">
          <button
            onClick={() => setLicensingOpen(v => !v)}
            className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            {licensingOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Licensing
          </button>
          {licensingOpen && (
            <div className="text-xs text-muted-foreground leading-relaxed space-y-3 pl-6">
              <p>Loansbetter.com, Inc. is licensed as a mortgage broker/lender in the state of California under the California Department of Financial Protection and Innovation (DFPI).</p>
              <p>
                <span className="font-semibold text-foreground">NMLS ID:</span> 2641696 &mdash; Verify our license at{" "}
                <a href="https://www.nmlsconsumeraccess.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  www.nmlsconsumeraccess.org
                </a>
              </p>
              <p>Licensing requirements vary by state. Not all products are available in all states. This is not a commitment to lend. All loans are subject to credit approval, underwriting guidelines, and applicable state and federal regulations.</p>
            </div>
          )}
        </div>

        {/* Terms of Service section */}
        <div className="space-y-3 border-t border-border pt-4">
          <button
            onClick={() => setTermsOpen(v => !v)}
            className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            {termsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Terms of Service
          </button>
          {termsOpen && (
            <div className="text-xs text-muted-foreground leading-relaxed space-y-3 pl-6">
              <p className="font-semibold text-foreground">Agreement to Terms</p>
              <p>By accessing or using this website, you agree to be bound by these Terms of Service. If you do not agree, please do not use this site.</p>

              <p className="font-semibold text-foreground">Use of This Website</p>
              <p>This website is provided for informational and educational purposes related to mortgage and home financing. The estimates, calculations, and content provided are for general guidance only and do not constitute a commitment to lend, a loan approval, or financial advice. All loan decisions are subject to full credit review, underwriting approval, and applicable state and federal regulations.</p>

              <p className="font-semibold text-foreground">Consent to Contact</p>
              <p>By submitting any personal information through this website — including but not limited to your name, contact information, income, credit profile, or financial details — you expressly consent to being contacted by Loansbetter.com, Inc. and its licensed loan officers via telephone, email, or other means regarding your mortgage inquiry. You may opt out of further contact at any time by contacting us directly.</p>

              <p className="font-semibold text-foreground">No Warranty</p>
              <p>All information on this site is provided "as is" without warranty of any kind. Rate estimates are illustrative and based on current market conditions, which may change. Loansbetter.com, Inc. does not guarantee the accuracy, completeness, or timeliness of any information on this site.</p>

              <p className="font-semibold text-foreground">Limitation of Liability</p>
              <p>To the fullest extent permitted by law, Loansbetter.com, Inc. shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of, or inability to use, this website or its content.</p>

              <p className="font-semibold text-foreground">Third-Party Links</p>
              <p>This site may contain links to third-party websites. We are not responsible for the content, accuracy, or practices of those sites and encourage you to review their terms and privacy policies independently.</p>

              <p className="font-semibold text-foreground">Changes to These Terms</p>
              <p>We reserve the right to update these Terms of Service at any time. Continued use of this website following any changes constitutes your acceptance of the revised terms.</p>

              <p>Questions about these terms may be directed to{" "}
                <a href="mailto:info@loansbetter.com" className="text-primary hover:underline">info@loansbetter.com</a>
                {" "}or by calling{" "}
                <a href="tel:7144944172" className="text-primary hover:underline">714-494-4172</a>.
              </p>
            </div>
          )}
        </div>

        {/* Copyright */}
        <div className="border-t border-border pt-4">
          <p className="text-xs text-muted-foreground text-center">
            Copyright &copy; 2024 LoansBetter.com, Inc. All Rights Reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
