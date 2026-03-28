import { Hero } from '@/components/sections/Hero'
import { FeatureGrid } from '@/components/sections/FeatureGrid'

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeatureGrid />

      {/* Bottom CTA strip */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-600/10 to-blue-600/5 p-12 backdrop-blur-sm">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Ready to make learning accessible?
            </h2>
            <p className="text-slate-400 mb-8 text-lg max-w-xl mx-auto">
              Connect your Arduino, plug in a mic, and start reaching learners with disabilities
              in minutes — no configuration needed.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/captions"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 hover:from-purple-500 hover:to-blue-500 transition-all"
              >
                Start Now — It&apos;s Free
              </a>
              <a
                href="/vision"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-all"
              >
                See Vision Demo
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
