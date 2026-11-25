import type { Locale } from "@/lib/locale"

export function PublicLinks({lang}:{lang:Locale}) {
 const thai=lang==="th"
 return <div className="actions">
 <a className="btn" href="https://www.facebook.com/roundtablegames">Round Table Games · Facebook</a>
 <a className="btn" href="https://www.facebook.com/profile.php?id=61578105683557">{thai?"อีกเพจของตอง":"Tong’s second page"} · Facebook</a>
 <a className="btn" href="https://www.tiktok.com/@readitmyself">อ่านเอง · TikTok</a>
 <a className="btn" href="https://www.readawrite.com/?action=user_page&user_id_publisher=4268109">{thai?"งานเขียน":"Writing"} · readAwrite</a>
 </div>
}

export function Resume({lang}:{lang:Locale}){
 const th=lang==="th"
 const roles=[
 {company:"Code Passion",date:th?"ก.พ. 2569 – ปัจจุบัน":"Feb 2026 – present",title:th?"นักพัฒนาแบ็กเอนด์":"Back-end Developer",
 body:th?"ออกแบบระบบประมวลผลและติดตามธุรกรรมการชำระเงิน รวมถึงฐานข้อมูลและ API สำหรับลูกค้าและทีมปฏิบัติการ พัฒนาการปกปิดข้อมูลส่วนบุคคล และจัดการคำขอพร้อมกันในระบบสมาชิกและการเข้าร่วมกิจกรรม":"Built payment processing and transaction monitoring, designed financial schemas and customer and back-office APIs. Developed personal-data masking for a fintech platform and handled concurrent event registrations in a membership system."},
 {company:"Touch Technologies",date:th?"พ.ค. 2566 – พ.ค. 2568":"May 2023 – May 2025",title:th?"นักพัฒนาแบ็กเอนด์":"Back-end Developer",
 body:th?"พัฒนา NestJS API บน Google Cloud ด้วย GitLab CI/CD รวมการตั้งค่าหลายโครงการไว้ใน PostgreSQL และสร้างหน้าจอ Retool สำหรับลูกค้า ร่วมพัฒนาตู้ห่วงใยและเขียนโปรแกรม Python สำหรับ Raspberry Pi":"Deployed NestJS APIs to Google Cloud through GitLab CI/CD, centralized project settings in PostgreSQL and delivered Retool interfaces. Helped build the Health Care Booth and wrote Python software for Raspberry Pi devices."},
 {company:"NEXPIE",date:th?"ก.ค. 2561 – พ.ย. 2565":"Jul 2018 – Nov 2022",title:th?"วิศวกรซอฟต์แวร์":"Software Engineer",
 body:th?"พัฒนาคลาวด์ IoT ที่ใช้ MQTT สร้างแดชบอร์ด Grafana จากข้อมูล PostgreSQL และหน้าเว็บด้วย Bootstrap และ Node.js พร้อมฝึกอบรมผู้ใช้งานและนักพัฒนา":"Developed an MQTT-based IoT cloud platform, built Grafana dashboards over PostgreSQL and created Bootstrap and Node.js interfaces. Trained customers and developers to use the platform."}
 ]
 return <section className="resume"><p>{th?"นักพัฒนาซอฟต์แวร์ที่มีประสบการณ์กว่า 7 ปีด้าน API ฐานข้อมูล และระบบคลาวด์ ปัจจุบันเน้นงานชำระเงิน ฟินเทค และความปลอดภัยของข้อมูล":"Software developer with 7+ years of experience building APIs, databases and cloud systems, most recently in payments and fintech."}</p>
 <h2>{th?"ประสบการณ์ทำงาน":"Work experience"}</h2>{roles.map(r=><article key={r.company}><small>{r.date}</small><h3>{r.company} · {r.title}</h3><p>{r.body}</p></article>)}
 <h2>{th?"ทักษะ":"Skills"}</h2><p>NestJS, Node.js, TypeScript, JavaScript, Python, Go, HTML5, CSS, MySQL, PostgreSQL, Supabase, Google Cloud, Git, Claude Code.</p><p>{th?"ภาษาไทยและอังกฤษ":"Languages: Thai and English."}</p>
 <h2>{th?"การศึกษา":"Education"}</h2><p>{th?"วศ.บ. วิศวกรรมซอฟต์แวร์ วิทยาลัยนานาชาติ สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง (2556–2561) เป็นผู้ช่วยสอนในการสอบปฏิบัติการวงจรดิจิทัล":"B.E. in Software Engineering, International College, King Mongkut’s Institute of Technology Ladkrabang (2013–2018). Teaching assistant for digital circuit lab examinations."}</p><p>{th?"แผนวิทย์–คณิต โรงเรียนเตรียมอุดมศึกษาพัฒนาการ (2549–2556)":"Science–Math program, Triam Udom Suksa Pattanakarn School (2006–2013)."}</p></section>
}
