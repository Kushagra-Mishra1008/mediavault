import { useState } from 'react';
import Rook, { Bubble } from './Rook';
import { useAuth } from '../context/AuthContext';
import { useVault } from '../context/VaultContext';
import { timeGreeting } from '../lib/progress';

const VIEW_LINES = {
  library: (s) => (s?.totalEntries ? `${s.totalEntries} titles in the vault. Not bad.` : 'The vault is empty. Let\'s fix that.'),
  stats: (s) => (s?.topGenre ? `${s.topGenre}, huh? I see you.` : 'Your stats tell a story. Keep writing it.'),
  recommendations: () => 'New targets? Leave it to me.',
};

const IDLE_LINES = [
  'Hey, watch the hat.',
  'Press N and log something. I dare you.',
  '1, 2, 3 - jump between screens. Fast.',
  'Dropping a show isn\'t losing. It\'s strategy.',
  'Your backlog is a treasure map.',
  'Rating things makes me smarter.',
  'Wishlist it. Future you will thank you.',
  'Stay stylish.',
];

// Rook sits in the sidebar and comments on where you are. Clicking
// cycles through idle chatter. Keyed by view in the parent, so each
// screen change starts with a fresh line.
export default function Companion({ view }) {
  const { user } = useAuth();
  const { stats } = useVault();
  const [taps, setTaps] = useState(0);

  let line;
  if (taps > 0) line = IDLE_LINES[(taps - 1) % IDLE_LINES.length];
  else if (view === 'library' && !stats) line = timeGreeting(user.username);
  else line = VIEW_LINES[view]?.(stats) ?? timeGreeting(user.username);

  return (
    <div className="flex flex-col items-start">
      <Bubble>{line}</Bubble>
      <button
        type="button"
        onClick={() => setTaps((t) => t + 1)}
        aria-label="Talk to Rook"
        className="mt-3 ml-2 cursor-pointer"
      >
        <Rook size={72} hop={taps} mood={taps % 3 === 2 ? 'shock' : 'smug'} />
      </button>
    </div>
  );
}
