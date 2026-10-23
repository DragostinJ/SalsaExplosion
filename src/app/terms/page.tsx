import type { Metadata } from "next";
import {
  Scale,
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Terms of Service, UK Consumer Rights & Privacy Policy | Salsa Explosion UK",
  description:
    "Transparent terms of service, 14-day statutory consumer cooling-off rights, class refund policies, duty of care, and UK GDPR privacy notice for Salsa Explosion UK Bournemouth.",
};

export default function TermsAndLegalPage() {
  const lastUpdated = "20 October 2026";

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      <div>
        <BackButton fallbackUrl="/" label="Back to Homepage" />
      </div>

      {/* Header Hub */}
      <div className="space-y-4 text-center sm:text-left border-b pb-8">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <Badge className="bg-primary-base text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 px-3 py-1">
            <Scale className="h-3.5 w-3.5" />
            UK Legal & Consumer Protection
          </Badge>
          <Badge variant="outline" className="border-amber-500/40 text-amber-800 dark:text-amber-300 font-bold text-xs">
            100% Transparency Guarantee
          </Badge>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
          Terms of Service, Consumer Rights & Privacy Notice
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground font-medium max-w-3xl leading-relaxed">
          Welcome to Salsa Explosion UK. We believe in clear, fair, and honest business practices. Below you will find our complete terms governing class bookings, festival passes, UK statutory consumer cancellation rights, safety guidelines, and UK GDPR data protection.
        </p>

        <p className="text-xs text-muted-foreground font-semibold">
          Last Updated & Ratified: {lastUpdated} • Governed by the Laws of England & Wales
        </p>
      </div>

      {/* Quick Navigation Jump Bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border bg-muted/40 p-3.5 text-xs font-bold">
        <span className="text-muted-foreground uppercase tracking-wider text-[11px] mr-1">Jump to:</span>
        <a href="#identity" className="rounded-lg bg-card px-2.5 py-1 text-foreground border hover:bg-primary-base hover:text-white transition-colors">
          1. Business Identity
        </a>
        <a href="#refunds" className="rounded-lg bg-card px-2.5 py-1 text-foreground border hover:bg-primary-base hover:text-white transition-colors">
          2. Refunds & Consumer Rights
        </a>
        <a href="#health-safety" className="rounded-lg bg-card px-2.5 py-1 text-foreground border hover:bg-primary-base hover:text-white transition-colors">
          3. Health & Safety Duty of Care
        </a>
        <a href="#privacy" className="rounded-lg bg-card px-2.5 py-1 text-foreground border hover:bg-primary-base hover:text-white transition-colors">
          4. UK GDPR Privacy Notice
        </a>
      </div>

      {/* Section 1: Business Identity & E-Commerce */}
      <section id="identity" className="space-y-4 pt-4">
        <div className="flex items-center gap-2 text-primary-base">
          <FileText className="h-5 w-5" />
          <h2 className="text-xl sm:text-2xl font-black text-foreground">
            1. Business Identity & Statutory Details
          </h2>
        </div>

        <Card className="border shadow-xs">
          <CardContent className="p-6 space-y-4 text-xs sm:text-sm text-foreground/90 font-medium leading-relaxed">
            <p>
              In accordance with the <strong>Electronic Commerce (EC Directive) Regulations 2002</strong> and the <strong>Companies (Trading Disclosures) Regulations 2008</strong>, our full trading and contact details are as follows:
            </p>

            <div className="grid gap-3 sm:grid-cols-2 rounded-xl border bg-muted/30 p-4 text-xs font-medium">
              <div>
                <span className="block font-bold text-muted-foreground uppercase text-[10px]">Trading Name</span>
                <span className="font-extrabold text-foreground text-sm">Salsa Explosion UK</span>
                <span className="block text-muted-foreground">Directed by Maestro Enrique Perez Valdes</span>
              </div>
              <div>
                <span className="block font-bold text-muted-foreground uppercase text-[10px]">Principal Studio Address</span>
                <span className="font-bold text-foreground">BOH Studios, 104 Commercial Road</span>
                <span className="block text-muted-foreground">The Triangle, Bournemouth, BH2 5LR, United Kingdom</span>
              </div>
              <div>
                <span className="block font-bold text-muted-foreground uppercase text-[10px]">Email Enquiries</span>
                <a href="mailto:info@salsaexplosion.co.uk" className="font-extrabold text-rose-800 dark:text-rose-400 hover:underline">
                  info@salsaexplosion.co.uk
                </a>
              </div>
              <div>
                <span className="block font-bold text-muted-foreground uppercase text-[10px]">Studio Desk Phone & WhatsApp</span>
                <a href="tel:+447969633701" className="font-extrabold text-rose-800 dark:text-rose-400 hover:underline">
                  07969 633701
                </a>
              </div>
            </div>

            <p>
              <strong>Transparent Pricing in GBP (£):</strong> All class fees, ticket prices, and passes displayed on this website are shown in British Pounds Sterling (£) and represent the total price charged at checkout. There are zero hidden booking surcharges or card administration fees.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Section 2: Refunds & UK Consumer Contracts Regulations 2013 */}
      <section id="refunds" className="space-y-4 pt-4">
        <div className="flex items-center gap-2 text-primary-base">
          <RefreshCw className="h-5 w-5" />
          <h2 className="text-xl sm:text-2xl font-black text-foreground">
            2. Cancellation Rights, Refunds & Consumer Protection
          </h2>
        </div>

        <Card className="border shadow-xs">
          <CardContent className="p-6 space-y-6 text-xs sm:text-sm text-foreground/90 font-medium leading-relaxed">
            <p>
              Your rights when purchasing digital credits, passes, and event tickets are protected under the <strong>Consumer Rights Act 2015</strong> and the <strong>Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013</strong>.
            </p>

            <div className="space-y-4">
              {/* Unused Credit Packs */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <h3>Unused Class Credit Packs & Gift Vouchers — 14-Day Statutory Cooling-Off Period</h3>
                </div>
                <p className="text-xs">
                  Under Regulation 29 of the Consumer Contracts Regulations 2013, you have the right to cancel your purchase of any unused digital class credit pack (e.g. 5-Class Rhythm Pack, 10-Class Master Pack) or Dance Gift Voucher within <strong>14 calendar days</strong> from the date of purchase without giving any reason, and receive a 100% full refund to your original payment method. To exercise this right, simply email <a href="mailto:info@salsaexplosion.co.uk" className="font-bold underline">info@salsaexplosion.co.uk</a> with your purchase email before the 14 days expire.
                </p>
              </div>

              {/* Weekly Class Bookings */}
              <div className="rounded-xl border bg-card p-4 space-y-2">
                <h3 className="font-bold text-sm text-foreground">
                  Weekly Class Cancellations & Re-credits
                </h3>
                <p className="text-xs">
                  If you have booked a weekly class (Thursday or Sunday at BOH Studios) and are unable to attend, you may cancel your booking online up to <strong>2 hours prior to class start time</strong>. Your class credit will be instantly returned to your digital wallet for future use. If Salsa Explosion cancels a class due to teacher illness or venue emergency, all booked credits are refunded to affected students automatically.
                </p>
              </div>

              {/* Dated Congress & Special Events */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <h3>Dated Events & Weekend Congresses (Regulation 28(1)(h) Exemption)</h3>
                </div>
                <p className="text-xs">
                  Under UK law (Regulation 28(1)(h) of the Consumer Contracts Regulations 2013), contracts for leisure activities provided on a specific date or period of performance (such as the <strong>MADE IN CUBA Dance Weekend</strong>, <strong>Halloween Latin Party</strong>, and <strong>DANZA! Special Events</strong>) are exempt from the statutory 14-day cancellation right once purchased.
                </p>
                <p className="text-xs font-semibold">
                  <strong>Our Fair Transfer Policy:</strong> While festival tickets are non-refundable, Salsa Explosion permits <strong>100% free name transfers</strong> to another dancer or studio credit conversions up to <strong>48 hours before the event start time</strong>. Contact Enrique on 07969 633701 to arrange a transfer.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 3: Health, Safety & Lawful Duty of Care */}
      <section id="health-safety" className="space-y-4 pt-4">
        <div className="flex items-center gap-2 text-primary-base">
          <HeartHandshake className="h-5 w-5" />
          <h2 className="text-xl sm:text-2xl font-black text-foreground">
            3. Health, Safety & Lawful Duty of Care
          </h2>
        </div>

        <Card className="border shadow-xs">
          <CardContent className="p-6 space-y-4 text-xs sm:text-sm text-foreground/90 font-medium leading-relaxed">
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
          </CardContent>
        </Card>
      </section>

      {/* Section 4: UK GDPR & Privacy Notice */}
      <section id="privacy" className="space-y-4 pt-4">
        <div className="flex items-center gap-2 text-primary-base">
          <Lock className="h-5 w-5" />
          <h2 className="text-xl sm:text-2xl font-black text-foreground">
            4. UK GDPR & Data Protection Act 2018 Privacy Notice
          </h2>
        </div>

        <Card className="border shadow-xs">
          <CardContent className="p-6 space-y-4 text-xs sm:text-sm text-foreground/90 font-medium leading-relaxed">
            <p>
              Salsa Explosion UK respects your privacy and is committed to protecting your personal data in strict compliance with the <strong>UK General Data Protection Regulation (UK GDPR)</strong> and the <strong>Data Protection Act 2018</strong>.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border rounded-xl overflow-hidden">
                <thead className="bg-muted text-foreground uppercase tracking-wider font-extrabold">
                  <tr className="border-b">
                    <th className="p-3">Data We Collect</th>
                    <th className="p-3">Why We Need It</th>
                    <th className="p-3">Lawful Basis (UK GDPR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="p-3 font-semibold">Name & Email Address</td>
                    <td className="p-3">Account creation, class booking confirmations, digital wallet pass delivery.</td>
                    <td className="p-3 text-muted-foreground font-mono">Art. 6(1)(b) Contract</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Dance Role & Level</td>
                    <td className="p-3">Ensuring equal Lead/Follow class ratios and syllabus progression.</td>
                    <td className="p-3 text-muted-foreground font-mono">Art. 6(1)(b) Contract</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Door Check-In Timestamp</td>
                    <td className="p-3">Fire safety roll-call, class attendance validation, and credit deduction.</td>
                    <td className="p-3 text-muted-foreground font-mono">Art. 6(1)(f) Legitimate Interest</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Payment Token & Last 4 Digits</td>
                    <td className="p-3">Processed securely via Stripe (we never see or store full card details).</td>
                    <td className="p-3 text-muted-foreground font-mono">Art. 6(1)(b) Contract</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>
              <strong>Trusted Sub-Processors:</strong> We only use industry-leading, certified infrastructure providers:
            </p>
            <ul className="text-xs list-disc pl-5 space-y-1 text-muted-foreground">
              <li><strong>Clerk:</strong> Secure user authentication, MFA, and session tokens.</li>
              <li><strong>Stripe UK:</strong> PCI-DSS Level 1 compliant card and Apple/Google Pay processing.</li>
              <li><strong>Supabase:</strong> Encrypted PostgreSQL database hosted within UK/EU jurisdictions.</li>
            </ul>

            <p className="font-semibold text-foreground pt-1">
              <strong>Your Rights:</strong> Under UK GDPR, you have the right to access your personal data, request correction of errors, or request total account deletion (&ldquo;Right to be Forgotten&rdquo;). To make a Subject Access Request (SAR) or delete your account, email our Data Privacy Officer at <a href="mailto:info@salsaexplosion.co.uk" className="text-rose-800 dark:text-rose-400 font-extrabold underline">info@salsaexplosion.co.uk</a>. We respond within 30 days free of charge.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Support Strip */}
      <div className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-background to-rose-500/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <h3 className="text-base font-black text-foreground">
            Have a Question About Our Terms or a Booking?
          </h3>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            We are always here to help. Speak directly with Maestro Enrique.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 shrink-0">
          <a
            href="tel:+447969633701"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary-base px-4 py-2.5 text-xs font-black text-white hover:bg-primary-hover transition-all shadow-xs"
          >
            <Phone className="h-3.5 w-3.5" />
            07969 633701
          </a>
          <a
            href="mailto:info@salsaexplosion.co.uk"
            className="inline-flex items-center gap-1.5 rounded-xl border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-all"
          >
            <Mail className="h-3.5 w-3.5 text-amber-600" />
            info@salsaexplosion.co.uk
          </a>
        </div>
      </div>
    </main>
  );
}
