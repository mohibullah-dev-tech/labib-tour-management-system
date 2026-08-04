/**
 * WCAG 2.4.1 (Bypass Blocks): lets keyboard users jump straight past the
 * navbar to the main content, instead of tabbing through every nav link
 * on every single page load. Visually hidden until it receives keyboard
 * focus (Tab is usually the very first press on any page).
 */
function SkipToContent() {
  return (
    <a
      href="#main-content"
      className={[
        'sr-only focus:not-sr-only',
        'focus:fixed focus:top-4 focus:left-4 focus:z-[100]',
        'focus:bg-primary focus:rounded-md focus:px-4 focus:py-2',
        'focus:text-primary-foreground focus:text-sm focus:font-medium focus:shadow-lg',
      ].join(' ')}
    >
      Skip to main content
    </a>
  );
}

export { SkipToContent };
