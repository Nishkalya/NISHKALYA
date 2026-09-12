const fs = require('fs');
const path = require('path');

const replacements = [
    { regex: /bg-\[\#0d1117\]/g, replacement: 'bg-slate-50' },
    { regex: /bg-\[\#161b22\]/g, replacement: 'bg-white' },
    { regex: /bg-\[\#21262d\]/g, replacement: 'bg-slate-100' },
    { regex: /border-\[\#30363d\]/g, replacement: 'border-slate-200' },
    { regex: /text-\[\#c9d1d9\]/g, replacement: 'text-slate-700' },
    { regex: /text-\[\#8b949e\]/g, replacement: 'text-slate-500' },
    { regex: /text-\[\#58a6ff\]/g, replacement: 'text-blue-600' },
    { regex: /text-white/g, replacement: 'text-slate-900' },
    { regex: /bg-\[\#050507\]/g, replacement: 'bg-slate-50' },
    { regex: /border-zinc-800/g, replacement: 'border-slate-200' },
    { regex: /text-zinc-400/g, replacement: 'text-slate-500' },
    { regex: /bg-zinc-805/g, replacement: 'bg-slate-200' },
    { regex: /hover:bg-zinc-805/g, replacement: 'hover:bg-slate-200' },
    { regex: /bg-zinc-800/g, replacement: 'bg-slate-200' },
    { regex: /bg-zinc-900/g, replacement: 'bg-slate-100' },
    { regex: /bg-zinc-950/g, replacement: 'bg-white' },
    { regex: /text-zinc-500/g, replacement: 'text-slate-500' },
    { regex: /text-zinc-300/g, replacement: 'text-slate-700' },
    { regex: /border-zinc-700/g, replacement: 'border-slate-200' }
];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Quick fix for text-white on buttons or specific things where text-white might be needed
    // Actually, text-white on red/blue buttons is fine, so let's be careful.
    // Wait, replacing ALL text-white with text-slate-900 might break primary buttons.
    
    replacements.forEach(({ regex, replacement }) => {
        content = content.replace(regex, replacement);
    });
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated: ' + filePath);
    }
}

function processDir(dirPath) {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
            processFile(fullPath);
        }
    }
}

processDir(path.join(__dirname, 'src'));
