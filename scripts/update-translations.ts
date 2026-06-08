/**
 * 更新产品和案例研究的多语言翻译
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 产品多语言翻译
const productTranslations: Record<string, Record<string, any>> = {
  'sd-200': {
    ar: {
      name: 'طائرة SD-200 للاستطلاع',
      overview: 'طائرة SD-200 هي طائرة مسيرة طويلة التحمل مصممة لمهام المراقبة الممتدة. مع 120 دقيقة من وقت الطيران ومدى تشغيلي 50 كم، توفر قدرات شاملة لجمع المعلومات الجوية.',
      features: 'رحلة طويلة التحمل، مستشعرات EO/IR متقدمة، رسم خرائط LiDAR، تشغيل في جميع الأحوال الجوية',
      applications: 'مراقبة الحدود، مراقبة البنية التحتية، التقييم البيئي، البحث والإنقاذ'
    },
    es: {
      name: 'UAV de Reconocimiento SD-200',
      overview: 'El SD-200 es un UAV de reconocimiento de larga duración diseñado para misiones de vigilancia extendidas. Con 120 minutos de tiempo de vuelo y alcance operativo de 50 km, proporciona capacidades integrales de recopilación de inteligencia aérea.',
      features: 'Vuelo de larga duración, Sensores EO/IR avanzados, Mapeo LiDAR, Operación todo clima',
      applications: 'Vigilancia fronteriza, Monitoreo de infraestructura, Evaluación ambiental, Búsqueda y rescate'
    },
    fr: {
      name: 'UAV de Reconnaissance SD-200',
      overview: 'Le SD-200 est un UAV de reconnaissance à longue endurance conçu pour des missions de surveillance étendues. Avec 120 minutes de temps de vol et une portée opérationnelle de 50 km, il fournit des capacités complètes de collecte de renseignement aérien.',
      features: 'Vol longue endurance, Capteurs EO/IR avancés, Cartographie LiDAR, Opération tout temps',
      applications: 'Surveillance frontalière, Surveillance d\'infrastructure, Évaluation environnementale, Recherche et sauvetage'
    },
    pt: {
      name: 'UAV de Reconhecimento SD-200',
      overview: 'O SD-200 é um UAV de reconhecimento de longa duração projetado para missões de vigilância estendidas. Com 120 minutos de tempo de voo e alcance operacional de 50 km, fornece capacidades abrangentes de coleta de inteligência aérea.',
      features: 'Voo de longa duração, Sensores EO/IR avançados, Mapeamento LiDAR, Operação em qualquer clima',
      applications: 'Vigilância de fronteira, Monitoramento de infraestrutura, Avaliação ambiental, Busca e resgate'
    },
    id: {
      name: 'UAV Pengintaian SD-200',
      overview: 'SD-200 adalah UAV pengintaian berketahanan lama yang dirancang untuk misi pengawasan yang diperpanjang. Dengan 120 menit waktu terbang dan jangkauan operasional 50 km, menyediakan kemampuan pengumpulan intelijen udara yang komprehensif.',
      features: 'Penerbangan berketahanan lama, Sensor EO/IR canggih, Pemetaan LiDAR, Operasi segala cuaca',
      applications: 'Pengawasan perbatasan, Pemantauan infrastruktur, Evaluasi lingkungan, Pencarian dan penyelamatan'
    }
  },
  'sd-350': {
    ar: {
      name: 'طائرة SD-350 متعددة الأدوار',
      overview: 'طائرة SD-350 هي منصة طائرة مسيرة متعددة الأدوار قادرة على أداء مهام متنوعة.',
      features: 'نظام حمولات معياري، خيارات مستشعرات متعددة',
      applications: 'مسح جوي، زراعة دقيقة'
    },
    es: {
      name: 'UAV Multirol SD-350',
      overview: 'El SD-350 es una plataforma UAV versátil capaz de realizar diversas misiones.',
      features: 'Sistema de carga modular, Múltiples opciones de sensores',
      applications: 'Levantamiento aéreo, Agricultura de precisión'
    },
    fr: {
      name: 'UAV Polyvalent SD-350',
      overview: 'Le SD-350 est une plateforme UAV polyvalente capable d\'effectuer diverses missions.',
      features: 'Système de charge modulaire, Plusieurs options de capteurs',
      applications: 'Levé aérien, Agriculture de précision'
    },
    pt: {
      name: 'UAV Multifuncional SD-350',
      overview: 'O SD-350 é uma plataforma UAV versátil capaz de realizar várias missões.',
      features: 'Sistema de carga modular, Múltiplas opções de sensores',
      applications: 'Levantamento aéreo, Agricultura de precisão'
    },
    id: {
      name: 'UAV Multi-peran SD-350',
      overview: 'SD-350 adalah platform UAV serbaguna yang mampu melakukan berbagai misi.',
      features: 'Sistem muatan modular, Berbagai opsi sensor',
      applications: 'Survei udara, Pertanian presisi'
    }
  },
  'sd-600': {
    ar: {
      name: 'طائرة SD-600 VTOL',
      overview: 'طائرة SD-600 هي طائرة مسيرة VTOL هجينة تجمع بين قدرة الإقلاع العمودي وكفاءة الجناح الثابت.',
      features: 'قدرة VTOL، مدى ممتد',
      applications: 'استطلاع بعيد المدى، تفتيش خطوط الأنابيب'
    },
    es: {
      name: 'UAV VTOL SD-600',
      overview: 'El SD-600 es un UAV VTOL híbrido que combina capacidad de despegue vertical con eficiencia de ala fija.',
      features: 'Capacidad VTOL, Alcance extendido',
      applications: 'Reconocimiento de largo alcance, Inspección de tuberías'
    },
    fr: {
      name: 'UAV VTOL SD-600',
      overview: 'Le SD-600 est un UAV VTOL hybride combinant capacité de décollage vertical et efficacité à voilure fixe.',
      features: 'Capacité VTOL, Portée étendue',
      applications: 'Reconnaissance à longue portée, Inspection de pipelines'
    },
    pt: {
      name: 'UAV VTOL SD-600',
      overview: 'O SD-600 é um UAV VTOL híbrido combinando capacidade de decolagem vertical com eficiência de asa fixa.',
      features: 'Capacidade VTOL, Alcance estendido',
      applications: 'Reconhecimento de longo alcance, Inspeção de dutos'
    },
    id: {
      name: 'UAV VTOL SD-600',
      overview: 'SD-600 adalah UAV VTOL hibrida yang menggabungkan kemampuan lepas landas vertikal dengan efisiensi sayap tetap.',
      features: 'Kemampuan VTOL, Jangkauan diperpanjang',
      applications: 'Pengintaian jarak jauh, Inspeksi pipa'
    }
  },
  'pl-100': {
    ar: {
      name: 'حمولة PL-100 EO/IR',
      overview: 'حمولة PL-100 هي حمولة كهروضوئية/تحت حمراء عالية الأداء.',
      features: 'كاميرا EO 4K، تصوير حراري، تقريب بصري 30x',
      applications: 'تحديد الأهداف، المراقبة'
    },
    es: {
      name: 'Carga Útil EO/IR PL-100',
      overview: 'El PL-100 es una carga útil electro-óptica/infrarroja de alto rendimiento.',
      features: 'Cámara EO 4K, Imagen térmica, Zoom óptico 30x',
      applications: 'Identificación de objetivos, Vigilancia'
    },
    fr: {
      name: 'Charge Utile EO/IR PL-100',
      overview: 'Le PL-100 est une charge utile électro-optique/infrarouge haute performance.',
      features: 'Caméra EO 4K, Imagerie thermique, Zoom optique 30x',
      applications: 'Identification de cibles, Surveillance'
    },
    pt: {
      name: 'Carga Útil EO/IR PL-100',
      overview: 'O PL-100 é uma carga útil eletro-óptica/infravermelho de alto desempenho.',
      features: 'Câmera EO 4K, Imagem térmica, Zoom óptico 30x',
      applications: 'Identificação de alvos, Vigilância'
    },
    id: {
      name: 'Muatan EO/IR PL-100',
      overview: 'PL-100 adalah muatan elektro-optik/inframerah berkinerja tinggi.',
      features: 'Kamera EO 4K, Pencitraan termal, Zoom optik 30x',
      applications: 'Identifikasi target, Pengawasan'
    }
  },
  'cuas-100': {
    ar: {
      name: 'نظام CUAS-100 المحمول المضاد للطائرات المسيرة',
      overview: 'نظام CUAS-100 هو نظام محمول مضاد للطائرات المسيرة يوفر الكشف والتحييد السريع.',
      features: 'تصميم محمول، استجابة سريعة',
      applications: 'أمن الفعاليات، حماية الشخصيات المهمة'
    },
    es: {
      name: 'Contra-UAS Portátil CUAS-100',
      overview: 'El CUAS-100 es un sistema contra-UAS portátil que proporciona detección y neutralización rápidas.',
      features: 'Diseño portátil, Respuesta rápida',
      applications: 'Seguridad de eventos, Protección VIP'
    },
    fr: {
      name: 'Contre-UAS Portable CUAS-100',
      overview: 'Le CUAS-100 est un système contre-UAS portable offrant détection et neutralisation rapides.',
      features: 'Conception portable, Réponse rapide',
      applications: 'Sécurité d\'événements, Protection VIP'
    },
    pt: {
      name: 'Contra-UAS Portátil CUAS-100',
      overview: 'O CUAS-100 é um sistema contra-UAS portátil fornecendo detecção e neutralização rápidas.',
      features: 'Design portátil, Resposta rápida',
      applications: 'Segurança de eventos, Proteção VIP'
    },
    id: {
      name: 'Contra-UAS Portabel CUAS-100',
      overview: 'CUAS-100 adalah sistem contra-UAS portabel yang menyediakan deteksi dan netralisasi cepat.',
      features: 'Desain portabel, Respons cepat',
      applications: 'Keamanan acara, Proteksi VIP'
    }
  }
}

// 案例研究多语言翻译
const caseStudyTranslations: Record<string, Record<string, any>> = {
  'border-surveillance-australia': {
    ar: {
      title: 'تعزيز مراقبة الحدود',
      client: 'قوة الحدود الأسترالية',
      summary: 'نشر أنظمة طائرات SD-200 و SD-600 للمراقبة الحدودية على مدار الساعة.',
      challenge: 'احتاجت أستراليا لمراقبة حدود ساحلية شاسعة.',
      solution: 'تنفيذ شبكة من طائرات SD-200 و SD-600 مع محطات أرضية GC-200.',
      outcome: 'تحقيق تغطية 95% من مناطق الحدود ذات الأولوية.'
    },
    es: {
      title: 'Mejora de Vigilancia Fronteriza',
      client: 'Frontera Australiana',
      summary: 'Despliegue de sistemas UAV SD-200 y SD-600 para vigilancia fronteriza 24/7.',
      challenge: 'Australia necesitaba monitorear vastas fronteras costeras.',
      solution: 'Implementación de red de UAVs SD-200 y SD-600 con estaciones terrestres GC-200.',
      outcome: 'Logrando 95% de cobertura de áreas fronterizas prioritarias.'
    },
    fr: {
      title: 'Amélioration de la Surveillance Frontalière',
      client: 'Force Frontalière Australienne',
      summary: 'Déploiement de systèmes UAV SD-200 et SD-600 pour surveillance frontalière 24/7.',
      challenge: 'L\'Australie devait surveiller de vastes frontières côtières.',
      solution: 'Mise en œuvre d\'un réseau d\'UAV SD-200 et SD-600 avec stations au sol GC-200.',
      outcome: 'Atteignant 95% de couverture des zones frontalières prioritaires.'
    },
    pt: {
      title: 'Aprimoramento de Vigilância de Fronteira',
      client: 'Força de Fronteira Australiana',
      summary: 'Implantação de sistemas UAV SD-200 e SD-600 para vigilância de fronteira 24/7.',
      challenge: 'A Austrália precisava monitorar vastas fronteiras costeiras.',
      solution: 'Implementação de rede de UAVs SD-200 e SD-600 com estações terrestres GC-200.',
      outcome: 'Alcançando 95% de cobertura de áreas fronteiriças prioritárias.'
    },
    id: {
      title: 'Peningkatan Pengawasan Perbatasan',
      client: 'Pasukan Perbatasan Australia',
      summary: 'Pengerahan sistem UAV SD-200 dan SD-600 untuk pengawasan perbatasan 24/7.',
      challenge: 'Australia perlu memantau perbatasan pesisir yang luas.',
      solution: 'Implementasi jaringan UAV SD-200 dan SD-600 dengan stasiun darat GC-200.',
      outcome: 'Mencapai 95% cakupan area perbatasan prioritas.'
    }
  },
  'pipeline-inspection-canada': {
    ar: {
      title: 'مراقبة سلامة خطوط الأنابيب',
      client: 'شركة طاقة كندية كبرى',
      summary: 'تفتيش آلي لشبكة خطوط أنابيب بطول 5,000 كم.',
      challenge: 'كان تفتيش خطوط الأنابيب اليدوي خطيراً ومستهلكاً للوقت.',
      solution: 'نشر طائرات SD-350 مع حمولات LiDAR PL-300 للتفتيش الآلي.',
      outcome: 'خفض تكاليف التفتيش بنسبة 75%.'
    },
    es: {
      title: 'Monitoreo de Integridad de Tuberías',
      client: 'Empresa Energética Canadiense Principal',
      summary: 'Inspección automatizada de red de tuberías de 5,000 km.',
      challenge: 'La inspección manual de tuberías era peligrosa y consumía mucho tiempo.',
      solution: 'Despliegue de UAVs SD-350 con cargas LiDAR PL-300 para inspección automatizada.',
      outcome: 'Reducción de costos de inspección en 75%.'
    },
    fr: {
      title: 'Surveillance d\'Intégrité de Pipelines',
      client: 'Grande Entreprise Énergétique Canadienne',
      summary: 'Inspection automatisée d\'un réseau de pipelines de 5 000 km.',
      challenge: 'L\'inspection manuelle des pipelines était dangereuse et chronophage.',
      solution: 'Déploiement d\'UAV SD-350 avec charges LiDAR PL-300 pour inspection automatisée.',
      outcome: 'Réduction des coûts d\'inspection de 75%.'
    },
    pt: {
      title: 'Monitoramento de Integridade de Dutos',
      client: 'Grande Empresa de Energia Canadense',
      summary: 'Inspeção automatizada de rede de dutos de 5.000 km.',
      challenge: 'A inspeção manual de dutos era perigosa e demorada.',
      solution: 'Implantação de UAVs SD-350 com cargas LiDAR PL-300 para inspeção automatizada.',
      outcome: 'Redução de custos de inspeção em 75%.'
    },
    id: {
      title: 'Pemantauan Integritas Pipa',
      client: 'Perusahaan Energi Kanada Besar',
      summary: 'Inspeksi otomatis jaringan pipa 5.000 km.',
      challenge: 'Inspeksi pipa manual berbahaya dan memakan waktu.',
      solution: 'Pengerahan UAV SD-350 dengan muatan LiDAR PL-300 untuk inspeksi otomatis.',
      outcome: 'Pengurangan biaya inspeksi 75%.'
    }
  }
}

async function updateTranslations() {
  console.log('🚀 开始更新多语言翻译...\n')

  try {
    // 更新产品翻译
    console.log('📦 更新产品翻译...')

    for (const [slug, translations] of Object.entries(productTranslations)) {
      const { data: product } = await supabase
        .from('products')
        .select('id, translations')
        .eq('slug', slug)
        .single()

      if (product) {
        const updatedTranslations = {
          ...product.translations,
          ...translations
        }

        const { error } = await supabase
          .from('products')
          .update({ translations: updatedTranslations })
          .eq('id', product.id)

        if (error) {
          console.error(`   ❌ ${slug} 更新失败:`, error)
        } else {
          const langs = Object.keys(updatedTranslations)
          console.log(`   ✅ ${slug} (${langs.length} 种语言)`)
        }
      }
    }

    console.log()

    // 更新案例研究翻译
    console.log('📖 更新案例研究翻译...')

    for (const [slug, translations] of Object.entries(caseStudyTranslations)) {
      const { data: caseStudy } = await supabase
        .from('case_studies')
        .select('id, translations')
        .eq('slug', slug)
        .single()

      if (caseStudy) {
        const updatedTranslations = {
          ...caseStudy.translations,
          ...translations
        }

        const { error } = await supabase
          .from('case_studies')
          .update({ translations: updatedTranslations })
          .eq('id', caseStudy.id)

        if (error) {
          console.error(`   ❌ ${slug} 更新失败:`, error)
        } else {
          const langs = Object.keys(updatedTranslations)
          console.log(`   ✅ ${slug} (${langs.length} 种语言)`)
        }
      }
    }

    console.log('\n✅ 多语言翻译更新完成!')

  } catch (error) {
    console.error('\n❌ 更新失败:', error)
    process.exit(1)
  }
}

updateTranslations()
