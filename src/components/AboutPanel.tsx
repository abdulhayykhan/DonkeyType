import { HelpCircle, Terminal, HelpCircle as Volume, Cpu, RefreshCw, Layers } from 'lucide-react';

export default function AboutPanel() {
  return (
    <div id="about-panel" className="max-w-2xl mx-auto space-y-8 py-4 animate-fadeIn">
      {/* Introduction Card */}
      <div className="bg-sub-theme/5 border border-sub-theme/10 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-main-theme/5 rounded-full filter blur-2xl -mr-16 -mt-16 pointer-events-none" />
        
        <h2 className="font-sans text-2xl font-bold text-main-theme mb-3 flex items-center gap-2">
          <Layers className="w-6 h-6" /> Why "DonkeyType"?
        </h2>
        <p className="text-sm text-text-theme leading-relaxed font-sans mb-4">
          Most typing tests focus purely on blinding, chaotic speed. On **DonkeyType**, we honor the donkey's noble qualities: 
          <strong> supreme patience, cautious pacing, and unwavering persistence</strong>. 
        </p>
        <p className="text-sm text-sub-theme leading-relaxed font-sans">
          A donkey doesn't run mindlessly into a ditch; it carefully maps out each step. Similarly, the fastest typist is not the one who mashes their keyboard, but the one who builds flawless muscle memory through deliberate, error-free keystrokes. 
          <em> Stop stumbling over mistakes—slowing down to be accurate will make you faster in the end.</em>
        </p>
      </div>

      {/* Grid of features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Metric breakdown */}
        <div className="bg-sub-theme/5 border border-sub-theme/10 rounded-2xl p-6">
          <h3 className="font-sans text-base font-bold text-main-theme mb-3 flex items-center gap-2">
            <Terminal className="w-4.5 h-4.5 text-main-theme" /> How Metrics are Calculated
          </h3>
          <ul className="space-y-3.5 text-xs text-sub-theme font-mono">
            <li>
              <span className="text-text-theme font-semibold block mb-0.5">WPM (Words Per Minute)</span>
              Calculated as <code className="bg-sub-theme/10 px-1 py-0.5 rounded text-main-theme">(Correct Characters / 5) / (Seconds / 60)</code>. This is the global standard.
            </li>
            <li>
              <span className="text-text-theme font-semibold block mb-0.5">Raw WPM</span>
              Calculated exactly like WPM but includes <em>all</em> typed characters, including typos and wrong spacebars.
            </li>
            <li>
              <span className="text-text-theme font-semibold block mb-0.5">Accuracy</span>
              The percentage of correct keys out of the total characters submitted: <code className="bg-sub-theme/10 px-1 py-0.5 rounded text-main-theme">(Correct Keys / Total Keys) * 100</code>.
            </li>
          </ul>
        </div>

        {/* Technical Highlights */}
        <div className="bg-sub-theme/5 border border-sub-theme/10 rounded-2xl p-6">
          <h3 className="font-sans text-base font-bold text-main-theme mb-3 flex items-center gap-2">
            <Cpu className="w-4.5 h-4.5 text-main-theme" /> Offline Audio Synthesis
          </h3>
          <p className="text-xs text-sub-theme leading-relaxed font-sans mb-4">
            DonkeyType uses the browser's native **Web Audio API** to synthesize key noises on the fly. We build sound waves, bandpass filters, and pitch decay envelopes inside your browser. No files are downloaded, making it completely lightweight.
          </p>

          <h3 className="font-sans text-base font-bold text-main-theme mb-2 flex items-center gap-2">
            <RefreshCw className="w-4.5 h-4.5 text-main-theme" /> Shortcuts & Customizations
          </h3>
          <p className="text-xs text-sub-theme leading-relaxed font-sans">
            Hit <kbd className="bg-sub-theme/15 border border-sub-theme/25 px-1.5 py-0.5 rounded font-mono text-main-theme text-[10px]">Tab</kbd> + <kbd className="bg-sub-theme/15 border border-sub-theme/25 px-1.5 py-0.5 rounded font-mono text-main-theme text-[10px]">Enter</kbd> or click the reset button at any point during a test to instantly restart a fresh run. Choose from 10 semantic custom color themes to suit your eye safety.
          </p>
        </div>
      </div>

      {/* Useful Tips */}
      <div className="bg-main-theme/5 border border-main-theme/10 rounded-2xl p-6">
        <h3 className="font-sans text-sm font-bold text-main-theme mb-2 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4" /> Helpful Pro-Tips for Master Typists
        </h3>
        <ul className="list-disc list-inside space-y-2 text-xs text-text-theme leading-relaxed font-sans">
          <li><strong>Keep your wrists raised:</strong> Do not rest your palms or wrists on the desk; hover them slightly to prevent repetitive strain and increase reach.</li>
          <li><strong>Use the correct finger:</strong> Avoid relying too much on single fingers. Every key on your keyboard has a designated finger. Trust the home row!</li>
          <li><strong>Focus on the upcoming word:</strong> Don't watch the letter you are typing. Keep your eyes focused one or two words ahead of your caret to build continuous rhythm.</li>
          <li><strong>The 100% Accuracy challenge:</strong> Try typing at 50% speed but hitting every single character perfectly. You'll find your overall speed catches up in no time.</li>
        </ul>
      </div>
    </div>
  );
}
