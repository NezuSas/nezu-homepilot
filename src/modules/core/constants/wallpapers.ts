export const PREDEFINED_WALLPAPERS = [
  {
    id: 'gradient-1',
    name: 'Océano Profundo',
    preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    css: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500'
  },
  {
    id: 'gradient-2',
    name: 'Atardecer Tropical',
    preview: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    css: 'bg-gradient-to-br from-pink-400 via-red-400 to-orange-400'
  },
  {
    id: 'gradient-3',
    name: 'Bosque Místico',
    preview: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    css: 'bg-gradient-to-br from-cyan-400 via-blue-400 to-indigo-500'
  },
  {
    id: 'gradient-4',
    name: 'Aurora Boreal',
    preview: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    css: 'bg-gradient-to-br from-teal-200 via-cyan-300 to-blue-400'
  },
  {
    id: 'gradient-5',
    name: 'Noche Estrellada',
    preview: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    css: 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900'
  },
  {
    id: 'gradient-6',
    name: 'Primavera Fresca',
    preview: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    css: 'bg-gradient-to-br from-orange-200 via-pink-200 to-rose-300'
  },
  {
    id: 'default',
    name: 'Predeterminado (Partículas)',
    preview: 'linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%)',
    css: '' // Empty means use the animated background
  }
];

export const RECOMMENDED_DIMENSIONS = {
  width: 1920,
  height: 1080,
  aspectRatio: '16:9',
  maxSize: 5 // MB
};
