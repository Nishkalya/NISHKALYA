const fs = require('fs');
let code = fs.readFileSync('src/components/MarketingPage.tsx', 'utf-8');

// For Edit and Add Modals wrapper
code = code.replace(/className="relative w-full max-w-lg bg-\[#0d1117\] border border-\[#30363d\] rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 overflow-hidden max-h-\[90vh\] overflow-y-auto"/g, 
  'className={`relative w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 overflow-hidden max-h-[90vh] overflow-y-auto border ${portalTheme === \'white\' ? \'bg-white border-slate-200\' : \'bg-[#0d1117] border-[#30363d]\'}`}');

// For cancel buttons
code = code.replace(/className="px-5 py-2\.5 bg-\[#21262d\] border border-\[#30363d\] text-zinc-400 hover:text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-colors"/g,
  'className={`px-5 py-2.5 border rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-colors ${portalTheme === \'white\' ? \'bg-white hover:bg-slate-100 border-slate-300 text-slate-600\' : \'bg-[#21262d] border-[#30363d] text-zinc-400 hover:text-white\'}`}');

// For modal titles
code = code.replace(/<h3 className="text-base font-bold text-white tracking-tight">/g,
  '<h3 className={`text-base font-bold tracking-tight ${portalTheme === \'white\' ? \'text-slate-900\' : \'text-white\'}`}>');

// For general inputs (many variants)
const inputRegex = /className="w-full bg-\[#161b22\] border border-zinc-800 rounded-xl (px-4 py-2\.5|p-4) text-xs text-(white|\[#8b949e\]) outline-none focus:border-\[#58a6ff\]\/50( font-mono)?( font-sans font-bold)?( text-zinc-300)?"/g;

code = code.replace(inputRegex, (match, p1, p2, p3, p4, p5) => {
  const padding = p1;
  const isMono = p3 ? ' font-mono' : '';
  const isSansBold = p4 ? ' font-sans font-bold' : '';
  return `className={\`w-full border rounded-xl ${padding} text-xs outline-none focus:border-sky-500/50 transition-colors${isMono}${isSansBold} \${portalTheme === 'white' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#161b22] border-zinc-800 text-white'}\`}`;
});

// For disabled inputs
const disabledInputRegex = /className="w-full bg-\[#161b22\] border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-500 outline-none focus:border-\[#58a6ff\]\/50 font-mono cursor-not-allowed opacity-70"/g;
code = code.replace(disabledInputRegex,
  'className={`w-full border rounded-xl px-4 py-2.5 text-xs outline-none font-mono cursor-not-allowed opacity-70 transition-colors ${portalTheme === \'white\' ? \'bg-slate-100 border-slate-200 text-slate-500\' : \'bg-[#161b22] border-zinc-800 text-zinc-500\'}`}');

fs.writeFileSync('src/components/MarketingPage.tsx', code);
console.log("Done");
