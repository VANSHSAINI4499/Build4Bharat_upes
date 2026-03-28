'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Award, Clock, Users, Star, ChevronRight } from 'lucide-react'
import { ArduinoPanel } from '@/components/accessibility/ArduinoPanel'
import { BrailleDisplay } from '@/components/accessibility/BrailleDisplay'
import { GlowCard } from '@/components/magic/GlowCard'
import { AnimatedGradientText } from '@/components/magic/AnimatedGradientText'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const COURSES = [
  {
    id: 1,
    title: 'Digital Literacy for All',
    level: 'Beginner',
    duration: '8 weeks',
    students: '12.4K',
    rating: 4.9,
    tags: ['Sign Language', 'Visual', 'Tactile'],
    color: '#7c3aed',
  },
  {
    id: 2,
    title: 'Assistive Technology Basics',
    level: 'Intermediate',
    duration: '6 weeks',
    students: '8.1K',
    rating: 4.8,
    tags: ['Screen Reader', 'Braille', 'Voice'],
    color: '#3b82f6',
  },
  {
    id: 3,
    title: 'Inclusive Web Design',
    level: 'Advanced',
    duration: '10 weeks',
    students: '5.7K',
    rating: 4.7,
    tags: ['WCAG', 'ARIA', 'Keyboard Nav'],
    color: '#10b981',
  },
]

const LEVEL_COLOR: Record<string, string> = {
  Beginner: 'success',
  Intermediate: 'default',
  Advanced: 'cyan',
}

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-[#050508] pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-black text-white mb-2">
            Accessible{' '}
            <AnimatedGradientText as="span">Courses</AnimatedGradientText>
          </h1>
          <p className="text-white/40 text-sm max-w-xl">
            Every course is designed with multi-modal accessibility — Braille output, captions,
            and haptic feedback built in.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Course list */}
          <div className="space-y-4">
            {COURSES.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <GlowCard
                  glowColor={course.color}
                  className="border border-white/8 bg-white/3 backdrop-blur-sm p-6 group cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div
                        className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${course.color}22`, border: `1px solid ${course.color}33` }}
                      >
                        <BookOpen className="h-5 w-5" style={{ color: course.color }} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <h3 className="text-base font-bold text-white">{course.title}</h3>
                          <Badge variant={(LEVEL_COLOR[course.level] ?? 'secondary') as 'success' | 'default' | 'cyan' | 'secondary'}>
                            {course.level}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-white/40 mb-2.5">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{course.duration}</span>
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{course.students}</span>
                          <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-400" />{course.rating}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {course.tags.map((t) => (
                            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full border border-white/8 bg-white/5 text-white/40">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 group-hover:bg-white/10 transition-colors"
                    >
                      Enroll
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </GlowCard>
              </motion.div>
            ))}

            {/* Achievement strip */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[
                { icon: Award, value: '3', label: 'Certificates', color: 'text-yellow-400' },
                { icon: BookOpen, value: '12', label: 'Lessons Done', color: 'text-blue-400' },
                { icon: Star, value: '4.9', label: 'Avg Rating', color: 'text-purple-400' },
              ].map(({ icon: Icon, value, label, color }) => (
                <div key={label} className="rounded-2xl border border-white/6 bg-white/2 p-4 text-center">
                  <Icon className={`h-5 w-5 mx-auto mb-2 ${color}`} />
                  <p className="text-xl font-black text-white">{value}</p>
                  <p className="text-xs text-white/35 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Accessibility panels */}
          <div className="flex flex-col gap-4">
            <ArduinoPanel />
            <BrailleDisplay />
          </div>
        </div>
      </div>
    </div>
  )
}
