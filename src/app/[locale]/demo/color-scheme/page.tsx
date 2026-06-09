import Link from 'next/link'
import { ArrowRight, Shield, Crosshair, Radio, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * 深空工业风配色演示
 * 核心原则：少即是多，让产品说话
 * 背景：深空黑 #0A0E17
 * 主色：纯白 #FFFFFF
 * 强调：电光蓝 #0066FF（仅用于CTA）
 * 辅助：深灰 #1A1F2E
 */

const DEEP_SPACE = '#0A0E17'
const PURE_WHITE = '#FFFFFF'
const ELECTRIC_BLUE = '#0066FF'
const DEEP_GRAY = '#1A1F2E'
const MUTED_TEXT = 'rgba(255,255,255,0.5)'

export default function ColorSchemeDemo() {
  return (
    <div style={{ background: DEEP_SPACE, color: PURE_WHITE, minHeight: '100vh' }}>
      {/* ====== 导航栏 ====== */}
      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center" style={{ border: `1px solid ${ELECTRIC_BLUE}` }}>
              <span className="text-sm font-bold" style={{ color: ELECTRIC_BLUE }}>SD</span>
            </div>
            <span className="text-lg font-semibold tracking-wide">SEEKDRONE</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: MUTED_TEXT }}>
            <span className="hover:text-white cursor-pointer transition-colors">产品</span>
            <span className="hover:text-white cursor-pointer transition-colors">解决方案</span>
            <span className="hover:text-white cursor-pointer transition-colors">案例</span>
            <span className="hover:text-white cursor-pointer transition-colors">支持</span>
          </div>
          <Button
            size="sm"
            className="text-sm font-medium"
            style={{ background: ELECTRIC_BLUE, color: PURE_WHITE }}
          >
            获取报价
          </Button>
        </div>
      </nav>

      {/* ====== Hero ====== */}
      <section className="relative overflow-hidden">
        {/* 背景网格 */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="container mx-auto px-6 py-24 lg:py-32 relative">
          <div className="max-w-3xl">
            {/* 标签 */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium mb-8"
              style={{ border: `1px solid rgba(0,102,255,0.3)`, color: ELECTRIC_BLUE, background: 'rgba(0,102,255,0.08)' }}
            >
              <Crosshair className="w-3 h-3" />
              工业级无人机系统
            </div>

            {/* 标题 */}
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight">
              战场验证的
              <br />
              无人机平台
            </h1>

            {/* 描述 */}
            <p className="text-lg lg:text-xl mb-10 leading-relaxed" style={{ color: MUTED_TEXT, maxWidth: '560px' }}>
              为国防、安全和关键基础设施提供经过实战检验的无人机平台和反无人机解决方案
            </p>

            {/* CTA */}
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="text-base font-medium px-8"
                style={{ background: ELECTRIC_BLUE, color: PURE_WHITE }}
              >
                立即咨询
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8"
                style={{ borderColor: 'rgba(255,255,255,0.2)', color: PURE_WHITE, background: 'transparent' }}
              >
                浏览产品
              </Button>
            </div>

            {/* 数据指标 */}
            <div className="flex gap-12 mt-16 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <div className="text-3xl font-bold" style={{ color: ELECTRIC_BLUE }}>50+</div>
                <div className="text-sm mt-1" style={{ color: MUTED_TEXT }}>国家部署</div>
              </div>
              <div>
                <div className="text-3xl font-bold" style={{ color: ELECTRIC_BLUE }}>10万+</div>
                <div className="text-sm mt-1" style={{ color: MUTED_TEXT }}>飞行小时</div>
              </div>
              <div>
                <div className="text-3xl font-bold" style={{ color: ELECTRIC_BLUE }}>99.7%</div>
                <div className="text-sm mt-1" style={{ color: MUTED_TEXT }}>任务成功率</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== 产品展示 ====== */}
      <section style={{ background: DEEP_GRAY }}>
        <div className="container mx-auto px-6 py-20 lg:py-28">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold">产品系列</h2>
              <p className="mt-2 text-sm" style={{ color: MUTED_TEXT }}>覆盖全场景的工业级无人机解决方案</p>
            </div>
            <Link href="#" className="text-sm flex items-center gap-1 hover:gap-2 transition-all" style={{ color: ELECTRIC_BLUE }}>
              查看全部 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Crosshair,
                model: 'SD-800',
                name: '战术侦察无人机',
                desc: '长航时、高隐蔽性，适用于战场侦察与监视',
                specs: ['续航 8h', '航程 200km', '载荷 5kg'],
              },
              {
                icon: Shield,
                model: 'SD-400',
                name: '反无人机系统',
                desc: '多手段探测与拦截，保护关键空域安全',
                specs: ['探测 10km', '拦截 3km', '360°覆盖'],
              },
              {
                icon: Radio,
                model: 'SD-1200',
                name: '通信中继平台',
                desc: '高空持久驻留，构建战场通信网络',
                specs: ['续航 24h', '覆盖 50km', '多频段'],
              },
            ].map((product) => (
              <div
                key={product.model}
                className="group p-6 lg:p-8 transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: DEEP_SPACE,
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {/* 产品图标 */}
                <div
                  className="w-12 h-12 flex items-center justify-center mb-6"
                  style={{ border: `1px solid rgba(0,102,255,0.2)`, background: 'rgba(0,102,255,0.05)' }}
                >
                  <product.icon className="w-5 h-5" style={{ color: ELECTRIC_BLUE }} />
                </div>

                {/* 型号 */}
                <div className="text-xs font-mono mb-2" style={{ color: ELECTRIC_BLUE }}>{product.model}</div>

                {/* 名称 */}
                <h3 className="text-xl font-semibold mb-3">{product.name}</h3>

                {/* 描述 */}
                <p className="text-sm mb-6 leading-relaxed" style={{ color: MUTED_TEXT }}>{product.desc}</p>

                {/* 规格 */}
                <div className="flex gap-4 mb-6">
                  {product.specs.map((spec) => (
                    <div key={spec} className="text-xs px-2 py-1 font-mono" style={{ background: 'rgba(255,255,255,0.04)', color: MUTED_TEXT }}>
                      {spec}
                    </div>
                  ))}
                </div>

                {/* 链接 */}
                <Link
                  href="#"
                  className="text-sm flex items-center gap-1 group-hover:gap-2 transition-all"
                  style={{ color: ELECTRIC_BLUE }}
                >
                  了解详情 <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== 解决方案 ====== */}
      <section>
        <div className="container mx-auto px-6 py-20 lg:py-28">
          <div className="text-center mb-16">
            <h2 className="text-2xl lg:text-3xl font-bold">行业解决方案</h2>
            <p className="mt-2 text-sm" style={{ color: MUTED_TEXT }}>为不同场景提供专业定制方案</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['国防安全', '能源巡检', '应急救援', '边境巡逻'].map((item, i) => (
              <div
                key={item}
                className="p-6 text-center transition-all duration-300 hover:bg-white/[0.02]"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="text-3xl font-bold mb-2" style={{ color: ELECTRIC_BLUE }}>0{i + 1}</div>
                <div className="text-sm font-medium">{item}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== CTA ====== */}
      <section style={{ background: DEEP_GRAY }}>
        <div className="container mx-auto px-6 py-20 lg:py-28 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">准备部署您的无人机系统？</h2>
          <p className="mb-10 max-w-xl mx-auto" style={{ color: MUTED_TEXT }}>
            我们的团队将为您提供专业的需求分析与方案定制
          </p>
          <Button
            size="lg"
            className="text-base font-medium px-10"
            style={{ background: ELECTRIC_BLUE, color: PURE_WHITE }}
          >
            联系我们的专家
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* ====== Footer ====== */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center" style={{ border: `1px solid ${ELECTRIC_BLUE}` }}>
                <span className="text-sm font-bold" style={{ color: ELECTRIC_BLUE }}>SD</span>
              </div>
              <span className="text-sm font-semibold tracking-wide">SEEKDRONE</span>
            </div>
            <div className="text-xs" style={{ color: MUTED_TEXT }}>
              © 2026 SeekDrone. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
