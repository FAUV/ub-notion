
export function initTheme() {
  const saved = localStorage.getItem('theme')
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  const dark = saved ? saved === 'dark' : prefersDark
  document.documentElement.classList.toggle('dark', dark)
}
export function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark')
  localStorage.setItem('theme', isDark ? 'dark' : 'light')
}
