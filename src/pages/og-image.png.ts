import type { APIRoute } from "astro";
import { readFile } from "node:fs/promises";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

import { siteConfig } from "@/config/site";

const WIDTH = 1200;
const HEIGHT = 630;

const colors = {
    background: "#F4F6F1",
    foreground: "#17201D",
    primary: "#287878",
    muted: "#596560",
    accent: "#D9EAE5",
    border: "#D2DAD4",
    card: "#FBFCF9",
};

// satori lit uniquement les polices .ttf/.otf/.woff (pas .woff2)
const loadFont = (weight: 400 | 700) =>
    readFile(
        `${process.cwd()}/node_modules/@fontsource/geist/files/geist-latin-${weight}-normal.woff`,
    );

type Node = {
    type: string;
    props: { style?: Record<string, unknown>; children?: unknown };
};

const h = (
    style: Record<string, unknown>,
    children?: Node | Node[] | string,
): Node => ({
    type: "div",
    props: { style: { display: "flex", ...style }, children },
});

const terminalLine = (prompt: string, text: string, color: string) =>
    h({ gap: 12, fontSize: 22 }, [
        h({ color: colors.muted }, prompt),
        h({ color }, text),
    ]);

export const GET: APIRoute = async () => {
    const domain = new URL(siteConfig.url).host;

    const image = h(
        {
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "72px 80px",
            backgroundColor: colors.background,
            backgroundImage: `radial-gradient(circle at 85% 15%, ${colors.accent} 0%, rgba(244, 246, 241, 0) 45%)`,
            fontFamily: "Geist",
            color: colors.foreground,
        },
        [
            h({ flexDirection: "column", justifyContent: "space-between", height: "100%" }, [
                h({ flexDirection: "column" }, [
                    h({ fontSize: 28, color: colors.muted }, "Bonjour, je suis"),
                    h(
                        { fontSize: 96, fontWeight: 700, letterSpacing: "-0.03em", marginTop: 8 },
                        `${siteConfig.name}.`,
                    ),
                    h(
                        { fontSize: 40, fontWeight: 700, color: colors.primary, marginTop: 12 },
                        "DevOps & Infrastructure.",
                    ),
                    h(
                        { fontSize: 26, color: colors.muted, marginTop: 24, maxWidth: 560, lineHeight: 1.4 },
                        "Je construis, automatise et déploie des systèmes reproductibles et fiables.",
                    ),
                ]),
                h({ alignItems: "center", gap: 16 }, [
                    h({ width: 48, height: 6, borderRadius: 3, backgroundColor: colors.primary }),
                    h({ fontSize: 26, fontWeight: 700 }, domain),
                ]),
            ]),

            h(
                {
                    flexDirection: "column",
                    width: 400,
                    borderRadius: 16,
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.card,
                    boxShadow: "0 20px 40px rgba(23, 32, 29, 0.08)",
                },
                [
                    h(
                        {
                            alignItems: "center",
                            gap: 8,
                            padding: "16px 20px",
                            borderBottom: `1px solid ${colors.border}`,
                        },
                        [
                            h({ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.border }),
                            h({ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.border }),
                            h({ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.border }),
                            h({ marginLeft: 12, fontSize: 18, color: colors.muted }, "teo@homelab"),
                        ],
                    ),
                    h({ flexDirection: "column", gap: 14, padding: "24px 24px 28px" }, [
                        terminalLine("$", "whoami", colors.foreground),
                        h({ fontSize: 22, color: colors.primary }, "teo"),
                        terminalLine("$", "ls ~/stack", colors.foreground),
                        h(
                            { fontSize: 22, color: colors.muted, lineHeight: 1.5 },
                            "linux  kvm  docker  k3s  terraform  ansible",
                        ),
                        terminalLine("$", "_", colors.primary),
                    ]),
                ],
            ),
        ],
    );

    const svg = await satori(image as Parameters<typeof satori>[0], {
        width: WIDTH,
        height: HEIGHT,
        fonts: [
            { name: "Geist", data: await loadFont(400), weight: 400, style: "normal" },
            { name: "Geist", data: await loadFont(700), weight: 700, style: "normal" },
        ],
    });

    const png = new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } })
        .render()
        .asPng();

    return new Response(new Uint8Array(png), {
        headers: { "Content-Type": "image/png" },
    });
};
