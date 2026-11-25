// Published specifications from the BoardGameGeek records linked on each detail page.
export const editions: Record<
  string,
  {
    players: string
    minutes: string
    age: string
    year: number
    en: string
    th: string
  }
> = {
  "tangmo-tangmo-tangmo": {
    players: "2–4", minutes: "15", age: "8+", year: 2026,
    en: "Planned launch at Thailand Indy Board Game Market in December 2026 at Big C Ratchadamri, opposite CentralWorld.",
    th: "วางแผนเปิดตัวที่งาน Thailand Indy Board Game Market ในเดือนธันวาคม 2569 ณ บิ๊กซี ราชดำริ ตรงข้ามเซ็นทรัลเวิลด์"
  },
  "cat-avenue": {
    players: "1–6",
    minutes: "15–20",
    age: "8+",
    year: 2022,
    en: "Play paw cards to guide a cat around a circle. The pattern you leave behind decides which cats you meet and how many fish you collect.",
    th: "คุณคือแมวจากดาวแมวที่กำลังเลือกชีวิตใหม่ บางตัวที่เจออาจไม่ใช่แมวด้วยซ้ำ! เลือกเล่นการ์ดรอยเท้าจากมือเพื่อสร้างรูปแบบการเดินรอบวง พาแมวไปยังตำแหน่งที่ต้องการ แล้วเลือกตัวที่เหมาะกับคุณเพื่อเก็บคะแนน ผู้ที่สะสมปลาได้มากที่สุดเป็นผู้ชนะ"
  },
  "potato-tomato": {
    players: "3–6",
    minutes: "15–30",
    age: "14+",
    year: 2024,
    en: "Potato and tomato spies try to uncover one another’s identities. Watch the cards closely: an ally can switch sides before the next reveal.",
    th: "เมื่อมันฝรั่งอบกับมะเขือเทศอบต่างอ้างว่าเป็นเครื่องเคียงยอดนิยม การโต้เถียงก็ลุกลามเป็นสงครามสายลับ ขณะที่พันธมิตรผักผลไม้ยังไม่เข้ามายุ่ง คุณเป็นสายลับที่ต้องเปิดโปงบทบาทของผู้เล่นคนอื่น หากการ์ดบทบาททั้งหมดของใครถูกเปิดเผย ผู้เล่นคนนั้นและเพื่อนร่วมทีมจะตกรอบ แต่ทีมเปลี่ยนได้ตลอดเกม คุณจะไว้ใจใครได้บ้าง?"
  },
  "city-line": {
    players: "1–2",
    minutes: "5–10",
    age: "8+",
    year: 2024,
    en: "Build a beautiful city view while keeping an eye on your rival’s skyline. A compact design for a short session at the table.",
    th: "ทางรถไฟสายใหม่กำลังมาถึง! ในฐานะผู้ว่าฯ คุณต้องสร้างวิวเมืองให้ผู้โดยสารชม พร้อมรักษาสมดุลกับเมืองฝั่งตรงข้าม ในเกมไพ่ 9 ใบนี้ แต่ละตาให้จั่วไพ่แล้วเลือกวางด้านทิวทัศน์สามครั้งและด้านเงื่อนไขคะแนนหนึ่งครั้ง เมื่อวางครบแล้วให้นับคะแนนจากสิ่งที่เห็นในฝั่งของตัวเอง คนที่ได้คะแนนสูงกว่าชนะ แต่ถ้าคะแนนห่างกันเกิน 5 แต้ม คนที่ได้คะแนนน้อยกว่าจะชนะทันที"
  }
}
