'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  Activity,
  Hand,
  Mic,
  Eye,
  LogOut,
  GraduationCap,
  Calendar,
  Star,
  Zap,
  Target,
  Brain,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AnimatedGradientText } from '@/components/magic/AnimatedGradientText'
import { GlowCard } from '@/components/magic/GlowCard'
import { cn } from '@/lib/utils'
import { fetchDashboardData, seedDemoData, type DashboardData } from '@/lib/firestore'

const ICON_MAP: Record<string, { icon: typeof BookOpen; colors: string }> = {
  lesson:   { icon: BookOpen, colors: 'text-blue-400 bg-blue-500/15 border-blue-500/25' },
  quiz:     { icon: Award,    colors: 'text-yellow-400 bg-yellow-500/15 border-yellow-500/25' },
  braille:  { icon: Hand,     colors: 'text-purple-400 bg-purple-500/15 border-purple-500/25' },
  captions: { icon: Mic,      colors: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/25' },
  gesture:  { icon: Eye,      colors: 'text-green-400 bg-green-500/15 border-green-500/25' },
}

// ── Animated Bar Chart ─────────────────────────────

function BarChart({ data, maxVal }: { data: { label: string; value: number; color: string }[]; maxVal: number }) {
  return (
    <div className="flex items-end gap-2 h-36">
      {data.map((d, i) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5">
          <span className="text-[10px] text-white/40 font-medium">{d.value}m</span>
          <div className="w-full flex-1 flex items-end">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(d.value / maxVal) * 100}%` }}
              transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
              className="w-full rounded-t-lg relative overflow-hidden"
              style={{ backgroundColor: d.color }}
            >
              <motion.div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.15), transparent)' }}
              />
            </motion.div>
          </div>
          <span className="text-[10px] text-white/40">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

// ── Animated Line Chart (SVG) ──────────────────────

function LineChart({ data }: { data: { label: string; value: number }[] }) {
  if (!data || data.length < 2) {
    return <div className="w-full text-center text-white/40 text-sm py-8">Not enough data</div>
  }
  const max = Math.max(...data.map((d) => d.value))
  const min = Math.min(...data.map((d) => d.value)) - 10
  const w = 300
  const h = 120
  const px = w / (data.length - 1)

  const points = data.map((d, i) => ({
    x: i * px,
    y: h - ((d.value - min) / (max - min)) * (h - 20),
  }))

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaPath = `${linePath} L${points[points.length - 1].x},${h} L${points[0].x},${h} Z`

  return (
    <div className="w-full">
      <svg viewBox={`-5 0 ${w + 10} ${h + 25}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1="0" y1={i * (h / 3)} x2={w} y2={i * (h / 3)} stroke="rgba(255,255,255,0.04)" />
        ))}
        <motion.path
          d={areaPath}
          fill="url(#areaGrad)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
        <motion.path
          d={linePath}
          fill="none"
          stroke="#7c3aed"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />
        {points.map((p, i) => (
          <React.Fragment key={i}>
            <motion.circle
              cx={p.x}
              cy={p.y}
              r="4"
              fill="#7c3aed"
              stroke="#050508"
              strokeWidth="2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.15, duration: 0.3 }}
            />
            <motion.text
              x={p.x}
              y={p.y - 10}
              textAnchor="middle"
              className="fill-white/50"
              fontSize="8"
              fontWeight="bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.15 }}
            >
              {data[i].value}
            </motion.text>
            <text x={p.x} y={h + 18} textAnchor="middle" className="fill-white/30" fontSize="9">
              {data[i].label}
            </text>
          </React.Fragment>
        ))}
      </svg>
    </div>
  )
}

// ── Donut Chart ────────────────────────────────────

function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  let cumulative = 0

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
        <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
        {segments.map((seg, i) => {
          const pct = (seg.value / total) * 100
          const offset = cumulative
          cumulative += pct
          return (
            <motion.circle
              key={seg.label}
              cx="18"
              cy="18"
              r="14"
              fill="none"
              stroke={seg.color}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${pct} ${100 - pct}`}
              strokeDashoffset={-offset}
              initial={{ opacity: 0, strokeDasharray: '0 100' }}
              animate={{ opacity: 1, strokeDasharray: `${pct} ${100 - pct}` }}
              transition={{ duration: 1, delay: 0.3 + i * 0.2, ease: 'easeOut' }}
            />
          )
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.p
          className="text-2xl font-black text-white"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, type: 'spring' }}
        >
          {total}
        </motion.p>
        <p className="text-[10px] text-white/30">Sessions</p>
      </div>
    </div>
  )
}

// ── Animated Counter ───────────────────────────────

function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = 0
    const duration = 1.5
    const step = to / (duration * 60)
    const id = setInterval(() => {
      start += step
      if (start >= to) { setVal(to); clearInterval(id) }
      else setVal(Math.floor(start))
    }, 1000 / 60)
    return () => clearInterval(id)
  }, [to])
  return <>{val}{suffix}</>
}

// ── Main Dashboard ─────────────────────────────────

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    let cancelled = false

    async function load() {
      try {
        console.log('[Dashboard] Fetching data for uid:', user!.uid)
        let result = await fetchDashboardData(user!.uid)
        if (!result) {
          console.log('[Dashboard] No data found, seeding demo data…')
          await seedDemoData(user!.uid)
          console.log('[Dashboard] Seed complete, re-fetching…')
          result = await fetchDashboardData(user!.uid)
        }
        if (!cancelled) {
          setData(result)
          if (!result) setError('Seed completed but fetch returned empty. Check Firestore rules.')
        }
      } catch (err: unknown) {
        console.error('[Dashboard] Load error:', err)
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      } finally {
        if (!cancelled) setDataLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [user])

  const handleManualSeed = async () => {
    if (!user) return
    setSeeding(true)
    setError(null)
    try {
      console.log('[Dashboard] Manual seed for uid:', user.uid)
      await seedDemoData(user.uid)
      console.log('[Dashboard] Manual seed done, fetching…')
      const result = await fetchDashboardData(user.uid)
      setData(result)
      if (!result) setError('Seed succeeded but data still empty. Check browser console for Firestore errors.')
    } catch (err: unknown) {
      console.error('[Dashboard] Manual seed error:', err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSeeding(false)
    }
  }

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-[#050508] flex flex-col items-center justify-center gap-3">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <Zap className="h-8 w-8 text-purple-400" />
        </motion.div>
        <p className="text-xs text-white/30">Loading dashboard data from Firestore…</p>
      </div>
    )
  }

  if (!user) return null

  if (!data) {
    return (
      <div className="min-h-screen bg-[#050508] flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-red-400">Could not load data from Firestore.</p>
        {error && <p className="text-xs text-yellow-400/70 max-w-md text-center font-mono">{error}</p>}
        <p className="text-xs text-white/40 max-w-md text-center">
          Make sure Firestore security rules allow read/write. In Firebase Console → Firestore → Rules, set:<br/>
          <code className="text-purple-300">allow read, write: if true;</code>
        </p>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" disabled={seeding} onClick={handleManualSeed}>
            {seeding ? 'Seeding…' : 'Seed Demo Data'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </div>
      </div>
    )
  }

  const { child, courses, activities, weeklyStats, weeklyActivity, skills, monthlyProgress, sessionBreakdown, achievements } = data

  const totalLessons = courses.reduce((s, c) => s + c.lessonsCompleted, 0)
  const totalTime = courses.reduce((s, c) => s + c.timeSpentMinutes, 0)
  const avgScore = courses.length > 0 ? Math.round(courses.reduce((s, c) => s + c.quizScore, 0) / courses.length) : 0

  const handleSignOut = async () => { await signOut(); router.push('/login') }

  return (
    <div className="min-h-screen bg-[#050508] pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-2xl font-black text-white mb-1">
              <AnimatedGradientText as="span">Parent Dashboard</AnimatedGradientText>
            </h1>
            <p className="text-sm text-white/40">Track your child&apos;s accessibility learning progress</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <span className="text-xs text-white/30">{user.email}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </Button>
          </motion.div>
        </div>

        {/* Child profile card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm p-6 mb-6"
        >
          <div className="flex items-center gap-4 flex-wrap">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shrink-0">
              <User className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-white">{child.name}</h2>
                <Badge variant="secondary">{child.grade}</Badge>
                <Badge variant="default">Age {child.age}</Badge>
              </div>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {child.disabilities.map((d) => (
                  <span key={d} className="text-[10px] px-2 py-0.5 rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-300">
                    {d}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-green-500/15 border border-green-500/25 flex items-center justify-center">
                <Zap className="h-4 w-4 text-green-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-green-400">Active Today</p>
                <p className="text-[10px] text-white/30">Last seen 2 min ago</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats row with animated counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { icon: BookOpen, label: 'Lessons Done', value: totalLessons, suffix: '', color: 'text-blue-400', bg: 'bg-blue-500/15' },
            { icon: Clock, label: 'Time Spent', value: Math.floor(totalTime / 60), suffix: `h ${totalTime % 60}m`, color: 'text-cyan-400', bg: 'bg-cyan-500/15' },
            { icon: Award, label: 'Avg Quiz Score', value: avgScore, suffix: '%', color: 'text-yellow-400', bg: 'bg-yellow-500/15' },
            { icon: TrendingUp, label: 'Weekly Minutes', value: weeklyStats.totalMinutes, suffix: '', color: 'text-green-400', bg: 'bg-green-500/15' },
          ].map(({ icon: Icon, label, value, suffix, color, bg }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.08, type: 'spring', stiffness: 200 }}
              className="rounded-2xl border border-white/6 bg-white/3 p-4 group hover:bg-white/5 transition-colors"
            >
              <div className={`h-9 w-9 rounded-xl ${bg} border border-white/5 flex items-center justify-center mb-3`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className="text-2xl font-black text-white">
                <Counter to={value} />{suffix}
              </p>
              <p className="text-xs text-white/35 mt-0.5">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Course progress — takes 2 cols */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2">
              <GraduationCap className="h-4 w-4" /> Course Progress
            </h3>
            {courses.map((course, i) => {
              const pct = Math.round((course.lessonsCompleted / course.totalLessons) * 100)
              return (
                <motion.div
                  key={course.courseId}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.12, type: 'spring' }}
                >
                  <GlowCard glowColor={course.color} className="border border-white/8 bg-white/3 backdrop-blur-sm p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: course.color + '22', border: `1px solid ${course.color}33` }}
                        >
                          <GraduationCap className="h-5 w-5" style={{ color: course.color }} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{course.courseTitle}</h4>
                          <p className="text-xs text-white/40">{course.lessonsCompleted}/{course.totalLessons} lessons · {course.timeSpentMinutes} min</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-white">{course.quizScore}%</p>
                        <p className="text-[10px] text-white/30">Quiz Score</p>
                      </div>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1.2, delay: 0.5 + i * 0.15, ease: 'easeOut' }}
                        className="h-full rounded-full relative overflow-hidden"
                        style={{ background: `linear-gradient(90deg, ${course.color}, ${course.colorLight})` }}
                      >
                        <motion.div
                          className="absolute inset-0"
                          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }}
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ repeat: Infinity, duration: 2, delay: 1 + i * 0.2 }}
                        />
                      </motion.div>
                    </div>
                    <p className="text-[10px] text-white/30 mt-1.5">{pct}% complete</p>
                  </GlowCard>
                </motion.div>
              )
            })}
          </div>

          {/* Right column — Session donut + skills */}
          <div className="space-y-4">
            {/* Donut chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm p-5"
            >
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Target className="h-4 w-4" /> Session Breakdown
              </h3>
              <DonutChart segments={sessionBreakdown} />
              <div className="grid grid-cols-2 gap-2 mt-4">
                {sessionBreakdown.map((seg) => (
                  <div key={seg.label} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                    <span className="text-xs text-white/50">{seg.label}</span>
                    <span className="text-xs font-bold text-white ml-auto">{seg.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Skills proficiency */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm p-5"
            >
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Brain className="h-4 w-4" /> Skill Proficiency
              </h3>
              <div className="space-y-3">
                {skills.map((s, i) => (
                  <div key={s.skill}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white/50">{s.skill}</span>
                      <span className="text-xs font-bold text-white">{s.value}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${s.value}%` }}
                        transition={{ duration: 1, delay: 0.6 + i * 0.1, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Weekly activity bar chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm p-5"
          >
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-1 flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Weekly Activity
            </h3>
            <p className="text-xs text-white/25 mb-4">Minutes spent per day</p>
            <BarChart
              data={weeklyActivity.map((d) => ({ label: d.day, value: d.minutes, color: '#7c3aed' }))}
              maxVal={70}
            />
          </motion.div>

          {/* Monthly progress line chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm p-5"
          >
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-1 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Monthly Progress
            </h3>
            <p className="text-xs text-white/25 mb-4">Overall accessibility score trend</p>
            <LineChart data={monthlyProgress.map((d) => ({ label: d.month, value: d.score }))} />
          </motion.div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* Activity feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm p-5"
          >
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4" /> Recent Activity
            </h3>
            <div className="space-y-3">
              {activities.map((a, i) => {
                const mapped = ICON_MAP[a.type] || ICON_MAP.lesson
                const Icon = mapped.icon
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + i * 0.08 }}
                    className="flex items-start gap-3 group"
                  >
                    <div className={`h-9 w-9 rounded-lg border flex items-center justify-center shrink-0 ${mapped.colors} group-hover:scale-110 transition-transform`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/70">{a.description}</p>
                      <p className="text-[10px] text-white/25 mt-0.5">{a.type}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Achievements + weekly summary */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85 }}
              className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm p-5"
            >
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Star className="h-4 w-4" /> Achievements
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {achievements.map((a, i) => (
                  <motion.div
                    key={a.label}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 + i * 0.08, type: 'spring' }}
                    className={cn(
                      'rounded-xl border p-3 text-center transition-all',
                      a.unlocked
                        ? 'border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10'
                        : 'border-white/5 bg-white/2 opacity-40'
                    )}
                  >
                    <p className="text-xl mb-1">{a.emoji}</p>
                    <p className="text-[10px] text-white/50">{a.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95 }}
              className="rounded-2xl border border-white/8 bg-gradient-to-br from-purple-600/10 to-blue-600/10 backdrop-blur-sm p-5"
            >
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Weekly Summary</h3>
              <div className="space-y-2.5">
                {[
                  { label: 'Braille Sessions', value: String(weeklyStats.brailleSessions), icon: Hand, color: 'text-purple-400' },
                  { label: 'Caption Sessions', value: String(weeklyStats.captionSessions), icon: Mic, color: 'text-cyan-400' },
                  { label: 'Gesture Sessions', value: String(weeklyStats.gestureSessions), icon: Eye, color: 'text-green-400' },
                  { label: 'Total Lessons', value: String(weeklyStats.lessonsCompleted), icon: BookOpen, color: 'text-blue-400' },
                  { label: 'Avg Quiz Score', value: `${weeklyStats.avgQuizScore}%`, icon: Award, color: 'text-yellow-400' },
                ].map(({ label, value, icon: Icon, color }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + i * 0.06 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${color}`} />
                      <span className="text-sm text-white/50">{label}</span>
                    </div>
                    <span className="text-sm font-bold text-white">{value}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
