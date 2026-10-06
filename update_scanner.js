const fs = require('fs');
let code = fs.readFileSync('src/components/dashboard/threat-scanner.tsx', 'utf8');

code = code.replace(
  `const [payload, setPayload] = useState('')`,
  `const [payload, setPayload] = useState('')\n  const [errorHighlight, setErrorHighlight] = useState(false)\n  const [toastMsg, setToastMsg] = useState('')`
);

code = code.replace(
  `const handleAnalyzeClick = () => {`,
  `const handleAnalyzeClick = () => {
    if (payload.trim().length === 0) {
      setErrorHighlight(true)
      setToastMsg('Enter a message, phone number, or URL to analyze.')
      setTimeout(() => { setErrorHighlight(false); setToastMsg('') }, 3000)
      return
    }
`
);

code = code.replace(
  `className="relative min-h-[160px] bg-[#0A0F1A] border-slate-700/80 text-slate-100 font-mono focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan resize-none p-6 text-sm tracking-wide rounded-xl shadow-inner placeholder:text-slate-600 placeholder:font-sans"`,
  `className={\`relative min-h-[160px] bg-[#0A0F1A] text-slate-100 font-mono focus:ring-1 resize-none p-6 text-sm tracking-wide rounded-xl shadow-inner placeholder:text-slate-600 placeholder:font-sans transition-colors \${errorHighlight ? 'border-amber-500 ring-1 ring-amber-500 focus:border-amber-500 focus:ring-amber-500' : 'border-slate-700/80 focus:border-cyber-cyan focus:ring-cyber-cyan'}\`}`
);

code = code.replace(
  `disabled={!payload.trim() || isScanning}`,
  `disabled={isScanning}`
);

// Add the toast renderer
code = code.replace(
  `{isScanning && (`,
  `<AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-4 right-4 z-50 bg-amber-500/10 border border-amber-500 text-amber-500 text-xs font-bold px-4 py-2 rounded-lg backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
      {isScanning && (`
);

fs.writeFileSync('src/components/dashboard/threat-scanner.tsx', code);
