import { materials } from "@/lib/game-materials"
import type { Locale } from "@/lib/locale"

export function GameResources({ slug, lang, printAndPlay, externalPack }: {
  slug: string; lang: Locale; printAndPlay: boolean; externalPack: boolean
}) {
  const entry = materials[slug]
  const th = lang === "th"
  if (!entry && !printAndPlay) return null
  return <div className="game-resources">
    {(entry?.pdf || entry?.sections?.length) && <section>
      <h2>{th ? "กติกาเกม" : "Rulebook"}</h2>
      {entry.pdf && <a className="btn" href={entry.pdf.href} download>{entry.pdf.label[lang]} ↓</a>}
      {entry.sections?.length && <details className="panel">
        <summary>{th ? "อ่านกติกาบนหน้านี้" : "Read the rules on this page"}</summary>
        {entry.sections.map(({ heading, text }) => <section key={heading.en}><h3>{heading[lang]}</h3><p>{text[lang]}</p></section>)}
      </details>}
    </section>}
    {entry?.gallery?.length && <section><h2>{th ? "แกลเลอรี" : "Gallery"}</h2>
      <div className="material-gallery">{entry.gallery.map(image => <figure key={image.href}>
        <a href={image.href} target="_blank" rel="noopener noreferrer"><img loading="lazy" src={image.href} alt={image.label[lang]} /></a>
        <figcaption>{image.label[lang]}</figcaption>
      </figure>)}</div>
    </section>}
    {(entry?.printFiles?.length || (printAndPlay && !externalPack)) && <section id="print-files">
      <h2>{th ? "ไฟล์สำหรับพิมพ์เล่น" : "Print-and-play files"}</h2>
      {entry?.printFiles?.length ? entry.printFiles.map(file => <a className="btn" key={file.href} href={file.href} download>{file.label[lang]} ↓</a>) :
        <p>{th ? "ยังไม่มีชุดอุปกรณ์สำหรับดาวน์โหลด" : "The printable component pack is currently unavailable."}</p>}
    </section>}
  </div>
}
