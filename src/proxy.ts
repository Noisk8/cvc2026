import createMiddleware from 'next-intl/middleware';
import { locales, localePrefix } from './navigation';

export default createMiddleware({
    locales,
    localePrefix,
    defaultLocale: 'es'
});

export const config = {
    // Match only internationalized pathnames
    matcher: ['/', '/(es|pt)/:path*']
};
