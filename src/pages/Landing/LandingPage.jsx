import React from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { PromoSection } from '@/components/ui/promo-section'
import { Sun, Moon, ArrowRight, ArrowUpRight, ArrowDownRight, Wallet, Target, TrendingUp, CheckCircle2 } from 'lucide-react'
import logo from '@/assets/logo.png'

export function LandingPage() {
  const { isAuthenticated } = useAuthStore()
  const { isDark, toggle } = useThemeStore()

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-zinc-950 dark:text-zinc-50 transition-colors duration-200">
      {/* 2D Manga Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b-2 border-zinc-950 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo & Manga Badge */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2.5 group">
                <img
                  src={logo}
                  alt="AcheeZ"
                  className="w-9 h-9 object-contain transition-transform group-hover:scale-105"
                />
                <span className="font-black text-xl tracking-tight text-zinc-950 dark:text-white">
                  AcheeZ
                </span>
              </Link>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-black uppercase tracking-wider bg-purple-600 text-white rounded-md border border-zinc-950 dark:border-white shadow-[1.5px_1.5px_0px_0px_#000] dark:shadow-[1.5px_1.5px_0px_0px_#fff]">
                「 財務管理 」
              </span>
            </div>

            {/* Right Action Navigation */}
            <div className="flex items-center gap-3">
              {/* Dark / Light Mode Toggle */}
              <button
                onClick={toggle}
                id="landing-theme-toggle"
                className="p-2.5 rounded-xl border-2 border-zinc-950 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-[2px_2px_0px_0px_#9333ea] hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                aria-label="Toggle Mode"
                title={isDark ? 'Mode Terang' : 'Mode Gelap'}
              >
                {isDark ? <Sun size={17} /> : <Moon size={17} />}
              </button>

              {/* Authentication Buttons */}
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wide bg-purple-600 text-white border-2 border-zinc-950 dark:border-white shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:bg-purple-700 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer">
                    Dashboard
                    <ArrowRight size={16} />
                  </button>
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login">
                    <button className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                      Masuk
                    </button>
                  </Link>
                  <Link to="/register">
                    <button className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wide bg-purple-600 text-white border-2 border-zinc-950 dark:border-white shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:bg-purple-700 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer">
                      Daftar
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Hero & Marquee Component */}
      <main className="flex-1">
        <PromoSection />

        {/* 2D Manga 3-Panel Highlights Section (Concise & Punchy) */}
        <section className="py-12 border-t-2 border-zinc-950 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-black uppercase tracking-widest text-purple-600 dark:text-purple-400">
                「 三大特徴 // 3 FITUR UTAMA 」
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white mt-1.5">
                Simpel, Cepat & Terstruktur
              </h2>
            </div>

            {/* 3 Manga Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Panel 1: Arus Kas */}
              <div className="p-6 rounded-2xl border-2 border-zinc-950 dark:border-zinc-200 bg-white dark:bg-zinc-900 shadow-[5px_5px_0px_0px_#9333ea] hover:-translate-y-1 transition-transform">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black text-purple-600 dark:text-purple-400">
                    「 CH.01 // 収支管理 」
                  </span>
                  <div className="p-2 rounded-lg bg-purple-600 text-white border border-zinc-950 dark:border-white shadow-[2px_2px_0px_0px_#000]">
                    <Wallet size={18} />
                  </div>
                </div>
                <h3 className="text-lg font-black text-zinc-950 dark:text-white mb-2">
                  Arus Kas Real-time
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Catat mutasi masuk dan keluar dalam hitungan detik. Saldo antar rekening bank dan dompet selalu sinkron.
                </p>
              </div>

              {/* Panel 2: Pos Anggaran */}
              <div className="p-6 rounded-2xl border-2 border-zinc-950 dark:border-zinc-200 bg-white dark:bg-zinc-900 shadow-[5px_5px_0px_0px_#9333ea] hover:-translate-y-1 transition-transform">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black text-purple-600 dark:text-purple-400">
                    「 CH.02 // 予算制限 」
                  </span>
                  <div className="p-2 rounded-lg bg-purple-600 text-white border border-zinc-950 dark:border-white shadow-[2px_2px_0px_0px_#000]">
                    <TrendingUp size={18} />
                  </div>
                </div>
                <h3 className="text-lg font-black text-zinc-950 dark:text-white mb-2">
                  Pos Anggaran Ketat
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Batasi jatah pengeluaran per kategori. Visualisasi persentase mencegah pengeluaran melebihi batas bulanan.
                </p>
              </div>

              {/* Panel 3: Target Tabungan */}
              <div className="p-6 rounded-2xl border-2 border-zinc-950 dark:border-zinc-200 bg-white dark:bg-zinc-900 shadow-[5px_5px_0px_0px_#9333ea] hover:-translate-y-1 transition-transform">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black text-purple-600 dark:text-purple-400">
                    「 CH.03 // 貯金目標 」
                  </span>
                  <div className="p-2 rounded-lg bg-purple-600 text-white border border-zinc-950 dark:border-white shadow-[2px_2px_0px_0px_#000]">
                    <Target size={18} />
                  </div>
                </div>
                <h3 className="text-lg font-black text-zinc-950 dark:text-white mb-2">
                  Target Tabungan
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Tetapkan impian finansial dan setor dana langsung dari rekening terdaftar hingga target terkumpul 100%.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2D Manga Bottom Call To Action */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto p-8 sm:p-12 rounded-3xl border-2 border-zinc-950 dark:border-zinc-100 bg-white dark:bg-zinc-950 shadow-[8px_8px_0px_0px_#9333ea] text-center space-y-6">
            <span className="inline-block px-3 py-1 text-xs font-black uppercase tracking-wider bg-purple-600 text-white rounded-full border border-zinc-950 dark:border-white shadow-[2px_2px_0px_0px_#000]">
              ★ SIAP MENATA KEUANGAN?
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-950 dark:text-white tracking-tight">
              Mulai Langkah Bebas Finansial Hari Ini.
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto">
              Daftar dalam 30 detik tanpa biaya langganan. Data tersimpan aman di Cloudflare D1.
            </p>
            <div className="pt-2">
              <Link to={isAuthenticated ? "/dashboard" : "/register"}>
                <button className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider bg-purple-600 text-white border-2 border-zinc-950 dark:border-white shadow-[5px_5px_0px_0px_#000] dark:shadow-[5px_5px_0px_0px_#fff] hover:bg-purple-700 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer">
                  {isAuthenticated ? "Buka Dashboard Saya" : "Buat Akun Gratis Sekarang"}
                  <ArrowRight size={18} />
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 2D Manga Footer */}
      <footer className="border-t-2 border-zinc-950 dark:border-zinc-800 py-6 bg-white dark:bg-zinc-950 text-center text-xs text-zinc-500 dark:text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-900 dark:text-zinc-100">AcheeZ</span>
            <span>&copy; {new Date().getFullYear()}</span>
            <span>&bull;</span>
            <span className="text-purple-600 font-semibold">2D Manga Finance</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Dibuat untuk pengelolaan finansial pribadi yang disiplin dan presisi.
          </p>
        </div>
      </footer>
    </div>
  )
}
