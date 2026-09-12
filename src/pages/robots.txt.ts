import type { APIRoute } from "astro";

const siteUrl = process.env.PUBLIC_SITE_URL;

export const GET: APIRoute = () => {
    const body = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap-index.xml`;

    return new Response(body, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
        },
    });
};
