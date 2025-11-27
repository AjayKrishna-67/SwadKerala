'use client';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-navy to-navy-dark text-white">
      {/* Main Footer Content */}
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Brand Section (Column 1) */}
            <div className="lg:col-span-1 flex flex-col items-center text-center lg:items-start lg:text-left">
              <div className="p-2 bg-navy-light/30  inline-block">
                <img
                  src="https://s3.ap-south-1.amazonaws.com/cdn.kaaikani.co.in/Logos/swadkerala.png"
                  alt="Swad Kerala LOGO"
                  className="h-14 w-auto"
                />
              </div>
              <p className="mt-4 text-sm text-cream leading-relaxed max-w-xs">
                SwadKerala brings you pure, authentic spices from God's Own Country.
                Each spice is carefully sourced and handpicked, preserving the rich
                flavors and aromas of traditional Kerala. Experience the perfect blend
                of quality, freshness, and true flavors that make every dish exceptional.{' '}
              </p>
            </div>

            {/* Links Wrapper (Columns 2 & 3) */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center sm:text-left">
                {/* Quick Links */}
                <div>
                  <h4 className="font-semibold text-sm uppercase tracking-wider text-gold mb-4">
                    Quick Links
                  </h4>
                  <nav className="space-y-3">
                    <a
                      href="/"
                      className="block text-cream hover:text-white transition-colors text-sm"
                    >
                      Home
                    </a>
                    <a
                      href="/about"
                      className="block text-cream hover:text-white transition-colors text-sm"
                    >
                      About Us
                    </a>
                  </nav>
                </div>

                {/* Support */}
                <div>
                  <h4 className="font-semibold text-sm uppercase tracking-wider text-gold mb-4">
                    Support
                  </h4>
                  <nav className="space-y-3">
                    <a
                      href="/privacy-policy"
                      className="block text-cream hover:text-white transition-colors text-sm"
                    >
                      Privacy Policy
                    </a>
                    <a
                      href="/terms-and-conditions"
                      className="block text-cream hover:text-white transition-colors text-sm"
                    >
                      Terms of Service
                    </a>
                    <p className="block text-cream transition-colors text-sm">FSSI: 21325176000258</p>
                  </nav>
                </div>

                {/* Contact */}
                <div id="contact">
                  <h4 className="font-semibold text-sm uppercase tracking-wider text-gold mb-4">
                    Get in Touch
                  </h4>
                  <address className="not-italic space-y-3 text-sm text-cream">
                    <p className="leading-normal">
                      Galaxy traders, Karimannoor PO- 685581
                      <br />
                      Mannarathara - Kotta Road,
                      <br />
                      Idukki Dist, Kerala
                    </p>
                    <p className="mt-2">
                      <a
                        href="mailto:info@swadkerala.com"
                        className="hover:text-white transition-colors"
                      >
                        support@swadkerala.com
                      </a>
                    </p>
                    <p>
                      <a
                        href="tel:7907816972"
                        className="hover:text-white transition-colors"
                      >
                        7907816972
                      </a>
                    </p>
                  </address>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 mt-12 border-t border-gold/30">
            <p className="text-center text-sm text-gold">
              © {new Date().getFullYear()} SwadKerala. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
