import { Link } from 'react-router';
import { Phone, Mail } from 'lucide-react';
import labibLogo from '@/assets/labib_logo.jpg';
import { NAV_ITEMS, LEGAL_ITEMS } from '@/config/navigation';
import {
  POPULAR_DESTINATIONS,
  SOCIAL_LINKS,
  EMERGENCY_CONTACT,
} from '@/components/layout/Footer/footer-data';
import { Container } from '@/components/common/Container';
import { Separator } from '@/components/ui/separator';
import { Caption } from '@/components/ui/typography';

/**
 * Site-wide footer. Static content only (per this phase's scope) — every
 * list here reads from a config file (navigation.ts, footer-data.ts) so
 * swapping in real data later means editing config, not this component.
 */
function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-border bg-muted/40 border-t">
      <Container className="laptop:grid-cols-4 grid grid-cols-1 gap-10 py-12 sm:grid-cols-2">
        {/* Company info */}
        <div className="flex flex-col gap-3">
          <Link
            to="/"
            className="font-display text-foreground flex items-center gap-2.5 text-lg font-bold"
          >
            <img
              src={labibLogo}
              alt="Labib Tours Logo"
              className="ring-border size-8 rounded-full object-cover shadow-xs ring-1"
            />
            <span>Labib Tours</span>
          </Link>
          <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
            লাবিব ট্যুর ম্যানেজমেন্ট সিস্টেম — বাংলাদেশের সেরা গ্রুপ ট্যুর ও স্মরণীয় ভ্রমণ
            অভিজ্ঞতা।
          </p>
          <ul className="mt-1 flex items-center gap-2">
            {SOCIAL_LINKS.map(({ label, href, icon: SocialIcon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="border-border bg-background text-muted-foreground hover:border-primary hover:text-primary flex size-9 items-center justify-center rounded-full border transition-colors"
                >
                  <SocialIcon className="size-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick links */}
        <div className="flex flex-col gap-3">
          <Caption>প্রয়োজনীয় লিংক</Caption>
          <ul className="flex flex-col gap-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="text-muted-foreground hover:text-primary text-sm transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Popular destinations */}
        <div className="flex flex-col gap-3">
          <Caption>জনপ্রিয় গন্তব্যসমূহ</Caption>
          <ul className="flex flex-col gap-2">
            {POPULAR_DESTINATIONS.map((dest) => (
              <li key={dest.label}>
                <Link
                  to={dest.path}
                  className="text-muted-foreground hover:text-primary text-sm transition-colors"
                >
                  {dest.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Emergency contact */}
        <div className="flex flex-col gap-2.5">
          <Caption>জরুরি যোগাযোগ ও হোয়াটসঅ্যাপ</Caption>
          <div className="flex flex-col gap-1.5">
            {EMERGENCY_CONTACT.phones.map((p) => (
              <a
                key={p.number}
                href={`tel:${p.raw}`}
                className="text-muted-foreground hover:text-primary flex items-center gap-2 text-sm transition-colors"
              >
                <Phone className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{p.number}</span>
              </a>
            ))}
          </div>
          <a
            href={`mailto:${EMERGENCY_CONTACT.email}`}
            className="text-muted-foreground hover:text-primary flex items-center gap-2 text-sm transition-colors"
          >
            <Mail className="size-3.5 shrink-0" />
            {EMERGENCY_CONTACT.email}
          </a>
        </div>
      </Container>

      <Separator />

      <Container className="text-muted-foreground flex flex-col items-center justify-between gap-3 py-6 text-sm sm:flex-row">
        <p>© {year} লাবিব ট্যুর ম্যানেজমেন্ট সিস্টেম। সর্বস্বত্ব সংরক্ষিত।</p>
        <ul className="flex items-center gap-4">
          {LEGAL_ITEMS.map((item) => (
            <li key={item.path}>
              <Link to={item.path} className="hover:text-primary transition-colors">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </footer>
  );
}

export { Footer };
