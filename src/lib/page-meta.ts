export function pageMeta(title: string, description: string, privatePage = false) {
  return { meta: [
    { title: `${title} — Samba Job Connect` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} — Samba Job Connect` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    ...(privatePage ? [{ name: "robots", content: "noindex" }] : []),
  ] };
}