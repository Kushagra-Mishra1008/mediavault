import { useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import Sprite, { SpeechBubble } from './Sprite';
import { useAuth } from '../context/AuthContext';
import { useVault } from '../context/VaultContext';
import { timeGreeting } from '../lib/progress';

const VIEW_LINES = {
  library: (s) => (s?.totalEntries ? `${s.totalEntries} titles guarded. Nobody gets past me.` : 'Empty vault... feed me something!'),
  stats: (s) => (s?.byStatus?.COMPLETED ? `${s.byStatus.COMPLETED} cleared. Numbers don't lie.` : 'No clears yet. The grind starts now.'),
  recommendations: () => 'Want picks? I peeked at your ratings.',
};

const IDLE_LINES = [
  "Tap me again, I dare you.",
  'Reel says the popcorn is free.',
  'Pip hasn\'t blinked in 40 hours.',
  'Telly is still on season 1.',
  'Kit swears the filler arc is canon.',
  'Press N to feed me a new title.',
  'Press 1, 2, 3 to zip around.',
  'Backlogs are just side quests.',
  'Dropping a show is self-care.',
  'I only look like a treasure chest.',
];

// Vaulty lives in the sidebar and reacts to where you are. Clicking
// cycles through idle chatter and makes it hop. Keyed by view in the
// parent, so it re-greets on every screen change.
export default function Companion({ view }) {
  const { user } = useAuth();
  const { stats } = useVault();
  const [taps, setTaps] = useState(0);

  let line;
  if (taps > 0) {
    line = IDLE_LINES[(taps - 1) % IDLE_LINES.length];
  } else if (view === 'library' && !stats) {
    line = timeGreeting(user.username);
  } else {
    line = VIEW_LINES[view]?.(stats) ?? timeGreeting(user.username);
  }

  return (
    <div className="px-4">
      <AnimatePresence mode="wait">
        <m.div
          key={line}
          initial={{ opacity: 0, y: 6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="origin-bottom-left"
        >
          <SpeechBubble tail={22}>{line}</SpeechBubble>
        </m.div>
      </AnimatePresence>
      <button
        type="button"
        onClick={() => setTaps((t) => t + 1)}
        aria-label="Talk to Vaulty"
        className="mt-3 ml-1 cursor-pointer"
      >
        <Sprite name="vaulty" size={56} hop={taps} />
      </button>
    </div>
  );
}
