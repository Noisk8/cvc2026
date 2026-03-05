import { createNavigation } from 'next-intl/navigation';

export const { Link, useRouter, usePathname, redirect } = createNavigation({
    locales: ['es', '🇧🇷'],
    defaultLocale: 'es',
    localePrefix: 'as-needed'
});
