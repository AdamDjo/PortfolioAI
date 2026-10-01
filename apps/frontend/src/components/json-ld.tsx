/**
 * Structured data for search engines.
 *
 * Rendered as a script tag because that is the only form crawlers read; there is
 * no metadata API for JSON-LD in Next.
 */

/**
 * Serializes structured data for embedding inside a `<script>` element.
 *
 * `JSON.stringify` alone is not enough. The values come from the CMS, and a title
 * containing `</script>` would close the element early and let the rest of the
 * string be parsed as markup — the classic JSON-in-HTML injection. Escaping `<`
 * as `<` is still valid JSON, so parsers are unaffected while the sequence
 * can no longer terminate the element.
 */
const serializeJsonLd = (data: Record<string, unknown>): string =>
  JSON.stringify(data).replace(/</g, '\\u003c')

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Safe by construction: `serializeJsonLd` neutralises the only sequence
      // that could escape the element.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  )
}

export { JsonLd, serializeJsonLd }
