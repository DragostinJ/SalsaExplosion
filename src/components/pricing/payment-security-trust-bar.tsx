import { ShieldCheck, Lock, CreditCard, RotateCcw, QrCode } from "lucide-react";

interface PaymentSecurityTrustBarProps {
  className?: string;
  showRefundPolicy?: boolean;
}

export function PaymentSecurityTrustBar({
  className = "",
  showRefundPolicy = true,
}: PaymentSecurityTrustBarProps) {
  return (
    <div
      data-testid="payment-security-trust-bar"
      className={`border-2 border-ink bg-paper p-4 text-xs text-ink space-y-2.5 shadow-[4px_4px_0_0_#161311] ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center border-2 border-ink bg-poster-teal text-ink font-bold">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <span className="font-extrabold text-xs uppercase tracking-wider text-ink">
              256-Bit SSL Encrypted Checkout
            </span>
            <p className="text-xs text-ink/75 font-medium">
              Official Stripe PCI-DSS Level 1 payment processing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-ink">
          <span className="border border-ink bg-paper px-2 py-1 flex items-center gap-1 shadow-[2px_2px_0_0_#161311]">
            <CreditCard className="h-3.5 w-3.5 text-poster-red" /> Apple Pay / GPay
          </span>
          <span className="border border-ink bg-paper px-2 py-1 shadow-[2px_2px_0_0_#161311]">
            Visa / Mastercard
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-ink/80 pt-0.5">
        <div className="flex items-center gap-1.5">
          <QrCode className="h-4 w-4 text-poster-teal shrink-0" />
          <span>
            <strong className="text-ink font-bold">Instant Delivery:</strong> Door QR pass generated directly to your account.
          </span>
        </div>

        {showRefundPolicy ? (
          <div className="flex items-center gap-1.5">
            <RotateCcw className="h-4 w-4 text-poster-teal shrink-0" />
            <span>
              <strong className="text-ink font-bold">24h Cancellation Guarantee:</strong> Instant credit refund before class cutoff.
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-poster-teal shrink-0" />
            <span>
              <strong className="text-ink font-bold">Authentic Guarantee:</strong> Direct registration with Salsa Explosion UK.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
