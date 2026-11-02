import type { Metadata } from "next";
import {
  RefreshCw,
  HeartHandshake,
  Lock,
  Mail,
  Phone,
  FileText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { BackButton } from "@/components/navigation/back-button";
import { TYPE, KICKER, POSTER_BUTTON, POSTER_BUTTON_COLORS } from "@/components/poster/poster-kit";

export const metadata: Metadata = {
  title: "Terms of Service, UK Consumer Rights & Privacy Policy | Salsa Explosion UK",
  description:
    "Transparent terms of service, 14-day statutory consumer cooling-off rights, class refund policies, duty of care, and UK GDPR privacy notice for Salsa Explosion UK Bournemouth.",
};

export default function TermsAndLegalPage() {
  const lastUpdated = "20 October 2026";

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      <div>
        <BackButton fallbackUrl="/" label="Back to Homepage" />
      </div>

      {/* Header Hub with Poster Hero */}
      <section
        data-testid="page-header"
        className="relative overflow-hidden border-4 border-ink bg-paper p-6 sm:p-10 text-ink shadow-[8px_8px_0_0_#161311]"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-4 border-ink pb-3 text-xs font-bold uppercase tracking-[0.3em] text-ink">
          <span>UK LEGAL &amp; CONSUMER PROTECTION</span>
          <span className="opacity-70">100% TRANSPARENCY GUARANTEE</span>
        </div>

        <div className="mt-4 space-y-3">
          <p className={KICKER}>Statutory Disclosures &amp; Fair Trading</p>
          <h1 className={`${TYPE.section} text-ink`}>
            TERMS OF SERVICE, <span className="text-poster-red">Consumer Rights &amp; Privacy</span>
          </h1>
          <p className="max-w-3xl text-sm font-semibold text-ink/80 leading-relaxed">
            Welcome to Salsa Explosion UK. We believe in clear, fair, and honest business practices. Below you will find our complete terms governing class bookings, festival passes, UK statutory consumer cancellation rights, safety guidelines, and UK GDPR data protection.
          </p>
          <p className="text-xs font-bold text-ink/70 pt-1">
            Last Updated &amp; Ratified: {lastUpdated} • Governed by the Laws of England &amp; Wales
          </p>
        </div>
      </section>

      {/* Quick Navigation Jump Bar */}
      <div className="flex flex-wrap items-center gap-2 border-4 border-ink bg-paper p-3.5 text-xs font-bold text-ink shadow-[4px_4px_0_0_#161311]">
        <span className="text-ink/75 uppercase tracking-wider text-xs mr-1">Jump to:</span>
        <a href="#identity" className="border-2 border-ink bg-paper px-3 py-1 text-ink hover:bg-ink hover:text-paper transition-colors">
          1. Business Identity
        </a>
        <a href="#refunds" className="border-2 border-ink bg-paper px-3 py-1 text-ink hover:bg-ink hover:text-paper transition-colors">
          2. Refunds &amp; Consumer Rights
        </a>
        <a href="#health-safety" className="border-2 border-ink bg-paper px-3 py-1 text-ink hover:bg-ink hover:text-paper transition-colors">
          3. Health &amp; Safety Duty of Care
        </a>
        <a href="#privacy" className="border-2 border-ink bg-paper px-3 py-1 text-ink hover:bg-ink hover:text-paper transition-colors">
          4. UK GDPR Privacy Notice
        </a>
      </div>

      {/* Section 1: Business Identity & E-Commerce */}
      <section id="identity" className="space-y-4 pt-4">
        <div className="flex items-center gap-2 text-ink">
          <FileText className="h-5 w-5 text-poster-red" />
          <h2 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-ink">
            1. Business Identity &amp; Statutory Details
          </h2>
        </div>

        <div className="border-4 border-ink bg-paper p-6 text-xs sm:text-sm text-ink leading-relaxed shadow-[6px_6px_0_0_#161311] space-y-4 font-medium">
          <p>
            In accordance with the <strong>Electronic Commerce (EC Directive) Regulations 2002</strong> and the <strong>Companies (Trading Disclosures) Regulations 2008</strong>, our full trading and contact details are as follows:
          </p>

          <div className="grid gap-3 sm:grid-cols-2 border-2 border-ink bg-poster-mustard/20 p-4 text-xs font-medium">
            <div>
              <span className="block font-bold text-ink/75 uppercase text-xs">Trading Name</span>
              <span className="font-extrabold text-ink text-sm">Salsa Explosion UK</span>
              <span className="block text-ink/80">Directed by Maestro Enrique Perez Valdes</span>
            </div>
            <div>
              <span className="block font-bold text-ink/75 uppercase text-xs">Principal Studio Address</span>
              <span className="font-bold text-ink">BOH Studios, 104 Commercial Road</span>
              <span className="block text-ink/80">The Triangle, Bournemouth, BH2 5LR, United Kingdom</span>
            </div>
            <div>
              <span className="block font-bold text-ink/75 uppercase text-xs">Email Enquiries</span>
              <a href="mailto:info@salsaexplosion.co.uk" className="font-bold text-poster-red hover:underline">
                info@salsaexplosion.co.uk
              </a>
            </div>
            <div>
              <span className="block font-bold text-ink/75 uppercase text-xs">Studio Desk Phone &amp; WhatsApp</span>
              <a href="tel:+447969633701" className="font-bold text-poster-red hover:underline">
                07969 633701
              </a>
            </div>
          </div>

          <p>
            <strong>Transparent Pricing in GBP (£):</strong> All class fees, ticket prices, and passes displayed on this website are shown in British Pounds Sterling (£) and represent the total price charged at checkout. There are zero hidden booking surcharges or card administration fees.
          </p>
        </div>
      </section>

      {/* Section 2: Refunds & UK Consumer Contracts Regulations 2013 */}
      <section id="refunds" className="space-y-4 pt-4">
        <div className="flex items-center gap-2 text-ink">
          <RefreshCw className="h-5 w-5 text-poster-teal" />
          <h2 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-ink">
            2. Cancellation Rights, Refunds &amp; Consumer Protection
          </h2>
        </div>

        <div className="border-4 border-ink bg-paper p-6 text-xs sm:text-sm text-ink leading-relaxed shadow-[6px_6px_0_0_#161311] space-y-6 font-medium">
          <p>
            Your rights when buying festival and special-event passes or gift vouchers are protected under the <strong>Consumer Rights Act 2015</strong> and the <strong>Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013</strong>.
          </p>

          <div className="space-y-4">
            {/* Gift vouchers */}
            <div className="border-2 border-ink bg-poster-teal/20 p-4 space-y-2 text-ink">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="h-4 w-4 text-poster-teal shrink-0" />
                <h3 className="font-display uppercase tracking-tight text-base">Gift Vouchers — 14-Day Statutory Cooling-Off Period</h3>
              </div>
              <p className="text-xs">
                Under Regulation 29 of the Consumer Contracts Regulations 2013, you have the right to cancel your purchase of any unused Dance Gift Voucher within <strong>14 calendar days</strong> from the date of purchase without giving any reason, and receive a 100% full refund to your original payment method. To exercise this right, simply email <a href="mailto:info@salsaexplosion.co.uk" className="font-bold underline text-ink">info@salsaexplosion.co.uk</a> with your purchase email before the 14 days expire.
              </p>
            </div>

            {/* Weekly Class Bookings */}
            <div className="border-2 border-ink bg-paper p-4 space-y-2 text-ink">
              <h3 className="font-display font-black uppercase text-base text-ink">
                Weekly Class Reservations
              </h3>
              <p className="text-xs">
                Weekly classes (Thursday or Sunday at BOH Studios) are paid at the door, so nothing is charged online. If you have reserved a spot and can&apos;t come, please cancel your reservation in the app so the Lead/Follow balance stays fair for everyone. If Salsa Explosion cancels a class, reservations are released automatically.
              </p>
            </div>

            {/* Dated Congress & Special Events */}
            <div className="border-2 border-ink bg-poster-mustard/30 p-4 space-y-2 text-ink">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertCircle className="h-4 w-4 text-poster-red shrink-0" />
                <h3 className="font-display uppercase tracking-tight text-base">Dated Events &amp; Weekend Congresses (Regulation 28(1)(h) Exemption)</h3>
              </div>
              <p className="text-xs">
                Under UK law (Regulation 28(1)(h) of the Consumer Contracts Regulations 2013), contracts for leisure activities provided on a specific date or period of performance (such as the <strong>MADE IN CUBA Dance Weekend</strong>, <strong>Halloween Latin Party</strong>, and <strong>DANZA! Special Events</strong>) are exempt from the statutory 14-day cancellation right once purchased.
              </p>
              <p className="text-xs font-bold">
                <strong>Our Fair Transfer Policy:</strong> While festival tickets are non-refundable, Salsa Explosion permits <strong>100% free name transfers</strong> to another dancer or studio credit conversions up to <strong>48 hours before the event start time</strong>. Contact Enrique on 07969 633701 to arrange a transfer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Health, Safety & Lawful Duty of Care */}
      <section id="health-safety" className="space-y-4 pt-4">
        <div className="flex items-center gap-2 text-ink">
          <HeartHandshake className="h-5 w-5 text-poster-red" />
          <h2 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-ink">
            3. Health, Safety &amp; Lawful Duty of Care
          </h2>
        </div>

        <div className="border-4 border-ink bg-paper p-6 text-xs sm:text-sm text-ink leading-relaxed shadow-[6px_6px_0_0_#161311] space-y-4 font-medium">
          <p>
            Under Section 65 of the <strong>Consumer Rights Act 2015</strong> and the <strong>Unfair Contract Terms Act 1977</strong>, Salsa Explosion UK does not, and cannot legally, exclude or restrict liability for death or personal injury resulting from its own negligence.
          </p>

          <ul className="space-y-2 text-xs list-disc pl-5">
            <li>
              <strong>Physical Exercise Self-Assessment:</strong> Cuban Salsa, Rueda de Casino, and Afro-Cuban dance involve cardiovascular exercise, turns, and partnerwork. Participants are responsible for ensuring they are in reasonable physical health to participate. If you have an existing injury or medical condition, please consult your doctor and notify your instructor prior to class.
            </li>
            <li>
              <strong>Appropriate Footwear:</strong> For your comfort and safety on hardwood and sprung ballroom floors, please wear smooth-soled dance shoes, jazz shoes, or clean indoor trainers that allow smooth pivoting. Stiletto heels without protective caps are strictly prohibited to protect sprung dance floors.
            </li>
            <li>
              <strong>Respectful Dance Floor Conduct:</strong> Salsa Explosion is a friendly, inclusive family. Harassment, unwanted physical contact, or disrespectful behaviour will result in immediate removal from the venue without refund.
            </li>
            <li>
              <strong>Personal Property:</strong> Cloakrooms and coat racks are provided for your convenience. Please keep valuables with you; Salsa Explosion cannot accept liability for lost or unattended personal items unless caused by our proven negligence.
            </li>
          </ul>
        </div>
      </section>

      {/* Section 4: UK GDPR & Privacy Notice */}
      <section id="privacy" className="space-y-4 pt-4">
        <div className="flex items-center gap-2 text-ink">
          <Lock className="h-5 w-5 text-poster-teal" />
          <h2 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-ink">
            4. UK GDPR &amp; Data Protection Act 2018 Privacy Notice
          </h2>
        </div>

        <div className="border-4 border-ink bg-paper p-6 text-xs sm:text-sm text-ink leading-relaxed shadow-[6px_6px_0_0_#161311] space-y-4 font-medium">
          <p>
            Salsa Explosion UK respects your privacy and is committed to protecting your personal data in strict compliance with the <strong>UK General Data Protection Regulation (UK GDPR)</strong> and the <strong>Data Protection Act 2018</strong>.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-2 border-ink">
              <thead className="bg-poster-mustard text-ink uppercase tracking-wider font-bold border-b-2 border-ink">
                <tr>
                  <th className="p-3 border-r-2 border-ink">Data We Collect</th>
                  <th className="p-3 border-r-2 border-ink">Why We Need It</th>
                  <th className="p-3">Lawful Basis (UK GDPR)</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-ink">
                <tr>
                  <td className="p-3 font-bold border-r-2 border-ink">Name &amp; Email Address</td>
                  <td className="p-3 border-r-2 border-ink">Account creation, class booking confirmations, digital wallet pass delivery.</td>
                  <td className="p-3 font-mono">Art. 6(1)(b) Contract</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold border-r-2 border-ink">Dance Role &amp; Level</td>
                  <td className="p-3 border-r-2 border-ink">Ensuring equal Lead/Follow class ratios and syllabus progression.</td>
                  <td className="p-3 font-mono">Art. 6(1)(b) Contract</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold border-r-2 border-ink">Door Check-In Timestamp</td>
                  <td className="p-3 border-r-2 border-ink">Fire safety roll-call and class attendance validation.</td>
                  <td className="p-3 font-mono">Art. 6(1)(f) Legitimate Interest</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold border-r-2 border-ink">Payment Token &amp; Last 4 Digits</td>
                  <td className="p-3 border-r-2 border-ink">Processed securely via Stripe (we never see or store full card details).</td>
                  <td className="p-3 font-mono">Art. 6(1)(b) Contract</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            <strong>Trusted Sub-Processors:</strong> We only use industry-leading, certified infrastructure providers:
          </p>
          <ul className="text-xs list-disc pl-5 space-y-1 text-ink/80 font-medium">
            <li><strong>Clerk:</strong> Secure user authentication, MFA, and session tokens.</li>
            <li><strong>Stripe UK:</strong> PCI-DSS Level 1 compliant card and Apple/Google Pay processing.</li>
            <li><strong>Supabase:</strong> Encrypted PostgreSQL database hosted within UK/EU jurisdictions.</li>
          </ul>

          <p className="font-bold text-ink pt-1">
            <strong>Your Rights:</strong> Under UK GDPR, you have the right to access your personal data, request correction of errors, or request total account deletion (&ldquo;Right to be Forgotten&rdquo;). To make a Subject Access Request (SAR) or delete your account, email our Data Privacy Officer at <a href="mailto:info@salsaexplosion.co.uk" className="text-poster-red font-bold underline">info@salsaexplosion.co.uk</a>. We respond within 30 days free of charge.
          </p>
        </div>
      </section>

      {/* Support Strip */}
      <div className="border-4 border-ink bg-poster-mustard p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-ink shadow-[6px_6px_0_0_#161311]">
        <div>
          <h3 className="font-display font-black text-lg uppercase tracking-tight text-ink">
            Have a Question About Our Terms or a Booking?
          </h3>
          <p className="text-xs text-ink/80 font-bold mt-0.5">
            We are always here to help. Speak directly with Maestro Enrique.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <a
            href="tel:+447969633701"
            className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} text-xs font-bold px-4 py-2 min-h-[40px] flex items-center gap-1.5`}
          >
            <Phone className="h-3.5 w-3.5" />
            07969 633701
          </a>
          <a
            href="mailto:info@salsaexplosion.co.uk"
            className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.outline} bg-paper text-xs font-bold px-4 py-2 min-h-[40px] flex items-center gap-1.5`}
          >
            <Mail className="h-3.5 w-3.5 text-poster-red" />
            info@salsaexplosion.co.uk
          </a>
        </div>
      </div>
    </main>
  );
}
