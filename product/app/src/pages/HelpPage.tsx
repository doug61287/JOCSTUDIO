/**
 * Help Page - In-app user guide
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';

type Section = 'quick-start' | 'tools' | 'translation' | 'assistant' | 'shortcuts' | 'tips';

export function HelpPage() {
  const [activeSection, setActiveSection] = useState<Section>('quick-start');

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📚</span>
            <div>
              <h1 className="text-xl font-bold">Help & Guides</h1>
              <p className="text-sm text-zinc-500">Learn how to use JOCHero</p>
            </div>
          </div>
          
          <Link 
            to="/"
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
          >
            ← Back to App
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 flex gap-8">
        {/* Sidebar */}
        <nav className="w-48 shrink-0">
          <div className="sticky top-24 space-y-1">
            {[
              { id: 'quick-start', icon: '🚀', label: 'Quick Start' },
              { id: 'tools', icon: '📏', label: 'Measurement Tools' },
              { id: 'translation', icon: '🔮', label: 'Translation Machine' },
              { id: 'assistant', icon: '🤖', label: 'Guided Assistant' },
              { id: 'shortcuts', icon: '⌨️', label: 'Keyboard Shortcuts' },
              { id: 'tips', icon: '💡', label: 'Tips & Tricks' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as Section)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                  activeSection === item.id
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {activeSection === 'quick-start' && <QuickStartSection />}
          {activeSection === 'tools' && <ToolsSection />}
          {activeSection === 'translation' && <TranslationSection />}
          {activeSection === 'assistant' && <AssistantSection />}
          {activeSection === 'shortcuts' && <ShortcutsSection />}
          {activeSection === 'tips' && <TipsSection />}
        </main>
      </div>
    </div>
  );
}

function QuickStartSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">🚀 Quick Start</h2>
        <p className="text-zinc-400">Get from PDF to JOC proposal in 5 minutes.</p>
      </div>

      <div className="space-y-6">
        <StepCard
          number={1}
          title="Upload Your Drawing"
          time="30 seconds"
          description="Drag & drop your PDF or click the Upload button."
        />
        
        <StepCard
          number={2}
          title="Calibrate Scale"
          time="30 seconds"
          description="Click 📐 Calibrate, draw on a known dimension, enter the real length."
        />
        
        <StepCard
          number={3}
          title="Take Measurements"
          time="2-3 minutes"
          description="Use Line (L), Count (C), or Area (A) tools to measure your takeoff items."
        />
        
        <StepCard
          number={4}
          title="Assign JOC Items"
          time="1-2 minutes"
          description="Click '🤖 Guide Me' on each measurement to find the right JOC line item."
        />
        
        <StepCard
          number={5}
          title="Export Proposal"
          time="30 seconds"
          description="Set your coefficient, review the summary, and click Export."
        />
      </div>
    </div>
  );
}

function ToolsSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">📏 Measurement Tools</h2>
        <p className="text-zinc-400">Four tools for different measurement types.</p>
      </div>

      <div className="grid gap-4">
        <ToolCard
          icon="📏"
          name="Line Tool"
          shortcut="L"
          unit="LF (Linear Feet)"
          description="For walls, pipes, conduit, and any linear measurement."
          howTo="Click start point → Click end point"
        />
        
        <ToolCard
          icon="🔢"
          name="Count Tool"
          shortcut="C"
          unit="EA (Each)"
          description="For fixtures, outlets, sprinkler heads, and countable items."
          howTo="Click each item to add +1"
        />
        
        <ToolCard
          icon="⬛"
          name="Area Tool"
          shortcut="A"
          unit="SF (Square Feet)"
          description="For flooring, painting, ceilings, and area-based items."
          howTo="Click corners to draw polygon → Double-click to close"
        />
        
        <ToolCard
          icon="🏠"
          name="Space Tool"
          shortcut="S"
          unit="SF + LF"
          description="For rooms with finishes. Calculates both area AND perimeter."
          howTo="Draw room boundary → Enter room name"
        />
      </div>
    </div>
  );
}

function TranslationSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">🔮 Translation Machine</h2>
        <p className="text-zinc-400">Convert plain English to JOC line items. Access via the 🔮 button in the header.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span>✨</span> Translate Mode
          </h3>
          <p className="text-sm text-zinc-400 mb-4">
            Describe work in plain English. The AI extracts keywords, detects quantities, and finds matching items.
          </p>
          <div className="bg-zinc-800 rounded-lg p-4 font-mono text-sm">
            <div className="text-zinc-500">Input:</div>
            <div className="text-white">"install 10 sprinkler heads in corridor"</div>
            <div className="mt-3 text-zinc-500">AI extracts:</div>
            <div className="text-amber-400">Keywords: sprinkler, heads, corridor</div>
            <div className="text-green-400">Quantity: 10</div>
            <div className="text-blue-400">Division: 21 (Fire Suppression)</div>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span>🔍</span> Search Mode
          </h3>
          <p className="text-sm text-zinc-400 mb-4">
            Search by task code prefix or keywords. Great when you know what you're looking for.
          </p>
          <div className="flex gap-4 text-sm">
            <div className="bg-zinc-800 rounded-lg px-3 py-2">
              <span className="text-zinc-500">Code:</span> <span className="text-white">21131113</span>
            </div>
            <div className="bg-zinc-800 rounded-lg px-3 py-2">
              <span className="text-zinc-500">Keyword:</span> <span className="text-white">5/8 drywall</span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span>📁</span> Browse Mode
          </h3>
          <p className="text-sm text-zinc-400 mb-4">
            Explore the catalogue by CSI division. All 65,331 NYC H+H line items organized by category.
          </p>
          <div className="flex flex-wrap gap-2">
            {['01 General', '09 Finishes', '21 Fire', '22 Plumbing', '23 HVAC', '26 Electrical'].map(div => (
              <span key={div} className="px-3 py-1 bg-zinc-800 rounded-lg text-sm">{div}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AssistantSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">🤖 Guided Estimation Assistant</h2>
        <p className="text-zinc-400">Find the exact JOC item through a quick conversation. Click "Guide Me" on any measurement.</p>
      </div>

      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <h3 className="font-semibold mb-4">How It Works</h3>
        <div className="space-y-4">
          <ChatBubble type="assistant" message="What are you measuring?" />
          <div className="flex gap-2 ml-8">
            <span className="px-3 py-1.5 bg-zinc-700 rounded-lg text-sm">🧱 Wall</span>
            <span className="px-3 py-1.5 bg-zinc-700 rounded-lg text-sm">⬜ Ceiling</span>
            <span className="px-3 py-1.5 bg-zinc-700 rounded-lg text-sm">🟫 Floor</span>
          </div>
          <ChatBubble type="user" message="🧱 Wall" />
          <ChatBubble type="assistant" message="What type of wall work?" />
          <div className="flex gap-2 ml-8">
            <span className="px-3 py-1.5 bg-zinc-700 rounded-lg text-sm">📋 Drywall</span>
            <span className="px-3 py-1.5 bg-zinc-700 rounded-lg text-sm">🔨 Demo</span>
          </div>
          <ChatBubble type="user" message="📋 Drywall" />
          <ChatBubble type="assistant" message="Found 3 matching items:" />
          <div className="ml-8 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm">
            <div className="text-amber-500 font-mono">09290513-0045</div>
            <div>5/8" Type X Gypsum Board</div>
            <div className="text-green-400">$2.14/SF</div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <h3 className="font-semibold mb-4">Available Categories</h3>
        <div className="grid grid-cols-3 gap-3 text-sm">
          {[
            '🧱 Wall', '⬜ Ceiling', '🟫 Flooring', '🚿 Plumbing',
            '🔥 Fire Protection', '⚡ Electrical', '❄️ HVAC', '🚪 Doors',
            '🔨 Demolition', '🪨 Concrete', '🧱 Masonry', '🚿 Specialties',
            '🧊 Insulation', '🪟 Windows', '🏗️ Site Work', '🔍 Other'
          ].map(cat => (
            <div key={cat} className="bg-zinc-800 rounded-lg px-3 py-2">{cat}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ShortcutsSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">⌨️ Keyboard Shortcuts</h2>
        <p className="text-zinc-400">Master these to work 2x faster.</p>
      </div>

      <div className="grid gap-6">
        <ShortcutGroup
          title="Measurement Tools"
          shortcuts={[
            { key: 'V', action: 'Select tool' },
            { key: 'L', action: 'Line tool' },
            { key: 'C', action: 'Count tool' },
            { key: 'A', action: 'Area tool' },
            { key: 'S', action: 'Space tool' },
            { key: 'H', action: 'Pan / Hand tool' },
          ]}
        />
        
        <ShortcutGroup
          title="Navigation"
          shortcuts={[
            { key: '+', action: 'Zoom in' },
            { key: '-', action: 'Zoom out' },
            { key: '0', action: 'Reset zoom' },
            { key: 'Esc', action: 'Cancel action' },
          ]}
        />
        
        <ShortcutGroup
          title="Editing"
          shortcuts={[
            { key: 'Delete', action: 'Delete selected' },
            { key: 'Ctrl+Z', action: 'Undo' },
            { key: 'Ctrl+Y', action: 'Redo' },
          ]}
        />
      </div>
    </div>
  );
}

function TipsSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">💡 Tips & Best Practices</h2>
        <p className="text-zinc-400">Pro tips from experienced estimators.</p>
      </div>

      <div className="space-y-4">
        <TipCard
          icon="📐"
          title="Calibrate Accurately"
          description="Double-check calibration on multiple known dimensions. Everything depends on accurate scale."
        />
        
        <TipCard
          icon="🤖"
          title="Use Guide Me"
          description="Faster than searching 65,000 items. The AI learns from your selections."
        />
        
        <TipCard
          icon="⌨️"
          title="Learn Shortcuts"
          description="L, C, A, S for tools. You'll be 2x faster than clicking."
        />
        
        <TipCard
          icon="📊"
          title="Check Insights"
          description="The /insights page shows what you've learned. Follow the AI recommendations."
        />
        
        <TipCard
          icon="🔢"
          title="Set Coefficient Last"
          description="Enter all measurements, assign all items, THEN set the location coefficient."
        />
        
        <TipCard
          icon="📋"
          title="Group Similar Work"
          description="Measure all walls first, then ceilings, then floors. Faster than jumping around."
        />
      </div>
    </div>
  );
}

// Helper Components
function StepCard({ number, title, time, description }: { number: number; title: string; time: string; description: string }) {
  return (
    <div className="flex gap-4 p-4 bg-zinc-900 rounded-xl border border-zinc-800">
      <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-black font-bold shrink-0">
        {number}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold">{title}</h3>
          <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">{time}</span>
        </div>
        <p className="text-sm text-zinc-400">{description}</p>
      </div>
    </div>
  );
}

function ToolCard({ icon, name, shortcut, unit, description, howTo }: { 
  icon: string; name: string; shortcut: string; unit: string; description: string; howTo: string 
}) {
  return (
    <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <h3 className="font-semibold">{name}</h3>
        <kbd className="px-2 py-0.5 bg-zinc-700 rounded text-xs font-mono">{shortcut}</kbd>
        <span className="text-xs text-zinc-500">{unit}</span>
      </div>
      <p className="text-sm text-zinc-400 mb-2">{description}</p>
      <p className="text-xs text-amber-400">How: {howTo}</p>
    </div>
  );
}

function ChatBubble({ type, message }: { type: 'assistant' | 'user'; message: string }) {
  return (
    <div className={`flex ${type === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`px-4 py-2 rounded-lg text-sm max-w-xs ${
        type === 'user' ? 'bg-amber-500 text-black' : 'bg-zinc-700'
      }`}>
        {message}
      </div>
    </div>
  );
}

function ShortcutGroup({ title, shortcuts }: { title: string; shortcuts: { key: string; action: string }[] }) {
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
      <h3 className="font-semibold mb-3">{title}</h3>
      <div className="grid gap-2">
        {shortcuts.map(({ key, action }) => (
          <div key={key} className="flex items-center justify-between">
            <kbd className="px-3 py-1 bg-zinc-700 rounded font-mono text-sm min-w-[60px] text-center">{key}</kbd>
            <span className="text-sm text-zinc-400">{action}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TipCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex gap-4 p-4 bg-zinc-900 rounded-xl border border-zinc-800">
      <span className="text-2xl">{icon}</span>
      <div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-zinc-400">{description}</p>
      </div>
    </div>
  );
}

export default HelpPage;
