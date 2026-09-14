export type Theme = 'original' | 'win98' | 'future' | 'rainbow';
export const themes: { id: Theme; label: string; description: string }[] = [
  { id: 'original', label: 'Original', description: 'Quiet, warm phosphor' },
  { id: 'win98', label: 'Windows 98', description: 'Back to the desktop' },
  { id: 'future', label: 'Futuristic', description: 'Neon data terminal' },
  { id: 'rainbow', label: 'Rainbow', description: 'Every bit of the spectrum' },
];
export function loadTheme(): Theme {
  try { const saved = localStorage.getItem('defrag98-theme'); return themes.some(theme => theme.id === saved) ? saved as Theme : 'win98'; }
  catch { return 'win98'; }
}
export const palettes = {
  original: { background: '#101d29', used: ['#42afb4','#368aab','#708fcd','#63bba0'], free:'#203342', system:'#aa91c5', locked:'#b3a77c', moving:'#fff4d1', target:'#f8d779', recent:'#b7ebbc' },
  win98: { background: '#ffffff', used: ['#00ffff','#00ffff','#00ffff','#00ffff'], free:'#ffffff', system:'#0000ff', locked:'#ff0000', moving:'#ffffff', target:'#ffff00', recent:'#0000ff' },
  future: { background:'#030a16', used:['#00e5ff','#3579ff','#8464ff','#18d5ac'], free:'#102139', system:'#c885ff', locked:'#ff5283', moving:'#ffffff', target:'#f1ff69', recent:'#7bffe6' },
  rainbow: { background:'#140e2a', used:Array.from({length:32},(_,i)=>`hsl(${i*360/32} 90% 66%)`), free:'#302442', system:'#e4cfff', locked:'#ffef97', moving:'#ffffff', target:'#fffb9d', recent:'#ffffff' },
};
