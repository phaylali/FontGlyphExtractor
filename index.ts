import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import * as opentype from 'opentype.js';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const app = new Hono();

app.use('/static/*', serveStatic({ root: './' }));

app.get('/', (c) => {
    return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>FontGlyphExtractor - Premium Font Tool</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
        <style>
            :root {
                --gold: #C2B067;
                --gold-muted: rgba(194, 176, 103, 0.6);
                --gold-low: rgba(194, 176, 103, 0.1);
                --oled-bg: #000000;
                --surface: #0a0a0a;
                --text: #ffffff;
                --text-muted: rgba(255, 255, 255, 0.7);
            }
            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }
            body {
                font-family: 'Inter', sans-serif;
                background-color: var(--oled-bg);
                color: var(--text);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                overflow: hidden;
            }
            /* Background Glow */
            body::before {
                content: '';
                position: absolute;
                width: 300px;
                height: 300px;
                background: radial-gradient(circle, var(--gold-low) 0%, transparent 70%);
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: -1;
                pointer-events: none;
            }
            .container {
                background: var(--surface);
                padding: 3rem;
                border-radius: 4px;
                border: 1px solid var(--gold-muted);
                width: 100%;
                max-width: 500px;
                text-align: center;
                box-shadow: 0 0 40px rgba(0, 0, 0, 1);
                position: relative;
            }
            h1 {
                font-family: 'Cinzel', serif;
                color: var(--gold);
                font-size: 2rem;
                margin-bottom: 0.5rem;
                letter-spacing: 2px;
                text-transform: uppercase;
            }
            .subtitle {
                font-size: 0.9rem;
                color: var(--text-muted);
                margin-bottom: 2.5rem;
                font-weight: 300;
                text-transform: lowercase;
                letter-spacing: 1px;
            }
            .upload-area {
                border: 1px dashed var(--gold-muted);
                padding: 3rem 1rem;
                cursor: pointer;
                transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                margin-bottom: 2rem;
                background: rgba(194, 176, 103, 0.02);
            }
            .upload-area:hover {
                border-color: var(--gold);
                background: var(--gold-low);
            }
            .upload-area svg {
                width: 40px;
                height: 40px;
                fill: var(--gold);
                margin-bottom: 1rem;
                opacity: 0.8;
            }
            #file-label {
                font-size: 0.85rem;
                color: var(--gold);
                letter-spacing: 0.5px;
            }
            input[type="file"] {
                display: none;
            }
            button {
                background: transparent;
                color: var(--gold);
                border: 1px solid var(--gold);
                padding: 1rem;
                font-family: 'Cinzel', serif;
                font-size: 0.9rem;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s;
                width: 100%;
                text-transform: uppercase;
                letter-spacing: 2px;
            }
            button:hover {
                background: var(--gold);
                color: var(--oled-bg);
            }
            button:disabled {
                opacity: 0.3;
                cursor: not-allowed;
            }
            #status {
                margin-top: 2rem;
                font-size: 0.8rem;
                padding: 1rem;
                border: 1px solid var(--gold-low);
                color: var(--gold-muted);
                display: none;
                animation: fadeIn 0.5s ease-out;
                word-break: break-all;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(5px); }
                to { opacity: 1; transform: translateY(0); }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Extractor</h1>
            <p class="subtitle">Convert individual font paths to svg vectors</p>
            <form id="upload-form">
                <label class="upload-area" for="font-file">
                    <svg viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>
                    <span id="file-label">SELECT FONT FILE</span>
                    <input type="file" id="font-file" name="font" accept=".otf,.ttf" required>
                </label>
                <button type="submit" id="submit-btn">Extract Glyphs</button>
            </form>
            <div id="status"></div>
        </div>

        <script>
            const form = document.getElementById('upload-form');
            const fileInput = document.getElementById('font-file');
            const fileLabel = document.getElementById('file-label');
            const status = document.getElementById('status');
            const btn = document.getElementById('submit-btn');

            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    fileLabel.textContent = e.target.files[0].name.toUpperCase();
                }
            });

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData();
                formData.append('font', fileInput.files[0]);

                status.style.display = 'block';
                status.textContent = 'INITIATING EXTRACTION...';
                status.style.borderColor = 'var(--gold-low)';
                btn.disabled = true;

                try {
                    const response = await fetch('/extract', {
                        method: 'POST',
                        body: formData
                    });
                    const result = await response.json();
                    if (result.success) {
                        status.innerHTML = \`COMPLETED: \${result.count} GLYPHS EXTRACTED TO<br><span style="color:var(--gold)">\${result.path}</span>\`;
                        status.style.borderColor = 'var(--gold-muted)';
                    } else {
                        status.textContent = 'ERROR: ' + result.error.toUpperCase();
                        status.style.borderColor = '#ff444455';
                    }
                } catch (err) {
                    status.textContent = 'ERROR: ' + err.message.toUpperCase();
                    status.style.borderColor = '#ff444455';
                } finally {
                    btn.disabled = false;
                }
            });
        </script>
    </body>
    </html>
  `);
});

app.post('/extract', async (c) => {
    try {
        const body = await c.req.parseBody();
        const fontFile = body['font'] as File;

        if (!fontFile) {
            return c.json({ success: false, error: 'No file uploaded' }, 400);
        }

        const buffer = await fontFile.arrayBuffer();

        let font;
        try {
            font = opentype.parse(buffer);
        } catch (e: any) {
            return c.json({ success: false, error: 'Failed to parse font: ' + e.message }, 400);
        }

        // Dynamic folder naming: FontNameGlyphs
        const fontFileParts = fontFile.name.split('.');
        const fontBaseName = (fontFileParts[0] || 'UnknownFont').replace(/\s+/g, '');
        const folderName = `${fontBaseName}Glyphs`;
        const outputDir = join(import.meta.dir, 'output', folderName);
        await mkdir(outputDir, { recursive: true });

        let count = 0;

        for (let i = 0; i < font.glyphs.length; i++) {
            const glyph = font.glyphs.get(i);

            let fileName = '';
            if (glyph.unicode !== undefined) {
                fileName = glyph.unicode.toString(16).toUpperCase().padStart(4, '0');
            } else if (glyph.name) {
                fileName = glyph.name;
            } else {
                fileName = `glyph_${i}`;
            }

            const ascender = font.ascender ?? 0;
            const descender = font.descender ?? 0;
            const unitsPerEm = font.unitsPerEm ?? 1000;
            const advanceWidth = glyph.advanceWidth ?? unitsPerEm;

            const path = glyph.getPath(0, ascender, unitsPerEm);
            const svgPathData = path.toSVG(2);

            const width = advanceWidth;
            const height = ascender - descender;

            const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
  ${svgPathData}
</svg>`;

            const filePath = join(outputDir, `${fileName}.svg`);
            await writeFile(filePath, svg);
            count++;
        }

        return c.json({
            success: true,
            count: count,
            path: `output/${folderName}/`
        });

    } catch (error: any) {
        console.error(error);
        return c.json({ success: false, error: error.message }, 500);
    }
});

export default {
    port: 3000,
    fetch: app.fetch,
};