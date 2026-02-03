# FontGlyphExtractor 🖋️✨

**FontGlyphExtractor** is a high-performance, premium web application built to extract individual vector glyphs from font files. It is designed for designers and typographers who need raw SVG data for open-source font projects, iconography, or vector manipulation.

Built with **Bun** and **opentype.js**, it features a stunning **OLED-optimized interface** with gold accents, providing a smooth and luxurious user experience.

---

## ✨ Features

- **Full Glyph Extraction**: Unlike minifiers that only keep specific characters, this tool iterates through every single glyph index in the font.
- **Unicode-Priority Naming**: Automatically names files by their Unicode hex code (e.g., `0041.svg`). Falls back to internal glyph names for non-encoded characters.
- **Precision SVGs**: Generates paths accurately scaled to the font's `unitsPerEm`.
- **Dynamic Organization**: Automatically creates font-specific folders (e.g., `NotoSansGlyphs/`) to keep your library organized.
- **Luxurious OLED UI**: A sleek, minimal, and high-contrast interface inspired by premium "Moroccan Luxury" aesthetics.

---

## 🛠 Tech Stack

- **Runtime**: [Bun](https://bun.sh/)
- **Server**: [Hono](https://hono.dev/)
- **Engine**: [opentype.js](https://opentype.js.org/)
- **Typography**: Cinzel (Headlines) & Inter (Body)
- **Styling**: Vanilla CSS (OLED & Gold Theme)

---

## 🚀 Getting Started

### Prerequisites

You must have **Bun** installed on your system.

```bash
curl -fsSL https://bun.sh/install | bash
```

### Installation

1. Navigate to the project directory:
   ```bash
   cd FontGlyphExtractor
   ```
2. Install dependencies:
   ```bash
   bun install
   ```
3. Start the development server:
   ```bash
   bun run dev
   ```

### Usage

1. Open `http://localhost:3000` in your browser.
2. Drag or select your font file (`.otf` or `.ttf`).
3. Click **EXTRACT EVERY GLYPH**.
4. Your SVGs will be generated in the `output/[FontName]Glyphs/` directory.

---

## 📜 Philosophy

This tool is dedicated to the **Open Source** movement. By making glyph extraction effortless, we empower designers to analyze, remix, and create new multilingual typefaces that bridge cultures and scripts.

---

*Part of the Omniversify Ecosystem — Connecting worlds through design.*
