# สรุปขั้นตอนการส่งโค้ดขึ้น GitHub และการ Build .exe / .dmg

หากคุณพบปัญหาเรื่องสิทธิ์การเข้าถึง (Permission) แนะนำให้ใช้ **Personal Access Token (PAT)** แทนรหัสผ่านปกติ หรือใช้ **GitHub Desktop** เพื่อความสะดวกครับ

### 1. ขั้นตอนที่ทำให้ Push ผ่าน (กรณี Force Push)
รันคำสั่งเหล่านี้เพื่อเปลี่ยนชื่อ Branch และส่งโค้ดขึ้นไปทับบน GitHub เพื่อเริ่มต้นระบบใหม่:

```bash
# 1. เปลี่ยนชื่อ Branch หลักให้เป็น main (มาตรฐานปัจจุบัน)
git branch -m master main

# 2. เชื่อมต่อกับ Repository (ถ้ายังไม่ได้ทำ)
git remote add origin https://github.com/tassanawatp-oss/breaktimecrazy.git

# 3. ส่งโค้ดขึ้นไปโดยบังคับ (Force Push) เพื่อเคลียร์ไฟล์เริ่มต้นบน GitHub
git push -u origin main --force
```

---

### 2. การจัดการเรื่องรหัสผ่าน (GitHub Token)
หาก Terminal ถามหารหัสผ่าน ให้ใช้ **Token** แทน ดังนี้:
1. ไปที่ GitHub [Settings > Developer Settings > Personal Access Tokens (classic)](https://github.com/settings/tokens)
2. สร้าง Token ใหม่ เลือกสิทธิ์ (Scopes): `repo` และ `workflow`
3. คัดลอก Token นั้นมาวางในช่อง Password ของ Terminal

---

### 3. วิธีดูผลลัพธ์และดาวน์โหลดไฟล์ .exe / .dmg
เมื่อรันคำสั่ง `push` สำเร็จแล้ว:
1. **ไปที่หน้าโปรเจกต์บน GitHub:** เข้าไปที่ `https://github.com/tassanawatp-oss/breaktimecrazy`
2. **ดูสถานะการ Build:** คลิกที่แท็บ **"Actions"** จะเห็นรายการที่ชื่อ "Publish Release" กำลังทำงาน (รูปนาฬิกาสีเหลือง)
3. **ดาวน์โหลดไฟล์:** เมื่อ Build เสร็จ (ประมาณ 10-15 นาที) ให้คลิกที่แท็บ **"Releases"** (อยู่ด้านขวาของหน้าหลัก) 
   - คุณจะเจอไฟล์ชื่อ `BreakTimeCrazy_0.1.0_x64_en-US.msi` (หรือ `.exe`) สำหรับ Windows
   - และไฟล์ `.dmg` สำหรับ Mac ครับ

---

### 4. คำสั่ง Build ในเครื่องตัวเอง (เฉพาะ Mac)
หากต้องการทดสอบ Build เฉพาะไฟล์ Mac ในเครื่องตัวเองเหมือนเดิม:
```bash
npm run tauri build
```
ไฟล์ที่ได้จะอยู่ที่: `src-tauri/target/release/bundle/dmg/`

## กรณีแก้ไขเสร็จ ใช้ Github

```bash
 git add .
 git commit -m "Fix tauri config and use universal target flag"
 git push
```