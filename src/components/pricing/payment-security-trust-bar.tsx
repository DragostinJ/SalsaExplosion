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
      className={`rounded-xl border border-white/10 bg-[#0E0C0A] p-4 text-xs text-foreground space-y-2.5 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Lock className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="font-extrabold text-[11px] uppercase tracking-wider text-emerald-300">
              256-Bit SSL Encrypted Checkout
            </span>
            <p className="text-[10px] text-muted-foreground">
              Official Stripe PCI-DSS Level 1 payment processing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
          <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 flex items-center gap-1 shadow-2xs">
            <CreditCard className="h-3 w-3 text-rose-400" /> Apple Pay / GPay
          </span>
          <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 shadow-2xs">
            Visa / Mastercard
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-0.5">
        <div className="flex items-center gap-1.5">
          <QrCode className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-foreground">Instant Delivery:</strong> Door QR pass generated directly to your account.
          </span>
        </div>

        {showRefundPolicy ? (
          <div className="flex items-center gap-1.5">
            <RotateCcw className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>
              <strong className="text-foreground">24h Cancellation Guarantee:</strong> Instant credit refund before class cutoff.
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>
              <strong className="text-foreground">Authentic Guarantee:</strong> Direct registration with Salsa Explosion UK.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
