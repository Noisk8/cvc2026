import { createNavigation } from 'next-intl/navigation';

export const locales = ['es', 'pt'] as const;
export const localePrefix = 'as-needed';

export const { Link, useRouter, usePathname, redirect } = createNavigation({
    locales,
    defaultLocale: 'es',
    localePrefix
});
