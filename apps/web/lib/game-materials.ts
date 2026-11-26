type Copy = { en: string; th: string }
type MaterialFile = { href: string; label: Copy }
type RuleSection = { heading: Copy; text: Copy }
export type GameMaterials = {
  pdf?: MaterialFile
  sections?: RuleSection[]
  gallery?: MaterialFile[]
  printFiles?: MaterialFile[]
}
const copy = (en: string, th: string): Copy => ({ en, th })
const rule = (en: string, th: string, body: string, translation: string): RuleSection =>
  ({ heading: copy(en, th), text: copy(body, translation) })

export const materials: Partial<Record<string, GameMaterials>> = {
  "city-line": {
    pdf: { href: "/materials/city-line/rules-en.pdf", label: copy("English rule sheets (PDF)", "กติกาภาษาอังกฤษ (PDF)") },
    sections: [
      rule("Setup", "เตรียมเกม", "Shuffle the nine cards and place the deck cityscape side up. Flip the top card to its scoring side. Give it a random orientation so one scoring box faces each player. Whoever most recently rode a train goes first.", "สับการ์ดทั้งเก้าใบแล้ววางกองให้ด้านวิวเมืองหงายขึ้น พลิกใบบนสุดเป็นด้านคะแนน สุ่มทิศทางให้ช่องคะแนนหันเข้าหาผู้เล่นคนละช่อง คนที่ขึ้นรถไฟล่าสุดเริ่มก่อน"),
      rule("Taking a turn", "ในตาของคุณ", "Draw one card and place it between the players. You choose which end faces you. Over your four turns, place three cards horizontally with the cityscape showing and one vertically with the scoring side showing. You choose when to play your scoring card.", "จั่วการ์ดหนึ่งใบแล้ววางระหว่างผู้เล่น เลือกได้ว่าจะหันปลายไหนเข้าหาตัว ตลอดสี่ตาของคุณ ให้วางด้านวิวเมืองแนวนอนสามครั้ง และด้านคะแนนแนวตั้งหนึ่งครั้ง โดยเลือกเองว่าจะวางด้านคะแนนในตาใด"),
      rule("Scoring and winning", "นับคะแนนและตัดสินผู้ชนะ", "When the deck runs out, there are six cityscapes and three scoring cards. Count one point for each flower facing you, then score the conditions in the boxes facing you. If the scores differ by five or less, the higher score wins. If the difference exceeds five, the lower score wins. The first player wins a tie.", "เมื่อกองจั่วหมด จะมีวิวเมืองหกใบและการ์ดคะแนนสามใบ นับดอกไม้ที่หันเข้าหาคุณดอกละหนึ่งคะแนน แล้วคิดคะแนนตามเงื่อนไขในช่องที่หันเข้าหาคุณ ถ้าคะแนนต่างกันไม่เกินห้า คนที่ได้มากกว่าชนะ ถ้าต่างกันเกินห้า คนที่ได้น้อยกว่าชนะ ถ้าเสมอ คนที่เริ่มก่อนชนะ"),
      rule("Reading the symbols", "สัญลักษณ์", "The plus sign means a set or pair. The pictures show a girl, a boy, a dog, a duck and a cat. The area colours are green for grass, yellow for sand and blue for water. The second sheet in the gallery illustrates each symbol.", "เครื่องหมายบวกหมายถึงชุดหรือคู่ รูปตัวละครคือเด็กหญิง เด็กชาย สุนัข เป็ด และแมว พื้นที่สีเขียวคือหญ้า สีเหลืองคือทราย และสีฟ้าคือน้ำ ดูภาพสัญลักษณ์ได้ในแผ่นกติกาที่สอง"),
      rule("Combining decks", "การรวมสำรับ", "Shuffle the City Line decks together and deal nine cards to form the game deck. Set the rest aside and play as usual. Use the symbols on the scoring side to separate the decks afterwards.", "สับสำรับ City Line ที่ต้องการรวมเข้าด้วยกัน แบ่งเก้าใบมาเล่นตามกติกาปกติและเก็บใบที่เหลือ หลังเล่นให้แยกสำรับตามสัญลักษณ์ด้านคะแนน"),
      rule("Two to Win", "ชนะสองเกม", "The winner takes any scoring card as a reward. Set up again without that card. In the next game, a player holding a reward may no longer place a card scoring side up. Win two games to win the match.", "ผู้ชนะเลือกการ์ดคะแนนหนึ่งใบเป็นรางวัล แล้วเริ่มเกมใหม่โดยไม่นำใบนั้นกลับมา ผู้เล่นที่มีรางวัลจะวางการ์ดด้านคะแนนไม่ได้อีก ชนะสองเกมเพื่อชนะการแข่งขัน"),
      rule("Blind Spot", "จุดบอด", "Once you flip a card to its scoring side, you must play it on that side.", "เมื่อพลิกการ์ดดูด้านคะแนนแล้ว ต้องวางด้านคะแนนขึ้น"),
      rule("Less Score, More Views", "คะแนนน้อย วิวมาก", "Start with a cityscape instead of a scoring card. The finished line will have seven cityscapes and two scoring cards.", "เริ่มเกมด้วยด้านวิวเมืองแทนด้านคะแนน เมื่อจบเกมจะมีวิวเมืองเจ็ดใบและการ์ดคะแนนสองใบ"),
      rule("Solo mode", "เล่นคนเดียว", "Set up as usual. Play all the cards yourself, with one scoring card forced immediately after the third cityscape. Aim for the smallest possible difference between the scores on the two sides.", "เตรียมเกมตามปกติ คุณเป็นคนวางการ์ดทั้งหมด โดยต้องวางการ์ดคะแนนหนึ่งใบทันทีหลังวางวิวเมืองใบที่สาม พยายามทำให้คะแนนทั้งสองฝั่งต่างกันน้อยที่สุด"),
      rule("Adjusting difficulty", "ปรับความยาก", "For an easier game, raise the allowed score difference from five to ten, or agree on another number. A larger difference makes the game easier.", "หากต้องการให้ง่ายขึ้น ให้เพิ่มเกณฑ์ผลต่างจากห้าเป็นสิบ หรือเลือกตัวเลขอื่น ยิ่งกำหนดผลต่างมาก เกมยิ่งง่าย")
    ],
    gallery: [
      { href: "/materials/city-line/sheet-1.webp", label: copy("Cover, advanced variants and solo rules", "ปก กติกาเสริม และวิธีเล่นคนเดียว") },
      { href: "/materials/city-line/sheet-2.webp", label: copy("Setup, card placement, scoring and icon guide", "การเตรียมเกม การวางการ์ด การนับคะแนน และสัญลักษณ์") }
    ]
  },
  "neko-knows": {
    pdf: { href: "/materials/neko-knows/rules-en.pdf", label: copy("English prototype rulebook (PDF)", "กติกาต้นแบบภาษาอังกฤษ (PDF)") }
  }
}
