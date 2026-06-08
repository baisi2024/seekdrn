/**
 * 批量补充所有产品和案例的多语言翻译
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 翻译模板
const translations = {
  // 产品翻译
  products: {
    'sd-500': {
      ar: { name: 'طائرة SD-500 للرفع الثقيل', overview: 'طائرة SD-500 هي طائرة مسيرة للشحن الثقيل مصممة لنقل حمولات كبيرة.', features: 'قدرة رفع ثقيلة، هيكل معزز، هبوط دقيق', applications: 'نقل البضائع، توصيل الإمدادات الطبية، الإغاثة في الكوارث' },
      es: { name: 'UAV de Carga Pesada SD-500', overview: 'El SD-500 es un UAV de carga pesada diseñado para transporte de cargas sustanciales.', features: 'Capacidad de carga pesada, Estructura reforzada, Aterrizaje de precisión', applications: 'Transporte de carga, Entrega de suministros médicos, Ayuda en desastres' },
      fr: { name: 'UAV à Forte Charge SD-500', overview: 'Le SD-500 est un UAV à forte charge conçu pour le transport de charges substantielles.', features: 'Capacité de charge lourde, Structure renforcée, Atterrissage de précision', applications: 'Transport de marchandises, Livraison de fournitures médicales, Secours en cas de catastrophe' },
      pt: { name: 'UAV de Carga Pesada SD-500', overview: 'O SD-500 é um UAV de carga pesada projetado para transporte de cargas substanciais.', features: 'Capacidade de carga pesada, Estrutura reforçada, Pouso de precisão', applications: 'Transporte de carga, Entrega de suprimentos médicos, Ajuda em desastres' },
      id: { name: 'UAV Angkut Berat SD-500', overview: 'SD-500 adalah UAV angkut berat yang dirancang untuk transportasi muatan substansial.', features: 'Kapasitas angkut berat, Struktur diperkuat, Pendaratan presisi', applications: 'Transportasi kargo, Pengiriman pasokan medis, Bantuan bencana' }
    },
    'pl-200': {
      ar: { name: 'حمولة PL-200 متعددة الأطياف', overview: 'حمولة PL-200 متعددة الأطياف تلتقط البيانات عبر 5 نطاقات طيفية.', features: '5 نطاقات طيفية، دقة عالية، معايرة إشعاعية', applications: 'الزراعة الدقيقة، صحة الغطاء النباتي، مراقبة بيئية' },
      es: { name: 'Carga Multiespectral PL-200', overview: 'La carga multiespectral PL-200 captura datos a través de 5 bandas espectrales.', features: '5 bandas espectrales, Alta resolución, Calibración radiométrica', applications: 'Agricultura de precisión, Salud vegetal, Monitoreo ambiental' },
      fr: { name: 'Charge Multispectrale PL-200', overview: 'La charge multispectrale PL-200 capture des données sur 5 bandes spectrales.', features: '5 bandes spectrales, Haute résolution, Calibration radiométrique', applications: 'Agriculture de précision, Santé végétale, Surveillance environnementale' },
      pt: { name: 'Carga Multiespectral PL-200', overview: 'A carga multiespectral PL-200 captura dados em 5 bandas espectrais.', features: '5 bandas espectrais, Alta resolução, Calibração radiométrica', applications: 'Agricultura de precisão, Saúde vegetal, Monitoramento ambiental' },
      id: { name: 'Muatan Multispektral PL-200', overview: 'Muatan multispektral PL-200 menangkap data melalui 5 band spektral.', features: '5 band spektral, Resolusi tinggi, Kalibrasi radiometrik', applications: 'Pertanian presisi, Kesehatan vegetasi, Pemantauan lingkungan' }
    },
    'pl-300': {
      ar: { name: 'حمولة PL-300 LiDAR', overview: 'حمولة PL-300 LiDAR تولد سحب نقاط ثلاثية الأبعاد عالية الكثافة.', features: 'كثافة نقاط عالية، دقة سنتيمترية، مدى طويل', applications: 'مسح تضاريسي، نمذجة ثلاثية الأبعاد، التعدين' },
      es: { name: 'Carga LiDAR PL-300', overview: 'La carga LiDAR PL-300 genera nubes de puntos 3D de alta densidad.', features: 'Alta densidad de puntos, Precisión centimétrica, Largo alcance', applications: 'Levantamiento topográfico, Modelado 3D, Minería' },
      fr: { name: 'Charge LiDAR PL-300', overview: 'La charge LiDAR PL-300 génère des nuages de points 3D haute densité.', features: 'Haute densité de points, Précision centimétrique, Longue portée', applications: 'Levé topographique, Modélisation 3D, Exploitation minière' },
      pt: { name: 'Carga LiDAR PL-300', overview: 'A carga LiDAR PL-300 gera nuvens de pontos 3D de alta densidade.', features: 'Alta densidade de pontos, Precisão centimétrica, Longo alcance', applications: 'Levantamento topográfico, Modelagem 3D, Mineração' },
      id: { name: 'Muatan LiDAR PL-300', overview: 'Muatan LiDAR PL-300 menghasilkan awan titik 3D densitas tinggi.', features: 'Densitas titik tinggi, Presisi sentimeter, Jangkauan jauh', applications: 'Survei topografi, Pemodelan 3D, Pertambangan' }
    },
    'gc-100': {
      ar: { name: 'محطة أرضية محمولة GC-100', overview: 'محطة GC-100 هي محطة تحكم أرضية خفيفة الوزن مع شاشة قابلة للقراءة في ضوء الشمس.', features: 'شاشة قابلة للقراءة في ضوء الشمس، بطارية طويلة، تدفقات فيديو مزدوجة', applications: 'عمليات ميدانية، نشر سريع، قيادة متنقلة' },
      es: { name: 'Estación Terrestre Portátil GC-100', overview: 'La GC-100 es una estación de control terrestre ligera con pantalla legible a la luz del sol.', features: 'Pantalla legible al sol, Batería duradera, Doble flujo de video', applications: 'Operaciones de campo, Despliegue rápido, Comando móvil' },
      fr: { name: 'Station au Sol Portative GC-100', overview: 'La GC-100 est une station de contrôle au sol légère avec écran lisible au soleil.', features: 'Écran lisible au soleil, Longue autonomie, Double flux vidéo', applications: 'Opérations terrain, Déploiement rapide, Commandement mobile' },
      pt: { name: 'Estação Terrestre Portátil GC-100', overview: 'A GC-100 é uma estação de controle terrestre leve com tela legível ao sol.', features: 'Tela legível ao sol, Bateria duradoura, Fluxo de vídeo duplo', applications: 'Operações de campo, Implantação rápida, Comando móvel' },
      id: { name: 'Stasiun Darat Portabel GC-100', overview: 'GC-100 adalah stasiun kontrol darat ringan dengan layar dapat dibaca di bawah sinar matahari.', features: 'Layar dapat dibaca matahari, Baterai tahan lama, Aliran video ganda', applications: 'Operasi lapangan, Pengerahan cepat, Komando mobile' }
    },
    'gc-200': {
      ar: { name: 'محطة أرضية مركبة GC-200', overview: 'محطة GC-200 هي محطة تحكم أرضية مركبة على مركبة مع شاشات مزدوجة.', features: 'شاشات مزدوجة، اتصالات متكررة، دعم متعدد الطائرات', applications: 'عمليات مركبة، مهام متعددة الطائرات، مراقبة ممتدة' },
      es: { name: 'Estación Terrestre Vehicular GC-200', overview: 'La GC-200 es una estación de control terrestre montada en vehículo con monitores dobles.', features: 'Monitores dobles, Comunicaciones redundantes, Soporte multi-UAV', applications: 'Operaciones vehiculares, Misiones multi-UAV, Vigilancia extendida' },
      fr: { name: 'Station au Sol Véhicule GC-200', overview: 'La GC-200 est une station de contrôle au sol montée sur véhicule avec écrans doubles.', features: 'Écrans doubles, Communications redondantes, Support multi-UAV', applications: 'Opérations véhicules, Missions multi-UAV, Surveillance étendue' },
      pt: { name: 'Estação Terrestre Veicular GC-200', overview: 'A GC-200 é uma estação de controle terrestre montada em veículo com monitores duplos.', features: 'Monitores duplos, Comunicações redundantes, Suporte multi-UAV', applications: 'Operações veiculares, Missões multi-UAV, Vigilância estendida' },
      id: { name: 'Stasiun Darat Kendaraan GC-200', overview: 'GC-200 adalah stasiun kontrol darat terpasang kendaraan dengan monitor ganda.', features: 'Monitor ganda, Komunikasi redundan, Dukungan multi-UAV', applications: 'Operasi kendaraan, Misi multi-UAV, Pengawasan diperpanjang' }
    },
    'cuas-200': {
      ar: { name: 'نظام CUAS-200 الثابت المضاد للطائرات', overview: 'نظام CUAS-200 هو نظام ثابت المضاد للطائرات مع تغطية 360 درجة.', features: 'تغطية 360 درجة، كشف متعدد الطبقات، تتبع متعدد الأهداف', applications: 'المطارات، القواعد العسكرية، محطات الطاقة' },
      es: { name: 'Contra-UAS Fijo CUAS-200', overview: 'El CUAS-200 es un sistema contra-UAS fijo con cobertura de 360°.', features: 'Cobertura 360°, Detección multicapa, Seguimiento multiobjetivo', applications: 'Aeropuertos, Bases militares, Plantas de energía' },
      fr: { name: 'Contre-UAS Fixe CUAS-200', overview: 'Le CUAS-200 est un système contre-UAS fixe avec couverture 360°.', features: 'Couverture 360°, Détection multicouche, Pistage multi-cibles', applications: 'Aéroports, Bases militaires, Centrales énergétiques' },
      pt: { name: 'Contra-UAS Fixo CUAS-200', overview: 'O CUAS-200 é um sistema contra-UAS fixo com cobertura de 360°.', features: 'Cobertura 360°, Detecção multicamada, Rastreamento multi-alvo', applications: 'Aeroportos, Bases militares, Usinas de energia' },
      id: { name: 'Contra-UAS Tetap CUAS-200', overview: 'CUAS-200 adalah sistem contra-UAS tetap dengan cakupan 360°.', features: 'Cakupan 360°, Deteksi multi-lapis, Pelacakan multi-target', applications: 'Bandara, Pangkalan militer, Pembangkit listrik' }
    },
    'pl-400': {
      ar: { name: 'حمولة PL-400 SAR', overview: 'حمولة PL-400 SAR توفر قدرات تصوير في جميع الأحوال الجوية ليلًا ونهارًا.', features: 'تشغيل في جميع الأحوال الجوية، دقة عالية، swath واسع', applications: 'مراقبة في جميع الأحوال الجوية، مراقبة الكوارث' },
      es: { name: 'Carga SAR PL-400', overview: 'La carga SAR PL-400 proporciona capacidades de imagen todo clima día/noche.', features: 'Operación todo clima, Alta resolución, Ancho de barrido amplio', applications: 'Vigilancia todo clima, Monitoreo de desastres' },
      fr: { name: 'Charge SAR PL-400', overview: 'La charge SAR PL-400 fournit des capacités d\'imagerie tout temps jour/nuit.', features: 'Opération tout temps, Haute résolution, Large fauchage', applications: 'Surveillance tout temps, Surveillance de catastrophes' },
      pt: { name: 'Carga SAR PL-400', overview: 'A carga SAR PL-400 fornece capacidades de imagem todo clima dia/noite.', features: 'Operação todo clima, Alta resolução, Largura de varredura ampla', applications: 'Vigilância todo clima, Monitoramento de desastres' },
      id: { name: 'Muatan SAR PL-400', overview: 'Muatan SAR PL-400 menyediakan kemampuan pencitraan segala cuaca siang/malam.', features: 'Operasi segala cuaca, Resolusi tinggi, Sapuan lebar', applications: 'Pengawasan segala cuaca, Pemantauan bencana' }
    },
    'sd-700': {
      ar: { name: 'طائرة SD-700 HALE', overview: 'طائرة SD-700 هي طائرة مسيرة عالية الارتفاع طويلة التحمع مع قدرة طيران 24 ساعة.', features: 'تحمل 24 ساعة، مساعدة شمسية، عملية عالية الارتفاع', applications: 'مراقبة مستمرة، مراقبة الحدود، بحث بيئي' },
      es: { name: 'UAV HALE SD-700', overview: 'El SD-700 es un UAV de gran altitud y larga endurance con capacidad de vuelo de 24 horas.', features: 'Endurance de 24 horas, Asistencia solar, Operación a gran altitud', applications: 'Vigilancia persistente, Monitoreo fronterizo, Investigación ambiental' },
      fr: { name: 'UAV HALE SD-700', overview: 'Le SD-700 est un UAV à haute altitude et longue endurance avec capacité de vol de 24 heures.', features: 'Endurance de 24 heures, Assistance solaire, Opération haute altitude', applications: 'Surveillance persistante, Surveillance frontalière, Recherche environnementale' },
      pt: { name: 'UAV HALE SD-700', overview: 'O SD-700 é um UAV de alta altitude e longa duração com capacidade de voo de 24 horas.', features: 'Duração de 24 horas, Assistência solar, Operação em alta altitude', applications: 'Vigilância persistente, Monitoramento de fronteira, Pesquisa ambiental' },
      id: { name: 'UAV HALE SD-700', overview: 'SD-700 adalah UAV ketinggian tinggi berketahanan lama dengan kemampuan terbang 24 jam.', features: 'Ketahanan 24 jam, Bantuan tenaga surya, Operasi ketinggian tinggi', applications: 'Pengawasan persisten, Pemantauan perbatasan, Penelitian lingkungan' }
    },
    'gc-300': {
      ar: { name: 'مركز القيادة والتحكم GC-300', overview: 'مركز GC-300 هو مركز قيادة وتحكم شامل يدعم عمليات متعددة المشغلين.', features: 'دعم متعدد المشغلين، إدارة متعددة الطائرات، تخطيط مهام متقدم', applications: 'مراكز العمليات، إدارة الأسطول، مرافق التدريب' },
      es: { name: 'Centro de Comando y Control GC-300', overview: 'El GC-300 es un centro de comando y control integral que soporta operaciones multi-operador.', features: 'Soporte multi-operador, Gestión multi-UAV, Planificación avanzada de misiones', applications: 'Centros de operaciones, Gestión de flota, Instalaciones de entrenamiento' },
      fr: { name: 'Centre de Commandement GC-300', overview: 'Le GC-300 est un centre de commandement complet supportant les opérations multi-opérateurs.', features: 'Support multi-opérateur, Gestion multi-UAV, Planification avancée de missions', applications: 'Centres d\'opérations, Gestion de flotte, Installations d\'entraînement' },
      pt: { name: 'Centro de Comando e Controle GC-300', overview: 'O GC-300 é um centro de comando e controle abrangente suportando operações multi-operador.', features: 'Suporte multi-operador, Gestão multi-UAV, Planejamento avançado de missões', applications: 'Centros de operações, Gestão de frota, Instalações de treinamento' },
      id: { name: 'Pusat Komando dan Kontrol GC-300', overview: 'GC-300 adalah pusat komando dan kontrol komprehensif mendukung operasi multi-operator.', features: 'Dukungan multi-operator, Manajemen multi-UAV, Perencanaan misi lanjutan', applications: 'Pusat operasi, Manajemen armada, Fasilitas pelatihan' }
    },
    'cuas-300': {
      ar: { name: 'نظام CUAS-300 المتنقل المضاد للطائرات', overview: 'نظام CUAS-300 هو نظام متنقل مضاد للطائرات مركب على مركبات.', features: 'تشغيل متنقل، مدى ممتد، اندماج متعدد المستشعرات', applications: 'حماية القوافل، أمن متنقل، نشر سريع' },
      es: { name: 'Contra-UAS Móvil CUAS-300', overview: 'El CUAS-300 es un sistema contra-UAS móvil montado en vehículos.', features: 'Operación móvil, Alcance extendido, Fusión multisensor', applications: 'Protección de convoyes, Seguridad móvil, Despliegue rápido' },
      fr: { name: 'Contre-UAS Mobile CUAS-300', overview: 'Le CUAS-300 est un système contre-UAS mobile monté sur véhicules.', features: 'Opération mobile, Portée étendue, Fusion multicapteur', applications: 'Protection de convois, Sécurité mobile, Déploiement rapide' },
      pt: { name: 'Contra-UAS Móvel CUAS-300', overview: 'O CUAS-300 é um sistema contra-UAS móvel montado em veículos.', features: 'Operação móvel, Alcance estendido, Fusão multissensores', applications: 'Proteção de comboios, Segurança móvel, Implantação rápida' },
      id: { name: 'Contra-UAS Mobile CUAS-300', overview: 'CUAS-300 adalah sistem contra-UAS mobile terpasang kendaraan.', features: 'Operasi mobile, Jangkauan diperpanjang, Fusi multi-sensor', applications: 'Proteksi konvoi, Keamanan mobile, Pengerahan cepat' }
    },
    'pl-500': {
      ar: { name: 'حمولة PL-500 SIGINT', overview: 'حمولة PL-500 هي حمولة استخبارات إشارات قادرة على عمليات COMINT وELINT.', features: 'نطاق تردد واسع، تحليل في الوقت الحقيقي، روابط بيانات مشفرة', applications: 'اعتراض الإشارات، مراقبة الطيف، دعم الحرب الإلكترونية' },
      es: { name: 'Carga SIGINT PL-500', overview: 'La carga PL-500 es una carga de inteligencia de señales capaz de operaciones COMINT y ELINT.', features: 'Amplio rango de frecuencias, Análisis en tiempo real, Enlaces de datos cifrados', applications: 'Intercepción de señales, Monitoreo de espectro, Apoyo a guerra electrónica' },
      fr: { name: 'Charge SIGINT PL-500', overview: 'La charge PL-500 est une charge de renseignement d\'signaux capable d\'opérations COMINT et ELINT.', features: 'Large gamme de fréquences, Analyse en temps réel, Liaisons de données chiffrées', applications: 'Interception de signaux, Surveillance du spectre, Soutien guerre électronique' },
      pt: { name: 'Carga SIGINT PL-500', overview: 'A carga PL-500 é uma carga de inteligência de sinais capaz de operações COMINT e ELINT.', features: 'Ampla faixa de frequências, Análise em tempo real, Links de dados criptografados', applications: 'Interceptação de sinais, Monitoramento de espectro, Apoio à guerra eletrônica' },
      id: { name: 'Muatan SIGINT PL-500', overview: 'PL-500 adalah muatan intelijen sinyal mampu operasi COMINT dan ELINT.', features: 'Rentang frekuensi lebar, Analisis real-time, Link data terenkripsi', applications: 'Intersepsi sinyal, Pemantauan spektrum, Dukungan perang elektronik' }
    },
    'sd-800': {
      ar: { name: 'طائرة SD-800 السرب', overview: 'طائرة SD-800 هي طائرة مسيرة خفيفة قادرة على العمل في سرب مع تنسيق AI.', features: 'قدرة السرب، تنسيق AI، تصميم خفيف', applications: 'تشبع المنطقة، استشعار موزع، عمليات طعم' },
      es: { name: 'UAV Enjambre SD-800', overview: 'El SD-800 es un UAV ligero capaz de operar en enjambre con coordinación AI.', features: 'Capacidad de enjambre, Coordinación AI, Diseño ligero', applications: 'Saturación de área, Sensor distribuido, Operaciones señuelo' },
      fr: { name: 'UAV Essaim SD-800', overview: 'Le SD-800 est un UAV léger capable d\'opérer en essaim avec coordination IA.', features: 'Capacité essaim, Coordination IA, Conception légère', applications: 'Saturation de zone, Capteur distribué, Opérations leurres' },
      pt: { name: 'UAV Enxame SD-800', overview: 'O SD-800 é um UAV leve capaz de operar em enxame com coordenação IA.', features: 'Capacidade de enxame, Coordenação IA, Design leve', applications: 'Saturação de área, Sensor distribuído, Operações isca' },
      id: { name: 'UAV Swarm SD-800', overview: 'SD-800 adalah UAV ringan mampu beroperasi dalam swarm dengan koordinasi AI.', features: 'Kemampuan swarm, Koordinasi AI, Desain ringan', applications: 'Saturasi area, Sensor terdistribusi, Operasi umpan' }
    },
    'sd-900': {
      ar: { name: 'طائرة SD-900 البحرية', overview: 'طائرة SD-900 هي طائرة مسيرة بحرية مع قدرة الهبوط على الماء.', features: 'هبوط على الماء، تحمل ممتد، مستشعرات بحرية', applications: 'دوريات بحرية، بحث وإنقاذ، مراقبة مصائد الأسماك' },
      es: { name: 'UAV Marítimo SD-900', overview: 'El SD-900 es un UAV marítimo con capacidad de amerizaje.', features: 'Amerizaje, Endurance extendida, Sensores marítimos', applications: 'Patrulla marítima, Búsqueda y rescate, Monitoreo pesquero' },
      fr: { name: 'UAV Maritime SD-900', overview: 'Le SD-900 est un UAV maritime avec capacité d\'amerrissage.', features: 'Amerrissage, Endurance étendue, Capteurs maritimes', applications: 'Patrouille maritime, Recherche et sauvetage, Surveillance pêche' },
      pt: { name: 'UAV Marítimo SD-900', overview: 'O SD-900 é um UAV marítimo com capacidade de amerissagem.', features: 'Amerissagem, Duração estendida, Sensores marítimos', applications: 'Patrulha marítima, Busca e resgate, Monitoramento pesqueiro' },
      id: { name: 'UAV Maritim SD-900', overview: 'SD-900 adalah UAV maritim dengan kemampuan pendaratan air.', features: 'Pendaratan air, Ketahanan diperpanjang, Sensor maritim', applications: 'Patroli maritim, Pencarian dan penyelamatan, Pemantauan perikanan' }
    },
    'pl-600': {
      ar: { name: 'حمولة PL-600 فرط الطيف', overview: 'حمولة PL-600 هي حمولة تصوير فرط الطيف تلتقط 100+ نطاق طيفي.', features: '100+ نطاق طيفي، دقة مكانية عالية، تحديد المواد', applications: 'استكشاف المعادن، الزراعة الدقيقة، مراقبة بيئية' },
      es: { name: 'Carga Hiperespectral PL-600', overview: 'La carga PL-600 es una carga de imagen hiperespectral que captura 100+ bandas espectrales.', features: '100+ bandas espectrales, Alta resolución espacial, Identificación de materiales', applications: 'Exploración mineral, Agricultura de precisión, Monitoreo ambiental' },
      fr: { name: 'Charge Hyperspectrale PL-600', overview: 'La charge PL-600 est une charge d\'imagerie hyperspectrale capturant 100+ bandes spectrales.', features: '100+ bandes spectrales, Haute résolution spatiale, Identification de matériaux', applications: 'Exploration minérale, Agriculture de précision, Surveillance environnementale' },
      pt: { name: 'Carga Hiperespectral PL-600', overview: 'A carga PL-600 é uma carga de imagem hiperespectral capturando 100+ bandas espectrais.', features: '100+ bandas espectrais, Alta resolução espacial, Identificação de materiais', applications: 'Exploração mineral, Agricultura de precisão, Monitoramento ambiental' },
      id: { name: 'Muatan Hiperspektral PL-600', overview: 'PL-600 adalah muatan pencitraan hiperspektral menangkap 100+ band spektral.', features: '100+ band spektral, Resolusi spasial tinggi, Identifikasi material', applications: 'Eksplorasi mineral, Pertanian presisi, Pemantauan lingkungan' }
    },
    'cuas-400': {
      ar: { name: 'نظام CUAS-400 المتكامل المضاد للطائرات', overview: 'نظام CUAS-400 هو حل متكامل شامل مضاد للطائرات يجمع طرق كشف متعددة.', features: 'دفاع متعدد الطبقات، تدابير مضادة متعددة، تكامل ATC', applications: 'المطارات، الحدود الوطنية، البنية التحتية الحيوية' },
      es: { name: 'Contra-UAS Integrado CUAS-400', overview: 'El CUAS-400 es una solución contra-UAS integrada que combina múltiples métodos de detección.', features: 'Defensa multicapa, Múltiples contramedidas, Integración ATC', applications: 'Aeropuertos, Fronteras nacionales, Infraestructura crítica' },
      fr: { name: 'Contre-UAS Intégré CUAS-400', overview: 'Le CUAS-400 est une solution contre-UAS intégrée combinant multiples méthodes de détection.', features: 'Défense multicouche, Multiples contre-mesures, Intégration ATC', applications: 'Aéroports, Frontières nationales, Infrastructure critique' },
      pt: { name: 'Contra-UAS Integrado CUAS-400', overview: 'O CUAS-400 é uma solução contra-UAS integrada combinando múltiplos métodos de detecção.', features: 'Defesa multicamada, Múltiplas contramedidas, Integração ATC', applications: 'Aeroportos, Fronteiras nacionais, Infraestrutura crítica' },
      id: { name: 'Contra-UAS Terintegrasi CUAS-400', overview: 'CUAS-400 adalah solusi contra-UAS terintegrasi menggabungkan berbagai metode deteksi.', features: 'Pertahanan multi-lapis, Berbagai kontramedida, Integrasi ATC', applications: 'Bandara, Perbatasan nasional, Infrastruktur kritis' }
    }
  },
  // 案例研究翻译
  caseStudies: {
    'precision-agriculture-brazil': {
      ar: { title: 'تنفيذ الزراعة الدقيقة', client: 'مزرعة فول الصويا البرازيلية الكبيرة', summary: 'دمج تصوير PL-200 متعدد الأطياف لمراقبة صحة المحصول عبر 50,000 هكتار.', challenge: 'كانت مراقبة المحصول التقليدية غير متسقة ورد فعلية.', solution: 'تنفيذ مسوحات متعددة الأطياف أسبوعية باستخدام طائرات SD-350.', outcome: 'زيادة محصول المحصول بنسبة 18%، تقليل استخدام المياه بنسبة 22%.' },
      es: { title: 'Implementación de Agricultura de Precisión', client: 'Granja de Soja Brasileña Grande', summary: 'Integración de imagen multiespectral PL-200 para monitoreo de salud de cultivos en 50,000 hectáreas.', challenge: 'El monitoreo tradicional de cultivos era inconsistente y reactivo.', solution: 'Implementación de estudios multiespectrales semanales usando UAVs SD-350.', outcome: 'Aumento del rendimiento de cultivos en 18%, reducción del uso de agua en 22%.' },
      fr: { title: 'Mise en Œuvre de l\'Agriculture de Précision', client: 'Grande Ferme de Soja Brésilienne', summary: 'Intégration d\'imagerie multispectrale PL-200 pour surveillance de santé des cultures sur 50 000 hectares.', challenge: 'La surveillance traditionnelle des cultures était incohérente et réactive.', solution: 'Mise en œuvre d\'études multispectrales hebdomadaires utilisant UAV SD-350.', outcome: 'Augmentation du rendement des cultures de 18%, réduction de l\'utilisation d\'eau de 22%.' },
      pt: { title: 'Implementação de Agricultura de Precisão', client: 'Grande Fazenda de Soja Brasileira', summary: 'Integração de imagem multiespectral PL-200 para monitoramento de saúde de culturas em 50.000 hectares.', challenge: 'O monitoramento tradicional de culturas era inconsistente e reativo.', solution: 'Implementação de estudos multiespectrais semanais usando UAVs SD-350.', outcome: 'Aumento do rendimento de culturas em 18%, redução do uso de água em 22%.' },
      id: { title: 'Implementasi Pertanian Presisi', client: 'Kebun Kedelai Brasil Besar', summary: 'Integrasi pencitraan multispektral PL-200 untuk pemantauan kesehatan tanaman di 50.000 hektar.', challenge: 'Pemantauan tanaman tradisional tidak konsisten dan reaktif.', solution: 'Implementasi survei multispektral mingguan menggunakan UAV SD-350.', outcome: 'Peningkatan hasil tanaman 18%, pengurangan penggunaan air 22%.' }
    },
    'search-rescue-norway': {
      ar: { title: 'البحث والإنقاذ الجبلي', client: 'خدمة البحث والإنقاذ النرويجية', summary: 'تعزيز قدرات SAR بالطائرات المسيرة ذات التصوير الحراري لعمليات الجبال والمضايق.', challenge: 'جعل التضاريس الجبلية والمضايق عمليات SAR التقليدية بطيئة وخطيرة.', solution: 'نشر طائرات SD-200 و SD-600 مع حمولات PL-100 EO/IR للبحث الجوي السريع.', outcome: 'تقليل متوسط وقت البحث من 8 ساعات إلى ساعتين، زيادة معدل البقاء بنسبة 40%.' },
      es: { title: 'Búsqueda y Rescate en Montaña', client: 'Servicio de Búsqueda y Rescate Noruego', summary: 'Mejora de capacidades SAR con UAVs de imagen térmica para operaciones de montaña y fiordos.', challenge: 'El terreno montañoso y los fiordos hacían las operaciones SAR tradicionales lentas y peligrosas.', solution: 'Despliegue de UAVs SD-200 y SD-600 con cargas PL-100 EO/IR para búsqueda aérea rápida.', outcome: 'Reducción del tiempo promedio de búsqueda de 8 horas a 2 horas, aumento de la tasa de supervivencia en 40%.' },
      fr: { title: 'Recherche et Sauvetage en Montagne', client: 'Service de Recherche et Sauvetage Norvégien', summary: 'Amélioration des capacités SAR avec UAVs à imagerie thermique pour opérations en montagne et fjords.', challenge: 'Le terrain montagneux et les fjords rendaient les opérations SAR traditionnelles lentes et dangereuses.', solution: 'Déploiement d\'UAV SD-200 et SD-600 avec charges PL-100 EO/IR pour recherche aérienne rapide.', outcome: 'Réduction du temps de recherche moyen de 8 heures à 2 heures, augmentation du taux de survie de 40%.' },
      pt: { title: 'Busca e Resgate em Montanha', client: 'Serviço de Busca e Resgate Norueguês', summary: 'Aprimoramento de capacidades SAR com UAVs de imagem térmica para operações de montanha e fiordes.', challenge: 'O terreno montanhoso e os fiordes tornavam as operações SAR tradicionais lentas e perigosas.', solution: 'Implantação de UAVs SD-200 e SD-600 com cargas PL-100 EO/IR para busca aérea rápida.', outcome: 'Redução do tempo médio de busca de 8 horas para 2 horas, aumento da taxa de sobrevivência em 40%.' },
      id: { title: 'Pencarian dan Penyelamatan Gunung', client: 'Layanan Pencarian dan Penyelamatan Norwegia', summary: 'Peningkatan kemampuan SAR dengan UAV pencitraan termal untuk operasi gunung dan fyord.', challenge: 'Medan gunung dan fyord membuat operasi SAR tradisional lambat dan berbahaya.', solution: 'Pengerahan UAV SD-200 dan SD-600 dengan muatan PL-100 EO/IR untuk pencarian udara cepat.', outcome: 'Pengurangan waktu pencarian rata-rata dari 8 jam menjadi 2 jam, peningkatan tingkat kelangsungan hidup 40%.' }
    },
    'infrastructure-inspection-germany': {
      ar: { title: 'تفتيش شبكة الكهرباء', client: 'شركة مرافق ألمانية', summary: 'تفتيش آلي لـ 3,000 كم من خطوط نقل الكهرباء باستخدام طائرات SD-350.', challenge: 'تفتيش الأبراج اليدوي يتطلب متسلقين، كان مكلفًا، ولا يمكن تحقيق تردد التفتيش المطلوب.', solution: 'تنفيذ مسارات تفتيش آلية باستخدام طائرات SD-350 مع حمولات PL-100 EO/IR.', outcome: 'زيادة سرعة التفتيش 8 أضعاف، تقليل التكاليف بنسبة 60%.' },
      es: { title: 'Inspección de Red Eléctrica', client: 'Empresa de Servicios Alemana', summary: 'Inspección automatizada de 3,000 km de líneas de transmisión eléctrica usando UAVs SD-350.', challenge: 'La inspección manual de torres requería escaladores, era costosa, y no podía lograr la frecuencia de inspección deseada.', solution: 'Implementación de rutas de inspección automatizadas usando UAVs SD-350 con cargas PL-100 EO/IR.', outcome: 'Aumento de velocidad de inspección 8x, reducción de costos en 60%.' },
      fr: { title: 'Inspection du Réseau Électrique', client: 'Compagnie de Services Allemande', summary: 'Inspection automatisée de 3 000 km de lignes de transport électrique utilisant UAV SD-350.', challenge: 'L\'inspection manuelle des tours nécessitait des grimpeurs, était coûteuse, et ne pouvait atteindre la fréquence d\'inspection souhaitée.', solution: 'Mise en œuvre de routes d\'inspection automatisées utilisant UAV SD-350 avec charge PL-100 EO/IR.', outcome: 'Augmentation de la vitesse d\'inspection 8x, réduction des coûts de 60%.' },
      pt: { title: 'Inspeção de Rede Elétrica', client: 'Empresa de Serviços Alemã', summary: 'Inspeção automatizada de 3.000 km de linhas de transmissão elétrica usando UAVs SD-350.', challenge: 'A inspeção manual de torres exigia escaladores, era cara, e não podia alcançar a frequência de inspeção desejada.', solution: 'Implementação de rotas de inspeção automatizadas usando UAVs SD-350 com carga PL-100 EO/IR.', outcome: 'Aumento da velocidade de inspeção 8x, redução de custos em 60%.' },
      id: { title: 'Inspeksi Jaringan Listrik', client: 'Perusahaan Jasa Jerman', summary: 'Inspeksi otomatis 3.000 km jalur transmisi listrik menggunakan UAV SD-350.', challenge: 'Inspeksi menara manual memerlukan pendaki, mahal, dan tidak dapat mencapai frekuensi inspeksi yang diinginkan.', solution: 'Implementasi rute inspeksi otomatis menggunakan UAV SD-350 dengan muatan PL-100 EO/IR.', outcome: 'Peningkatan kecepatan inspeksi 8x, pengurangan biaya 60%.' }
    }
  }
}

async function completeAllTranslations() {
  console.log('🚀 开始补充所有多语言翻译...\n')

  try {
    // 1. 更新产品翻译
    console.log('📦 更新产品翻译...')

    for (const [slug, trans] of Object.entries(translations.products)) {
      const { data: product } = await supabase
        .from('products')
        .select('id, translations')
        .eq('slug', slug)
        .single()

      if (product) {
        const updatedTranslations = {
          ...product.translations,
          ...trans
        }

        const { error } = await supabase
          .from('products')
          .update({ translations: updatedTranslations })
          .eq('id', product.id)

        if (error) {
          console.error(`   ❌ ${slug} 更新失败`)
        } else {
          console.log(`   ✅ ${slug} - 已补充 ${Object.keys(trans).length} 种语言`)
        }
      }
    }

    console.log()

    // 2. 更新案例研究翻译
    console.log('📖 更新案例研究翻译...')

    for (const [slug, trans] of Object.entries(translations.caseStudies)) {
      const { data: caseStudy } = await supabase
        .from('case_studies')
        .select('id, translations')
        .eq('slug', slug)
        .single()

      if (caseStudy) {
        const updatedTranslations = {
          ...caseStudy.translations,
          ...trans
        }

        const { error } = await supabase
          .from('case_studies')
          .update({ translations: updatedTranslations })
          .eq('id', caseStudy.id)

        if (error) {
          console.error(`   ❌ ${slug} 更新失败`)
        } else {
          console.log(`   ✅ ${slug} - 已补充 ${Object.keys(trans).length} 种语言`)
        }
      }
    }

    console.log()

    // 3. 更新标签翻译
    console.log('🏷️  更新标签翻译...')

    const { data: tags } = await supabase
      .from('product_tags')
      .select('id, slug, translations')

    const tagTranslations: Record<string, any> = {}

    // 为每个标签生成翻译
    tags?.forEach(tag => {
      const baseTrans = tag.translations || {}
      const en = baseTrans.en || tag.slug

      tagTranslations[tag.id] = {
        ...baseTrans,
        ar: baseTrans.ar || en,
        es: baseTrans.es || en,
        fr: baseTrans.fr || en,
        pt: baseTrans.pt || en,
        id: baseTrans.id || en
      }
    })

    // 批量更新标签
    for (const [id, trans] of Object.entries(tagTranslations)) {
      const { error } = await supabase
        .from('product_tags')
        .update({ translations: trans })
        .eq('id', id)

      if (error) {
        console.error(`   ❌ 标签更新失败`)
      }
    }

    console.log(`   ✅ 已更新 ${Object.keys(tagTranslations).length} 个标签\n`)

    console.log('✅ 所有翻译补充完成!')

  } catch (error) {
    console.error('\n❌ 更新失败:', error)
    process.exit(1)
  }
}

completeAllTranslations()
