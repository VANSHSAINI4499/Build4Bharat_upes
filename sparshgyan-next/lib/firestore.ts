import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'

// ── Types ──────────────────────────────────────────

export interface ChildProfile {
  name: string
  age: number
  grade: string
  disabilities: string[]
}

export interface CourseProgress {
  courseId: string
  courseTitle: string
  lessonsCompleted: number
  totalLessons: number
  quizScore: number
  timeSpentMinutes: number
  lastAccessed: Timestamp | null
  color: string
  colorLight: string
}

export interface ActivityEntry {
  type: 'lesson' | 'quiz' | 'braille' | 'captions' | 'gesture'
  description: string
  timestamp: Timestamp | null
}

export interface WeeklyStats {
  totalMinutes: number
  lessonsCompleted: number
  avgQuizScore: number
  brailleSessions: number
  captionSessions: number
  gestureSessions: number
}

export interface WeeklyActivity {
  day: string
  minutes: number
}

export interface SkillProficiency {
  skill: string
  value: number
  color: string
}

export interface MonthlyScore {
  month: string
  score: number
}

export interface SessionBreakdownItem {
  label: string
  value: number
  color: string
}

export interface Achievement {
  emoji: string
  label: string
  unlocked: boolean
}

export interface DashboardData {
  child: ChildProfile
  courses: CourseProgress[]
  activities: ActivityEntry[]
  weeklyStats: WeeklyStats
  weeklyActivity: WeeklyActivity[]
  skills: SkillProficiency[]
  monthlyProgress: MonthlyScore[]
  sessionBreakdown: SessionBreakdownItem[]
  achievements: Achievement[]
}

// ── Firestore schema ───────────────────────────────
// parents/{uid}/child/profile         → ChildProfile
// parents/{uid}/progress/{courseId}    → CourseProgress  (one doc per course)
// parents/{uid}/data/activity         → { items: ActivityEntry[] }
// parents/{uid}/stats/weekly          → WeeklyStats
// parents/{uid}/data/weeklyActivity   → { items: WeeklyActivity[] }
// parents/{uid}/data/skills           → { items: SkillProficiency[] }
// parents/{uid}/data/monthlyProgress  → { items: MonthlyScore[] }
// parents/{uid}/data/sessionBreakdown → { items: SessionBreakdownItem[] }
// parents/{uid}/data/achievements     → { items: Achievement[] }

// ── Read helpers ───────────────────────────────────

function p(uid: string) {
  return doc(db, 'parents', uid)
}

async function getChildProfile(uid: string): Promise<ChildProfile | null> {
  const snap = await getDoc(doc(p(uid), 'child', 'profile'))
  return snap.exists() ? (snap.data() as ChildProfile) : null
}

async function getCourseProgress(uid: string): Promise<CourseProgress[]> {
  const snap = await getDocs(collection(db, 'parents', uid, 'progress'))
  return snap.docs.map((d) => d.data() as CourseProgress)
}

async function getArrayDoc<T>(uid: string, docPath: string): Promise<T[]> {
  const snap = await getDoc(doc(db, 'parents', uid, 'data', docPath))
  if (!snap.exists()) return []
  const data = snap.data()
  return (data?.items ?? []) as T[]
}

async function getWeeklyStats(uid: string): Promise<WeeklyStats | null> {
  const snap = await getDoc(doc(p(uid), 'stats', 'weekly'))
  return snap.exists() ? (snap.data() as WeeklyStats) : null
}

/** Fetch ALL dashboard data from Firestore with a timeout */
export async function fetchDashboardData(uid: string): Promise<DashboardData | null> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Firestore timeout')), 20000)
  )

  try {
    const result = await Promise.race([
      Promise.all([
        getChildProfile(uid),
        getCourseProgress(uid),
        getArrayDoc<ActivityEntry>(uid, 'activity'),
        getWeeklyStats(uid),
        getArrayDoc<WeeklyActivity>(uid, 'weeklyActivity'),
        getArrayDoc<SkillProficiency>(uid, 'skills'),
        getArrayDoc<MonthlyScore>(uid, 'monthlyProgress'),
        getArrayDoc<SessionBreakdownItem>(uid, 'sessionBreakdown'),
        getArrayDoc<Achievement>(uid, 'achievements'),
      ]),
      timeoutPromise,
    ])

    const [child, courses, activities, weeklyStats, weeklyActivity, skills, monthlyProgress, sessionBreakdown, achievements] = result

    if (!child || !weeklyStats) return null

    return { child, courses, activities, weeklyStats, weeklyActivity, skills, monthlyProgress, sessionBreakdown, achievements }
  } catch (err) {
    console.error('[Firestore] fetchDashboardData failed:', err)
    return null
  }
}

// ── Seed demo data ─────────────────────────────────

export async function seedDemoData(uid: string) {
  const parentRef = p(uid)

  // 1) Child profile  →  parents/{uid}/child/profile
  await setDoc(doc(parentRef, 'child', 'profile'), {
    name: 'Aarav',
    age: 10,
    grade: 'Class 5',
    disabilities: ['Visual Impairment', 'Hearing Difficulty'],
  } satisfies ChildProfile)

  // 2) Courses  →  parents/{uid}/progress/{courseId}  (one doc per course)
  const courses: (CourseProgress & { id: string })[] = [
    {
      id: 'ai-accessibility',
      courseId: 'ai-accessibility',
      courseTitle: 'AI for Accessibility',
      lessonsCompleted: 8,
      totalLessons: 12,
      quizScore: 85,
      timeSpentMinutes: 145,
      lastAccessed: Timestamp.now(),
      color: '#7c3aed',
      colorLight: '#a78bfa',
    },
    {
      id: 'computer-vision',
      courseId: 'computer-vision',
      courseTitle: 'Computer Vision Basics',
      lessonsCompleted: 4,
      totalLessons: 10,
      quizScore: 72,
      timeSpentMinutes: 90,
      lastAccessed: Timestamp.now(),
      color: '#3b82f6',
      colorLight: '#60a5fa',
    },
    {
      id: 'speech-recognition',
      courseId: 'speech-recognition',
      courseTitle: 'Speech Recognition',
      lessonsCompleted: 6,
      totalLessons: 8,
      quizScore: 90,
      timeSpentMinutes: 115,
      lastAccessed: Timestamp.now(),
      color: '#10b981',
      colorLight: '#34d399',
    },
  ]

  for (const c of courses) {
    const { id, ...data } = c
    await setDoc(doc(parentRef, 'progress', id), data)
  }

  // 3) Weekly stats  →  parents/{uid}/stats/weekly
  await setDoc(doc(parentRef, 'stats', 'weekly'), {
    totalMinutes: 290,
    lessonsCompleted: 14,
    avgQuizScore: 82,
    brailleSessions: 6,
    captionSessions: 9,
    gestureSessions: 4,
  } satisfies WeeklyStats)

  // 4) Recent activity  →  parents/{uid}/data/activity  (single doc, array)
  await setDoc(doc(parentRef, 'data', 'activity'), {
    items: [
      { type: 'lesson', description: 'Completed "How AI Recognizes Faces"', timestamp: Timestamp.now() },
      { type: 'quiz', description: 'Scored 85% on AI Accessibility Quiz 3', timestamp: Timestamp.now() },
      { type: 'braille', description: 'Practiced Braille output for 12 minutes', timestamp: Timestamp.now() },
      { type: 'captions', description: 'Used live captions during video lesson', timestamp: Timestamp.now() },
      { type: 'gesture', description: 'Completed gesture navigation exercise', timestamp: Timestamp.now() },
      { type: 'lesson', description: 'Started "MediaPipe Hand Tracking"', timestamp: Timestamp.now() },
    ],
  })

  // 5) Weekly activity  →  parents/{uid}/data/weeklyActivity  (single doc, array)
  await setDoc(doc(parentRef, 'data', 'weeklyActivity'), {
    items: [
      { day: 'Mon', minutes: 45 },
      { day: 'Tue', minutes: 30 },
      { day: 'Wed', minutes: 55 },
      { day: 'Thu', minutes: 20 },
      { day: 'Fri', minutes: 60 },
      { day: 'Sat', minutes: 40 },
      { day: 'Sun', minutes: 35 },
    ],
  })

  // 6) Skills  →  parents/{uid}/data/skills  (single doc, array)
  await setDoc(doc(parentRef, 'data', 'skills'), {
    items: [
      { skill: 'Braille', value: 78, color: '#a78bfa' },
      { skill: 'Captions', value: 92, color: '#22d3ee' },
      { skill: 'Gesture', value: 65, color: '#34d399' },
      { skill: 'Voice Nav', value: 85, color: '#f472b6' },
      { skill: 'Quiz', value: 82, color: '#fbbf24' },
    ],
  })

  // 7) Monthly progress  →  parents/{uid}/data/monthlyProgress  (single doc, array)
  await setDoc(doc(parentRef, 'data', 'monthlyProgress'), {
    items: [
      { month: 'Jan', score: 45 },
      { month: 'Feb', score: 52 },
      { month: 'Mar', score: 61 },
      { month: 'Apr', score: 58 },
      { month: 'May', score: 70 },
      { month: 'Jun', score: 75 },
      { month: 'Jul', score: 82 },
    ],
  })

  // 8) Session breakdown  →  parents/{uid}/data/sessionBreakdown  (single doc, array)
  await setDoc(doc(parentRef, 'data', 'sessionBreakdown'), {
    items: [
      { label: 'Braille', value: 6, color: '#a78bfa' },
      { label: 'Captions', value: 9, color: '#22d3ee' },
      { label: 'Gesture', value: 4, color: '#34d399' },
      { label: 'Lessons', value: 14, color: '#60a5fa' },
    ],
  })

  // 9) Achievements  →  parents/{uid}/data/achievements  (single doc, array)
  await setDoc(doc(parentRef, 'data', 'achievements'), {
    items: [
      { emoji: '🏆', label: 'First Quiz', unlocked: true },
      { emoji: '🧠', label: '10 Lessons', unlocked: true },
      { emoji: '🤟', label: 'Braille Pro', unlocked: true },
      { emoji: '🎯', label: '90% Score', unlocked: true },
      { emoji: '🔥', label: '7-Day Streak', unlocked: false },
      { emoji: '👁️', label: 'Gesture Master', unlocked: false },
    ],
  })
}
