import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
    locales: ['es', 'pt'],
    defaultLocale: 'es',
    localePrefix: 'as-needed'
});

export const config = {
    matcher: ['/((?!api|_next|admin|.*\\..*).*)']
};
