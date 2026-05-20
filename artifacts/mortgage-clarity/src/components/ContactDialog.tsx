import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Phone, Mail } from "lucide-react";

interface ContactDialogProps {
  children: (open: () => void) => React.ReactNode;
}

export function ContactDialog({ children }: ContactDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {children(() => setOpen(true))}

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />

            {/* Dialog */}
            <motion.div
              key="dialog"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: "spring", duration: 0.35, bounce: 0.2 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4"
            >
              <div className="bg-card border border-border rounded-3xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-primary px-8 pt-8 pb-6 relative">
                  <button
                    onClick={() => setOpen(false)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                  <p className="text-primary-foreground/70 text-xs font-semibold uppercase tracking-widest mb-1">LoansBetter</p>
                  <h2 className="text-primary-foreground font-serif text-3xl font-semibold">Contact Us</h2>
                </div>

                {/* Contact items */}
                <div className="px-8 py-8 space-y-6">
                  <a
                    href="https://maps.google.com/?q=17220+Newhope+Street+214A+Fountain+Valley+CA+92708"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary/20 transition-colors">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Address</p>
                      <p className="text-foreground font-medium leading-snug group-hover:text-primary transition-colors">
                        17220 Newhope Street #214A<br />
                        Fountain Valley, CA 92708
                      </p>
                    </div>
                  </a>

                  <a
                    href="tel:7144944172"
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary/20 transition-colors">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Phone</p>
                      <p className="text-foreground font-medium text-lg group-hover:text-primary transition-colors">
                        714-494-4172
                      </p>
                    </div>
                  </a>

                  <a
                    href="mailto:info@loansbetter.com"
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary/20 transition-colors">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Email</p>
                      <p className="text-foreground font-medium group-hover:text-primary transition-colors">
                        info@loansbetter.com
                      </p>
                    </div>
                  </a>
                </div>

                {/* Call button */}
                <div className="px-8 pb-8">
                  <a
                    href="tel:7144944172"
                    className="flex items-center justify-center gap-2 w-full h-13 bg-primary text-primary-foreground rounded-full font-semibold text-base hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] py-3.5"
                  >
                    <Phone className="w-4 h-4" />
                    Call 714-494-4172
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
