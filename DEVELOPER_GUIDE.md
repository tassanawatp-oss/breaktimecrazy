# BreakTimeCrazy - Developer Documentation

ยินดีต้อนรับสู่คู่มือการพัฒนาสำหรับโปรเจกต์ **BreakTimeCrazy** แอปพลิเคชัน Pomodoro/Break Timer ที่พัฒนาด้วย Tauri 2.0, React, และ Rust

## 🏗️ Tech Stack
- **Frontend:** React 19 (TypeScript), Vite, TailwindCSS
- **Backend:** Rust (Tauri 2.0 framework)
- **State Management:** Rust `AppState` (managed by Tauri `State`)
- **CI/CD:** GitHub Actions (Automated multi-platform builds)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js:** LTS version (Recommended 20+)
- **Rust:** Stable toolchain via [rustup](https://rustup.rs/)
- **Tauri Prerequisites:** ทำตามขั้นตอนใน [Tauri Documentation](https://tauri.app/v2/guides/getting-started/prerequisites/) ตามระบบปฏิบัติการที่ใช้

### Installation
```bash
# Install frontend dependencies
npm install
```

### Development Mode
รันแอปในโหมดพัฒนา (Hot Reload ทั้ง Frontend และ Rust):
```bash
npm run tauri dev
```

---

## 📂 Project Structure
```text
├── src/                # Frontend (React + TypeScript)
│   ├── components/     # UI Components (ControlPanel, BreakOverlay)
│   └── main.tsx        # Entry point
├── src-tauri/          # Backend (Rust)
│   ├── src/
│   │   ├── main.rs     # Entry point & Command handlers
│   │   ├── lib.rs      # Library definition & State setup
│   │   ├── state.rs    # Timer logic & AppState definition
│   │   └── window_manager.rs # Logic for managing windows
│   └── tauri.conf.json # Configuration (Icons, permissions, etc.)
└── .github/workflows/  # CI/CD (GitHub Actions)
```

---

## 🛠️ Key Concepts & Commands

### Rust - Frontend Communication
แอปพลิเคชันนี้ใช้การเรียกคำสั่งผ่าน `invoke` ของ Tauri:
- `start_timer`: เริ่มนับถอยหลังช่วงทำงาน (Work period)
- `stop_timer`: ยกเลิกและ Reset เวลา
- `start_break`: เริ่มช่วงพัก (Break period) ทันที

### Automated Build (CI/CD)
เมื่อทำการ `git push` ไปที่ branch `main` ระบบ GitHub Actions จะทำงานอัตโนมัติ:
- **Windows:** สร้างไฟล์ `.msi` (x64)
- **macOS:** สร้างไฟล์ `.dmg` แบบ **Universal Binary** (รัน Native ได้ทั้ง Intel และ Apple Silicon โดยไม่ต้องใช้ Rosetta 2)

---

## 🎨 Branding & Assets
- **Icons:** ไฟล์ไอคอนหลักเก็บไว้ที่ `src-tauri/icons/app-icon.svg`
- **Icon Generation:** หากมีการแก้ไขไฟล์ SVG ให้รันคำสั่ง:
  ```bash
  npx tauri icon src-tauri/icons/app-icon.svg
  ```

---

## 📦 Building for Production

### Build Mac Universal (Native ARM + Intel) ในเครื่องตัวเอง:
```bash
# ต้องลง target เพิ่มก่อน (ครั้งแรกครั้งเดียว)
rustup target add aarch64-apple-darwin x86_64-apple-darwin

# รันคำสั่ง Build
npm run tauri build -- --target universal-apple-darwin
```

### Build สำหรับ Windows (ต้องทำบนเครื่อง Windows):
```bash
npm run tauri build
```
*แนะนำให้ใช้ GitHub Actions ในการ Build สำหรับหลาย OS เพื่อความสะดวก*

---

## 🧪 Testing
- **Frontend Tests:** ใช้ Vitest และ React Testing Library
  ```bash
  npm run test
  ```

---

## 📝 Troubleshooting & Tips
- **Window Size:** ขนาดหน้าต่างเริ่มต้นตั้งค่าไว้ที่ `320x540` ใน `tauri.conf.json`
- **Transparent Window:** แอปนี้ใช้หน้าต่างแบบโปร่งแสง (Transparent) และ Always on Top
- **GitHub Workflow:** หากต้องการอัปเกรด Node.js ใน CI ให้แก้ไขที่ไฟล์ `.github/workflows/publish.yml`

---
*Created by Gemini CLI Agent - 2026-04-22*
