import { Theme } from './types';

export const THEMES: Theme[] = [
  {
    id: 'donkey-classic',
    name: 'Donkey Classic',
    bg: '#1e1e24',
    main: '#ffd23f',
    sub: '#6a6b73',
    caret: '#ffd23f',
    error: '#ca4754',
    text: '#e6e6ea',
  },
  {
    id: 'serika-dark',
    name: 'Serika Dark',
    bg: '#323437',
    main: '#e2b714',
    sub: '#646669',
    caret: '#e2b714',
    error: '#ca4754',
    text: '#d1d0c5',
  },
  {
    id: 'carbon',
    name: 'Carbon',
    bg: '#2b2b2b',
    main: '#f66e0d',
    sub: '#616161',
    caret: '#f66e0d',
    error: '#da3333',
    text: '#e1e1e1',
  },
  {
    id: 'nord',
    name: 'Nord',
    bg: '#2e3440',
    main: '#88c0d0',
    sub: '#4c566a',
    caret: '#88c0d0',
    error: '#bf616a',
    text: '#d8dee9',
  },
  {
    id: 'plum-sakura',
    name: 'Plum Sakura',
    bg: '#1f1618',
    main: '#f43f5e',
    sub: '#8a5c68',
    caret: '#f43f5e',
    error: '#f87171',
    text: '#fecdd3',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    bg: '#0f0f1a',
    main: '#00f0ff',
    sub: '#5c4d7d',
    caret: '#ff007f',
    error: '#ff3333',
    text: '#e2e8f0',
  },
  {
    id: 'retro-cream',
    name: 'Retro Cream',
    bg: '#f0edd4',
    main: '#2b2d42',
    sub: '#9c9887',
    caret: '#8d99ae',
    error: '#d90429',
    text: '#2b2d42',
  },
  {
    id: 'matrix',
    name: 'Matrix',
    bg: '#050a05',
    main: '#00ff41',
    sub: '#003b00',
    caret: '#00ff41',
    error: '#f85149',
    text: '#80ff80',
  },
  {
    id: 'lavender-haze',
    name: 'Lavender Haze',
    bg: '#13111c',
    main: '#b39ddb',
    sub: '#5c5470',
    caret: '#b39ddb',
    error: '#e57373',
    text: '#ede7f6',
  },
  {
    id: 'deep-ocean',
    name: 'Deep Ocean',
    bg: '#0b132b',
    main: '#48cae4',
    sub: '#3a506b',
    caret: '#00b4d8',
    error: '#ff4d6d',
    text: '#edf2f4',
  },
];

export const NORMAL_WORDS = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
  'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
  'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
  'donkey', 'stubborn', 'persistent', 'smart', 'clever', 'ears', 'hooves', 'carry', 'burden', 'bray', 'loyal', 'patient', 'gentle', 'strong', 'climb', 'trail', 'mountain', 'pasture',
  'focus', 'breathe', 'speed', 'accuracy', 'fingers', 'keyboard', 'keystroke', 'typewriter', 'layout', 'rhythm', 'flow', 'minimal', 'smooth', 'practice', 'session', 'history', 'stats', 'graph',
  'create', 'design', 'future', 'dream', 'world', 'learn', 'grow', 'share', 'build', 'write', 'code', 'enjoy', 'game', 'space', 'play', 'happy', 'peace', 'quiet', 'nature', 'animal',
  'forest', 'river', 'stone', 'cloud', 'sun', 'moon', 'stars', 'light', 'dark', 'night', 'morning', 'noon', 'evening', 'sleep', 'wake', 'run', 'walk', 'jump', 'fly', 'swim',
  'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'black', 'white', 'gray', 'pink', 'brown', 'gold', 'silver', 'bronze', 'warm', 'cold', 'hot', 'cool', 'wind', 'rain',
  'snow', 'storm', 'fire', 'water', 'earth', 'air', 'spirit', 'mind', 'body', 'heart', 'soul', 'life', 'time', 'space', 'energy', 'matter', 'form', 'line', 'point', 'circle'
];

export const ENGLISH_1000 = [
  ...NORMAL_WORDS,
  'abandon', 'ability', 'absolute', 'abstract', 'abuse', 'academic', 'accelerate', 'accent', 'accept', 'access',
  'accident', 'accompany', 'accomplish', 'account', 'accurate', 'accuse', 'achieve', 'acid', 'acknowledge', 'acquire',
  'across', 'action', 'active', 'activity', 'actor', 'actress', 'actual', 'adapt', 'addition', 'address',
  'adequate', 'adjust', 'admire', 'admission', 'admit', 'adolescent', 'adopt', 'adult', 'advance', 'advantage',
  'adventure', 'advertise', 'advice', 'advise', 'advocate', 'aesthetic', 'affair', 'affect', 'afford', 'afraid',
  'afternoon', 'against', 'agency', 'agenda', 'agent', 'aggressive', 'agree', 'agriculture', 'ahead', 'aid',
  'aim', 'aircraft', 'airline', 'airport', 'alarm', 'album', 'alcohol', 'alert', 'alien', 'alike',
  'alive', 'alliance', 'alligator', 'allocate', 'allow', 'alloy', 'almost', 'alone', 'along', 'alphabet',
  'already', 'alter', 'alternative', 'although', 'altitude', 'altogether', 'aluminum', 'always', 'amaze', 'ambassador',
  'ambition', 'ambulance', 'amend', 'amid', 'among', 'amount', 'amuse', 'analysis', 'analyze', 'ancestor',
  'anchor', 'ancient', 'anger', 'angle', 'animal', 'announce', 'annoy', 'annual', 'another', 'answer',
  'antenna', 'anticipate', 'anxiety', 'anxious', 'anybody', 'anyhow', 'anyone', 'anything', 'anyway', 'anywhere',
  'apart', 'apartment', 'apologize', 'apology', 'apparatus', 'apparent', 'appeal', 'appear', 'appetite', 'applause',
  'apple', 'appliance', 'apply', 'appoint', 'appreciate', 'approach', 'approve', 'approximate', 'apron', 'arbitrary',
  'arch', 'architect', 'archive', 'area', 'argue', 'argument', 'arise', 'arithmetic', 'armchair', 'armor',
  'army', 'around', 'arrange', 'array', 'arrest', 'arrival', 'arrive', 'arrow', 'article', 'artificial',
  'artist', 'asbestos', 'ascend', 'ashamed', 'aside', 'asleep', 'aspect', 'aspire', 'assassin', 'assault',
  'assemble', 'assert', 'assess', 'asset', 'assign', 'assist', 'associate', 'assume', 'assure', 'astonish',
  'astronaut', 'astronomy', 'athlete', 'atmosphere', 'atom', 'attach', 'attack', 'attain', 'attempt', 'attend',
  'attention', 'attitude', 'attract', 'attribute', 'auction', 'audience', 'audio', 'audit', 'auditorium', 'august',
  'uncle', 'under', 'understand', 'undertake', 'unemployment', 'unexpected', 'unfortunate', 'uniform', 'union', 'unique',
  'unit', 'unite', 'universe', 'university', 'unknown', 'unless', 'unlikely', 'until', 'unusual', 'unwilling',
  'valley', 'valuable', 'value', 'valve', 'vanish', 'vapor', 'variable', 'variety', 'various', 'vary',
  'vessel', 'veteran', 'victim', 'victory', 'video', 'view', 'vigorous', 'village', 'vinegar', 'violate',
  'violence', 'violent', 'violin', 'virtual', 'virtue', 'virus', 'visible', 'vision', 'visit', 'visitor',
  'visual', 'vital', 'vitamin', 'vocabulary', 'vocal', 'voice', 'volcano', 'volleyball', 'volume', 'voluntary'
];

export const CODE_WORDS = [
  'const', 'let', 'var', 'function', 'return', 'import', 'export', 'default', 'from', 'class',
  'extends', 'implements', 'interface', 'type', 'enum', 'public', 'private', 'protected', 'readonly', 'as',
  'async', 'await', 'promise', 'then', 'catch', 'finally', 'try', 'throw', 'error', 'new',
  'if', 'else', 'switch', 'case', 'break', 'continue', 'for', 'while', 'do', 'of',
  'in', 'typeof', 'instanceof', 'void', 'delete', 'debugger', 'yield', 'with', 'null', 'undefined',
  'true', 'false', 'boolean', 'number', 'string', 'symbol', 'any', 'unknown', 'never', 'object',
  'array', 'map', 'set', 'weakmap', 'weakset', 'date', 'regexp', 'json', 'math', 'console',
  'log', 'warn', 'error', 'info', 'assert', 'time', 'timeEnd', 'clear', 'dir', 'table',
  'document', 'window', 'body', 'head', 'div', 'span', 'button', 'input', 'event', 'listener',
  'useState', 'useEffect', 'useContext', 'useReducer', 'useCallback', 'useMemo', 'useRef', 'useLayoutEffect',
  'props', 'state', 'ref', 'context', 'reducer', 'action', 'payload', 'dispatch', 'render', 'mount',
  'unmount', 'update', 'element', 'component', 'module', 'package', 'dependency', 'script', 'build', 'server',
  'client', 'request', 'response', 'headers', 'status', 'params', 'query', 'body', 'router', 'middleware',
  'database', 'query', 'select', 'where', 'insert', 'update', 'delete', 'join', 'schema', 'migration'
];

export interface Quote {
  text: string;
  source: string;
  length: 'short' | 'medium' | 'long';
}

export const QUOTES: Quote[] = [
  {
    text: "The stubbornness of a donkey is nothing more than its supreme patience and caution in the face of uncertainty.",
    source: "Donkey Wisdom",
    length: "short"
  },
  {
    text: "Type with precision first, and the speed will follow as naturally as water flowing down a mountain stream.",
    source: "Typing Sensei",
    length: "short"
  },
  {
    text: "A donkey does not stumble over the same stone twice. Learn from your typing mistakes and adapt your muscle memory.",
    source: "Ancient Proverb",
    length: "short"
  },
  {
    text: "Simplicity is the ultimate sophistication. Keep your keyboard clean, your mind calm, and your fingers fluid.",
    source: "Leonardo da Vinci",
    length: "short"
  },
  {
    text: "Do not fear going slowly, fear only standing still. Every single accurate keystroke builds the foundation of a 100 WPM speed.",
    source: "Chinese Wisdom",
    length: "medium"
  },
  {
    text: "The donkey is a beast of burden, but it carries its weight with a quiet dignity, conquering steep mountain pathways that would break a horse's spirit.",
    source: "Mountain Guide Diary",
    length: "medium"
  },
  {
    text: "If you want to write clean code, you must type with absolute focus. A misplaced semicolon can bring down a server, and a missed bracket can cost hours of debugging.",
    source: "Developer Manifesto",
    length: "medium"
  },
  {
    text: "Computers are incredibly fast, accurate, and stupid. Human beings are unbelievably slow, inaccurate, and brilliant. Together they can create miracles beyond imagination.",
    source: "Albert Einstein (attributed)",
    length: "medium"
  },
  {
    text: "When typing, consistency is the true key to speed. It is not about typing one word at lightning speed and making five mistakes on the next. A smooth, uninterrupted rhythm always wins the race, just as the slow and steady tortoise outpaced the overconfident hare.",
    source: "Typing Mechanics",
    length: "long"
  },
  {
    text: "The journey of a thousand miles begins with a single step. For the typist, the journey to muscle-memory mastery begins with home-row discipline. Keep your thumbs relaxed on the spacebar, your wrists elevated slightly off the desk, and let your fingers dance lightly over the switches.",
    source: "Ergonomics & Discipline",
    length: "long"
  },
  {
    text: "In the desert of life, the donkey is a symbol of resilience. It stores its energy, tolerates the heat, keeps its head down, and walks forward. When you practice typing, treat each test as a quiet desert walk. Do not rush, do not panic when you misspell, simply reset your rhythm and continue.",
    source: "Philosopher of the Plains",
    length: "long"
  }
];
