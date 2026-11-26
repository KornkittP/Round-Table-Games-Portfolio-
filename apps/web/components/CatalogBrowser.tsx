"use client"
import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Grid2X2, List, Star } from "lucide-react"
import { browseItems, type BrowseItem, type SortField } from "@/lib/browse"
import type { Locale } from "@/lib/locale"

type Props = {items: BrowseItem[]; groups: Record<string,string>; lang: Locale}

export function CatalogBrowser({items,groups,lang}:Props) {
  const th = lang === "th"
  const [list,setList] = useState(false)
  const [group,setGroup] = useState("")
  const [players,setPlayers] = useState(0)
  const [field,setField] = useState<SortField>("original")
  const [ascending,setAscending] = useState(false)
  const [reader, setReader] = useState<BrowseItem | null>(null)
  const [bookletIndex, setBookletIndex] = useState(0)
  const heading = useRef<HTMLHeadingElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const booklet = reader?.extraLink?.booklets?.[bookletIndex]
  useEffect(() => {
    if (reader) heading.current?.focus()
  }, [reader])
  const visible = browseItems(items,lang,group,players,field,ascending)
  const counts = [...new Set(items.flatMap(item => {
    if(!item.minPlayers || !item.maxPlayers) return []
    return Array.from({length:item.maxPlayers-item.minPlayers+1},(_,i)=>item.minPlayers!+i)
  }))].sort((a,b)=>a-b)
  const fields: Record<SortField,string> = {
    original: th?"ลำดับในคอลเลกชัน":"Collection order", year: th?"ปีที่เผยแพร่":"Publication year",
    title: th?"ชื่อเกม":"Name", rating: th?"คะแนน BGG":"BGG rating", maxPlayers: th?"จำนวนผู้เล่นสูงสุด":"Maximum players"
  }
  return <div className="catalogBrowser">
    <div className="filters">
      {[["",th?"ทั้งหมด":"All"],...Object.entries(groups)].map(([key,label])=>
        <button key={key} aria-pressed={group===key} onClick={()=>setGroup(key)}>{label}</button>)}
    </div>
    <div className="catalogBar">
      <label>{th?"เรียงตาม":"Sort by"}<select value={field} onChange={e=>{
        const next=e.target.value as SortField
        setField(next);setAscending(next==="title")
      }}>{Object.entries(fields).map(([key,label])=><option value={key} key={key}>{label}</option>)}</select></label>
      {field!=="original" && <label>{th?"ลำดับ":"Order"}<select value={ascending?"asc":"desc"} onChange={e=>setAscending(e.target.value==="asc")}>
        <option value="asc">{field==="title"?"A–Z":field==="year"?(th?"เก่าก่อน":"Oldest first"):(th?"น้อยไปมาก":"Low to high")}</option>
        <option value="desc">{field==="title"?"Z–A":field==="year"?(th?"ใหม่ก่อน":"Newest first"):(th?"มากไปน้อย":"High to low")}</option>
      </select></label>}
      <label>{th?"จำนวนผู้เล่น":"Players"}<select value={players} onChange={e=>setPlayers(Number(e.target.value))}>
        <option value={0}>{th?"ทุกจำนวน":"Any count"}</option>{counts.map(n=><option key={n} value={n}>{n}</option>)}
      </select></label>
      <div className="viewButtons">{([[false,Grid2X2,th?"ตาราง":"Grid"],[true,List,th?"รายการ":"List"]] as const).map(([value,Icon,label])=>
        <button key={label} aria-pressed={list===value} onClick={()=>setList(value)}><Icon size={16}/>{label}</button>)}</div>
    </div>
    <p className="resultCount" role="status">{visible.length} {th?"เกม":visible.length===1?"game":"games"}</p>
    {reader && booklet && <section className="panel translationReader" aria-labelledby="reader-title">
      <div className="row">
        <h2 id="reader-title" tabIndex={-1} ref={heading}>{reader.title}</h2>
        <button className="btn" type="button" onClick={() => {
          setReader(null)
          trigger.current?.focus()
        }}>{th ? "ปิดตัวอ่าน" : "Close reader"}</button>
      </div>
      {reader.extraLink!.booklets!.length > 1 && <label>{th ? "เลือกเล่ม" : "Booklet"}{" "}
        <select value={bookletIndex} onChange={e => setBookletIndex(Number(e.target.value))}>
          {reader.extraLink!.booklets!.map((file,index) => <option value={index} key={file.id}>{file.label}</option>)}
        </select></label>}
      <iframe key={booklet.id} title={reader.title+" · "+booklet.label+" (PDF)"}
        src={"https://drive.google.com/file/d/"+booklet.id+"/preview"} allowFullScreen />
      <a href={"https://drive.google.com/file/d/"+booklet.id+"/view"} target="_blank" rel="noopener noreferrer">
        {th ? "เปิดใน Google Drive" : "Open in Google Drive"}
      </a>
    </section>}
    <div className={list?"catalogList":"grid catalogGrid"}>{visible.map(item=>
      <article className="card catalogCard" key={item.id}>
        <Link {...(/^https?:/.test(item.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})} href={item.href} className="catalogCover" aria-label={item.title}>
          <Image fill src={item.cover} alt="" unoptimized={/^https?:/.test(item.cover)} sizes={list?"100px":"(max-width:500px) 90vw, (max-width:1000px) 45vw, 22vw"}/>
        </Link>
        <div className="cardInfo"><small>{groups[item.groups[0]]}</small>
          <h3><Link {...(/^https?:/.test(item.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})} href={item.href}>{item.title}</Link></h3>{item.subtitle&&<p>{item.subtitle}</p>}
          <p className="catalogSpecs">{item.year && <span>{item.year}</span>}
            {item.minPlayers && <span>{item.minPlayers===item.maxPlayers?item.minPlayers:item.minPlayers+"–"+item.maxPlayers} {th?"คน":"players"}</span>}
            {item.rating!=null && <span aria-label={"BGG "+item.rating}><Star size={14}/>{item.rating.toFixed(1)}</span>}</p>
          {item.extraLink?.booklets?.length ? <button type="button" className="catalogAction readerTrigger"
            onClick={event => {
              trigger.current = event.currentTarget
              setBookletIndex(0)
              setReader(item)
              if (reader === item) heading.current?.focus()
            }}>{item.extraLink.label}</button> :
            item.extraLink && <a target="_blank" rel="noopener noreferrer" className="catalogAction" href={item.extraLink.href}>{item.extraLink.label}</a>}
        </div>
      </article>)}</div>
    {!visible.length && <div className="empty"><p>{th?"ไม่พบเกมที่ตรงกับตัวกรอง":"No games match these filters."}</p>
      <button onClick={()=>{setGroup("");setPlayers(0)}}>{th?"ล้างตัวกรอง":"Clear filters"}</button></div>}
  </div>
}
