/**
 * 填充合规页面内容
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 完整的合规内容
const complianceContent = {
  export_compliance: {
    en: {
      title: 'Export Compliance',
      content: `
<h2>Export Control Regulations</h2>
<p>SeekDrone operates in strict compliance with international export control regulations governing the sale, transfer, and support of unmanned aerial systems and related technologies.</p>

<h3>Regulatory Framework</h3>
<p>Our products and technologies are subject to the following regulatory frameworks:</p>
<ul>
  <li><strong>Wassenaar Arrangement:</strong> International export control regime for dual-use goods and technologies</li>
  <li><strong>ITAR (International Traffic in Arms Regulations):</strong> United States regulations controlling defense articles and services</li>
  <li><strong>EAR (Export Administration Regulations):</strong> United States regulations controlling dual-use items</li>
  <li><strong>EU Dual-Use Regulation:</strong> European Union export control framework</li>
</ul>

<h3>Product Classification</h3>
<p>Our products are classified under the following categories:</p>
<ul>
  <li><strong>UAV Systems:</strong> Subject to export controls due to potential dual-use applications</li>
  <li><strong>Payloads and Sensors:</strong> Classified based on technical specifications and capabilities</li>
  <li><strong>Counter-UAS Systems:</strong> Subject to defense article controls in most jurisdictions</li>
  <li><strong>Ground Control Systems:</strong> Evaluated based on technical capabilities and end-use</li>
</ul>

<h3>End-User Verification</h3>
<p>All sales require comprehensive end-user verification, including:</p>
<ul>
  <li>Identity verification of purchasing entity</li>
  <li>End-use statement and certification</li>
  <li>Screening against denied party lists</li>
  <li>Country risk assessment</li>
  <li>Red flag analysis</li>
</ul>

<h3>Authorized Markets</h3>
<p>SeekDrone products are available for sale to authorized government agencies, defense organizations, and approved commercial entities in permitted markets. We do not sell to:</p>
<ul>
  <li>Sanctioned countries or entities</li>
  <li>Denied parties or blocked persons</li>
  <li>Entities involved in prohibited end-uses</li>
  <li>Unauthorized military or paramilitary organizations</li>
</ul>

<h3>License Requirements</h3>
<p>Export licenses may be required depending on:</p>
<ul>
  <li>Product classification and technical specifications</li>
  <li>Destination country</li>
  <li>End-user identity and end-use</li>
  <li>Transaction value and quantity</li>
</ul>

<h3>Compliance Commitment</h3>
<p>SeekDrone maintains robust compliance procedures including:</p>
<ul>
  <li>Regular compliance training for all personnel</li>
  <li>Automated screening against restricted party lists</li>
  <li>Comprehensive record-keeping</li>
  <li>Regular audits and assessments</li>
  <li>Clear escalation procedures for compliance issues</li>
</ul>

<h3>Contact</h3>
<p>For export compliance inquiries, please contact our Compliance Team at <a href="mailto:compliance@seekdrone.com">compliance@seekdrone.com</a>.</p>
      `
    },
    zh: {
      title: '出口合规',
      content: `
<h2>出口管制法规</h2>
<p>SeekDrone 严格遵守国际出口管制法规，管理无人机系统及相关技术的销售、转让和支持。</p>

<h3>监管框架</h3>
<p>我们的产品和技术受以下监管框架约束：</p>
<ul>
  <li><strong>瓦森纳安排：</strong>管制两用商品和技术的国际出口管制制度</li>
  <li><strong>ITAR（国际武器贸易条例）：</strong>美国管制国防物品和服务的法规</li>
  <li><strong>EAR（出口管理条例）：</strong>美国管制两用物品的法规</li>
  <li><strong>欧盟两用条例：</strong>欧盟出口管制框架</li>
</ul>

<h3>产品分类</h3>
<p>我们的产品按以下类别分类：</p>
<ul>
  <li><strong>无人机系统：</strong>因潜在两用应用而受出口管制</li>
  <li><strong>载荷和传感器：</strong>根据技术规格和能力分类</li>
  <li><strong>反无人机系统：</strong>在大多数司法管辖区受国防物品管制</li>
  <li><strong>地面控制系统：</strong>根据技术能力和最终用途评估</li>
</ul>

<h3>最终用户验证</h3>
<p>所有销售都需要全面的最终用户验证，包括：</p>
<ul>
  <li>购买实体身份验证</li>
  <li>最终用途声明和认证</li>
  <li>对照拒绝方名单筛查</li>
  <li>国家风险评估</li>
  <li>红旗分析</li>
</ul>

<h3>授权市场</h3>
<p>SeekDrone 产品可向授权政府机构、国防组织和批准的商业实体在许可市场销售。我们不向以下方销售：</p>
<ul>
  <li>受制裁国家或实体</li>
  <li>被拒绝方或被封锁人员</li>
  <li>参与禁止最终用途的实体</li>
  <li>未授权军事或准军事组织</li>
</ul>

<h3>许可证要求</h3>
<p>根据以下情况可能需要出口许可证：</p>
<ul>
  <li>产品分类和技术规格</li>
  <li>目的国</li>
  <li>最终用户身份和最终用途</li>
  <li>交易价值和数量</li>
</ul>

<h3>合规承诺</h3>
<p>SeekDrone 维护健全的合规程序，包括：</p>
<ul>
  <li>所有人员的定期合规培训</li>
  <li>对照限制方名单的自动筛查</li>
  <li>全面的记录保存</li>
  <li>定期审计和评估</li>
  <li>明确的合规问题升级程序</li>
</ul>

<h3>联系方式</h3>
<p>如有出口合规咨询，请联系我们的合规团队：<a href="mailto:compliance@seekdrone.com">compliance@seekdrone.com</a>。</p>
      `
    },
    ar: {
      title: 'امتثال التصدير',
      content: `<h2>لوائح مراقبة الصادرات</h2><p>تعمل SeekDrone في امتثال صارم للوائح مراقبة الصادرات الدولية التي تحكم بيع ونقل ودعم أنظمة الطائرات المسيرة غير المأهولة والتقنيات ذات الصلة.</p><p>للاستفسارات، يرجى الاتصال بفريق الامتثال: <a href="mailto:compliance@seekdrone.com">compliance@seekdrone.com</a></p>`
    },
    es: {
      title: 'Cumplimiento de Exportación',
      content: `<h2>Regulaciones de Control de Exportación</h2><p>SeekDrone opera en estricto cumplimiento de las regulaciones internacionales de control de exportación que rigen la venta, transferencia y soporte de sistemas aéreos no tripulados y tecnologías relacionadas.</p><p>Para consultas, contacte a nuestro Equipo de Cumplimiento: <a href="mailto:compliance@seekdrone.com">compliance@seekdrone.com</a></p>`
    },
    fr: {
      title: 'Conformité à l\'Exportation',
      content: `<h2>Réglementations de Contrôle des Exportations</h2><p>SeekDrone opère en stricte conformité avec les réglementations internationales de contrôle des exportations régissant la vente, le transfert et le support des systèmes aériens sans pilote et des technologies connexes.</p><p>Pour toute question, contactez notre équipe de conformité: <a href="mailto:compliance@seekdrone.com">compliance@seekdrone.com</a></p>`
    },
    pt: {
      title: 'Conformidade de Exportação',
      content: `<h2>Regulamentos de Controle de Exportação</h2><p>A SeekDrone opera em estrita conformidade com os regulamentos internacionais de controle de exportação que regem a venda, transferência e suporte de sistemas aéreos não tripulados e tecnologias relacionadas.</p><p>Para consultas, entre em contato com nossa Equipe de Conformidade: <a href="mailto:compliance@seekdrone.com">compliance@seekdrone.com</a></p>`
    },
    id: {
      title: 'Kepatuhan Ekspor',
      content: `<h2>Peraturan Pengendalian Ekspor</h2><p>SeekDrone beroperasi dalam kepatuhan yang ketat terhadap peraturan pengendalian ekspor internasional yang mengatur penjualan, transfer, dan dukungan sistem udara tanpa awak dan teknologi terkait.</p><p>Untuk pertanyaan, silakan hubungi Tim Kepatuhan kami: <a href="mailto:compliance@seekdrone.com">compliance@seekdrone.com</a></p>`
    }
  },

  privacy_policy: {
    en: {
      title: 'Privacy Policy',
      content: `
<h2>Introduction</h2>
<p>SeekDrone ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.</p>

<h3>Information We Collect</h3>
<h4>Personal Information</h4>
<p>We may collect personal information that you voluntarily provide, including:</p>
<ul>
  <li>Contact information (name, email address, phone number)</li>
  <li>Company information (company name, job title)</li>
  <li>Location information (country, region)</li>
  <li>Communication preferences</li>
  <li>Inquiry and request details</li>
</ul>

<h4>Automatically Collected Information</h4>
<p>When you visit our website, we automatically collect:</p>
<ul>
  <li>Device information (browser type, operating system)</li>
  <li>Usage data (pages visited, time spent, interactions)</li>
  <li>IP address and geographic location</li>
  <li>Referring website</li>
</ul>

<h3>How We Use Your Information</h3>
<p>We use collected information to:</p>
<ul>
  <li>Respond to your inquiries and requests</li>
  <li>Provide and improve our services</li>
  <li>Send relevant communications (with your consent)</li>
  <li>Comply with legal obligations</li>
  <li>Protect against fraud and unauthorized access</li>
  <li>Analyze website usage and optimize user experience</li>
</ul>

<h3>Information Sharing</h3>
<p>We may share your information with:</p>
<ul>
  <li>Service providers who assist in our operations</li>
  <li>Business partners (with your consent)</li>
  <li>Legal authorities when required by law</li>
  <li>Affiliated companies within our corporate group</li>
</ul>

<h3>Data Security</h3>
<p>We implement appropriate technical and organizational measures to protect your data, including:</p>
<ul>
  <li>Encryption in transit and at rest</li>
  <li>Access controls and authentication</li>
  <li>Regular security assessments</li>
  <li>Employee training and policies</li>
</ul>

<h3>Your Rights</h3>
<p>Depending on your location, you may have the right to:</p>
<ul>
  <li>Access your personal data</li>
  <li>Correct inaccurate data</li>
  <li>Delete your data</li>
  <li>Object to processing</li>
  <li>Data portability</li>
  <li>Withdraw consent</li>
</ul>

<h3>Cookies</h3>
<p>We use cookies and similar technologies as described in our <a href="/compliance/cookie">Cookie Policy</a>.</p>

<h3>Data Retention</h3>
<p>We retain personal data only as long as necessary for the purposes outlined in this policy, subject to legal retention requirements.</p>

<h3>International Transfers</h3>
<p>Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.</p>

<h3>Changes to This Policy</h3>
<p>We may update this policy periodically. We will notify you of material changes via our website or email.</p>

<h3>Contact Us</h3>
<p>For privacy-related inquiries or to exercise your rights, contact us at <a href="mailto:privacy@seekdrone.com">privacy@seekdrone.com</a>.</p>
      `
    },
    zh: {
      title: '隐私政策',
      content: `
<h2>引言</h2>
<p>SeekDrone（"我们"）致力于保护您的隐私。本隐私政策说明当您访问我们的网站或使用我们的服务时，我们如何收集、使用、披露和保护您的信息。</p>

<h3>我们收集的信息</h3>
<h4>个人信息</h4>
<p>我们可能收集您自愿提供的个人信息，包括：</p>
<ul>
  <li>联系信息（姓名、电子邮件地址、电话号码）</li>
  <li>公司信息（公司名称、职位）</li>
  <li>位置信息（国家、地区）</li>
  <li>通信偏好</li>
  <li>咨询和请求详情</li>
</ul>

<h4>自动收集的信息</h4>
<p>当您访问我们的网站时，我们会自动收集：</p>
<ul>
  <li>设备信息（浏览器类型、操作系统）</li>
  <li>使用数据（访问的页面、停留时间、交互）</li>
  <li>IP地址和地理位置</li>
  <li>来源网站</li>
</ul>

<h3>我们如何使用您的信息</h3>
<p>我们使用收集的信息：</p>
<ul>
  <li>回复您的咨询和请求</li>
  <li>提供和改进我们的服务</li>
  <li>发送相关通信（经您同意）</li>
  <li>遵守法律义务</li>
  <li>防止欺诈和未授权访问</li>
  <li>分析网站使用情况并优化用户体验</li>
</ul>

<h3>信息共享</h3>
<p>我们可能与以下方共享您的信息：</p>
<ul>
  <li>协助我们运营的服务提供商</li>
  <li>业务合作伙伴（经您同意）</li>
  <li>法律要求的法律当局</li>
  <li>我们企业集团内的关联公司</li>
</ul>

<h3>数据安全</h3>
<p>我们实施适当的技术和组织措施来保护您的数据，包括：</p>
<ul>
  <li>传输中和静态加密</li>
  <li>访问控制和身份验证</li>
  <li>定期安全评估</li>
  <li>员工培训和政策</li>
</ul>

<h3>您的权利</h3>
<p>根据您的位置，您可能有权：</p>
<ul>
  <li>访问您的个人数据</li>
  <li>更正不准确的数据</li>
  <li>删除您的数据</li>
  <li>反对处理</li>
  <li>数据可携带性</li>
  <li>撤回同意</li>
</ul>

<h3>Cookie</h3>
<p>我们使用Cookie和类似技术，如我们的<a href="/compliance/cookie">Cookie政策</a>所述。</p>

<h3>数据保留</h3>
<p>我们仅在实现本政策所述目的所需的时间内保留个人数据，受法律保留要求约束。</p>

<h3>国际传输</h3>
<p>您的数据可能被传输到并存储在您所在国家以外的国家。我们确保为此类传输提供适当的保障措施。</p>

<h3>政策变更</h3>
<p>我们可能会定期更新本政策。我们将通过网站或电子邮件通知您重大变更。</p>

<h3>联系我们</h3>
<p>如有隐私相关咨询或行使您的权利，请联系我们：<a href="mailto:privacy@seekdrone.com">privacy@seekdrone.com</a>。</p>
      `
    },
    ar: {
      title: 'سياسة الخصوصية',
      content: `<h2>مقدمة</h2><p>تلتزم SeekDrone بحماية خصوصيتك. توضح سياسة الخصوصية هذه كيفية جمعنا واستخدامنا والإفصاح عن معلوماتك وحمايتها عند زيارة موقعنا أو استخدام خدماتنا.</p><p>للاستفسارات المتعلقة بالخصوصية، يرجى الاتصال بنا: <a href="mailto:privacy@seekdrone.com">privacy@seekdrone.com</a></p>`
    },
    es: {
      title: 'Política de Privacidad',
      content: `<h2>Introducción</h2><p>SeekDrone se compromete a proteger su privacidad. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y protegemos su información cuando visita nuestro sitio web o utiliza nuestros servicios.</p><p>Para consultas relacionadas con la privacidad, contáctenos: <a href="mailto:privacy@seekdrone.com">privacy@seekdrone.com</a></p>`
    },
    fr: {
      title: 'Politique de Confidentialité',
      content: `<h2>Introduction</h2><p>SeekDrone s'engage à protéger votre vie privée. Cette Politique de Confidentialité explique comment nous collectons, utilisons, divulguons et protégeons vos informations lorsque vous visitez notre site Web ou utilisez nos services.</p><p>Pour toute question relative à la confidentialité, contactez-nous: <a href="mailto:privacy@seekdrone.com">privacy@seekdrone.com</a></p>`
    },
    pt: {
      title: 'Política de Privacidade',
      content: `<h2>Introdução</h2><p>A SeekDrone está comprometida em proteger sua privacidade. Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações quando você visita nosso site ou usa nossos serviços.</p><p>Para consultas relacionadas à privacidade, entre em contato: <a href="mailto:privacy@seekdrone.com">privacy@seekdrone.com</a></p>`
    },
    id: {
      title: 'Kebijakan Privasi',
      content: `<h2>Pendahuluan</h2><p>SeekDrone berkomitmen untuk melindungi privasi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, mengungkapkan, dan melindungi informasi Anda saat Anda mengunjungi situs web kami atau menggunakan layanan kami.</p><p>Untuk pertanyaan terkait privasi, hubungi kami: <a href="mailto:privacy@seekdrone.com">privacy@seekdrone.com</a></p>`
    }
  },

  terms_of_use: {
    en: {
      title: 'Terms of Use',
      content: `
<h2>Agreement to Terms</h2>
<p>By accessing and using the SeekDrone website and services, you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our website or services.</p>

<h3>Use of Website</h3>
<h4>Permitted Use</h4>
<p>You may use our website for:</p>
<ul>
  <li>Accessing product information</li>
  <li>Submitting inquiries</li>
  <li>Viewing publicly available content</li>
  <li>Communicating with us</li>
</ul>

<h4>Prohibited Use</h4>
<p>You may not:</p>
<ul>
  <li>Use the website for unlawful purposes</li>
  <li>Attempt to gain unauthorized access</li>
  <li>Interfere with website operations</li>
  <li>Copy, modify, or distribute content without permission</li>
  <li>Use automated systems to access the website without consent</li>
  <li>Transmit viruses or malicious code</li>
</ul>

<h3>Intellectual Property</h3>
<p>All content on this website, including text, graphics, logos, images, and software, is the property of SeekDrone or its licensors and is protected by intellectual property laws.</p>

<h3>Product Information</h3>
<p>Product information provided on this website is for general information purposes. Specifications, availability, and pricing are subject to change without notice. Some products may be subject to export controls and licensing requirements.</p>

<h3>Inquiries and Communications</h3>
<p>When submitting inquiries:</p>
<ul>
  <li>Provide accurate and complete information</li>
  <li>Do not submit false or misleading information</li>
  <li>Understand that inquiries do not constitute orders</li>
  <li>Allow reasonable time for response</li>
</ul>

<h3>Disclaimer of Warranties</h3>
<p>THIS WEBSITE AND ITS CONTENT ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>

<h3>Limitation of Liability</h3>
<p>SEEKDRONE SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THIS WEBSITE OR ITS CONTENT.</p>

<h3>Indemnification</h3>
<p>You agree to indemnify and hold harmless SeekDrone from any claims, damages, or expenses arising from your use of the website or violation of these terms.</p>

<h3>Governing Law</h3>
<p>These terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.</p>

<h3>Changes to Terms</h3>
<p>We reserve the right to modify these terms at any time. Continued use of the website constitutes acceptance of modified terms.</p>

<h3>Contact</h3>
<p>For questions about these terms, contact us at <a href="mailto:legal@seekdrone.com">legal@seekdrone.com</a>.</p>
      `
    },
    zh: {
      title: '使用条款',
      content: `
<h2>条款同意</h2>
<p>通过访问和使用 SeekDrone 网站和服务，您同意受这些使用条款约束。如果您不同意这些条款，请不要使用我们的网站或服务。</p>

<h3>网站使用</h3>
<h4>允许使用</h4>
<p>您可以将我们的网站用于：</p>
<ul>
  <li>访问产品信息</li>
  <li>提交咨询</li>
  <li>查看公开内容</li>
  <li>与我们沟通</li>
</ul>

<h4>禁止使用</h4>
<p>您不得：</p>
<ul>
  <li>将网站用于非法目的</li>
  <li>试图获得未授权访问</li>
  <li>干扰网站运营</li>
  <li>未经许可复制、修改或分发内容</li>
  <li>未经同意使用自动系统访问网站</li>
  <li>传输病毒或恶意代码</li>
</ul>

<h3>知识产权</h3>
<p>本网站上的所有内容，包括文本、图形、标志、图像和软件，均为 SeekDrone 或其许可方的财产，受知识产权法保护。</p>

<h3>产品信息</h3>
<p>本网站上提供的产品信息仅供参考。规格、可用性和定价可能随时变更，恕不另行通知。某些产品可能受出口管制和许可要求约束。</p>

<h3>咨询和通信</h3>
<p>提交咨询时：</p>
<ul>
  <li>提供准确完整的信息</li>
  <li>不要提交虚假或误导性信息</li>
  <li>理解咨询不构成订单</li>
  <li>给予合理的响应时间</li>
</ul>

<h3>免责声明</h3>
<p>本网站及其内容按"原样"提供，不提供任何明示或暗示的保证，包括但不限于适销性、特定用途适用性和非侵权性的保证。</p>

<h3>责任限制</h3>
<p>SeekDrone 对因使用本网站或其内容而产生的任何直接、间接、偶然、特殊、后果性或惩罚性损害不承担责任。</p>

<h3>赔偿</h3>
<p>您同意赔偿并使 SeekDrone 免受因您使用网站或违反这些条款而产生的任何索赔、损害或费用。</p>

<h3>适用法律</h3>
<p>这些条款应受适用法律管辖并据其解释，不考虑法律冲突原则。</p>

<h3>条款变更</h3>
<p>我们保留随时修改这些条款的权利。继续使用网站即表示接受修改后的条款。</p>

<h3>联系方式</h3>
<p>如有关于这些条款的问题，请联系我们：<a href="mailto:legal@seekdrone.com">legal@seekdrone.com</a>。</p>
      `
    },
    ar: {
      title: 'شروط الاستخدام',
      content: `<h2>الموافقة على الشروط</h2><p>باستخدامك لموقع وخدمات SeekDrone، فإنك توافق على الالتزام بشروط الاستخدام هذه.</p><p>للأسئلة حول هذه الشروط، اتصل بنا: <a href="mailto:legal@seekdrone.com">legal@seekdrone.com</a></p>`
    },
    es: {
      title: 'Términos de Uso',
      content: `<h2>Aceptación de Términos</h2><p>Al acceder y usar el sitio web y servicios de SeekDrone, usted acepta estar sujeto a estos Términos de Uso.</p><p>Para preguntas sobre estos términos, contáctenos: <a href="mailto:legal@seekdrone.com">legal@seekdrone.com</a></p>`
    },
    fr: {
      title: 'Conditions d\'Utilisation',
      content: `<h2>Acceptation des Conditions</h2><p>En accédant et en utilisant le site Web et les services de SeekDrone, vous acceptez d'être lié par ces Conditions d'Utilisation.</p><p>Pour toute question concernant ces conditions, contactez-nous: <a href="mailto:legal@seekdrone.com">legal@seekdrone.com</a></p>`
    },
    pt: {
      title: 'Termos de Uso',
      content: `<h2>Aceitação dos Termos</h2><p>Ao acessar e usar o site e serviços da SeekDrone, você concorda em estar vinculado a estes Termos de Uso.</p><p>Para perguntas sobre estes termos, entre em contato: <a href="mailto:legal@seekdrone.com">legal@seekdrone.com</a></p>`
    },
    id: {
      title: 'Ketentuan Penggunaan',
      content: `<h2>Persetujuan Ketentuan</h2><p>Dengan mengakses dan menggunakan situs web dan layanan SeekDrone, Anda setuju untuk terikat dengan Ketentuan Penggunaan ini.</p><p>Untuk pertanyaan tentang ketentuan ini, hubungi kami: <a href="mailto:legal@seekdrone.com">legal@seekdrone.com</a></p>`
    }
  },

  cookie_policy: {
    en: {
      title: 'Cookie Policy',
      content: `
<h2>What Are Cookies</h2>
<p>Cookies are small text files stored on your device when you visit a website. They help the website remember your preferences and provide a better user experience.</p>

<h3>Types of Cookies We Use</h3>

<h4>Essential Cookies</h4>
<p>These cookies are necessary for the website to function properly. They enable:</p>
<ul>
  <li>Secure authentication</li>
  <li>Navigation and basic functionality</li>
  <li>Form submissions</li>
  <li>Language preferences</li>
</ul>

<h4>Analytics Cookies</h4>
<p>We use analytics cookies to understand how visitors interact with our website:</p>
<ul>
  <li>Pages visited and time spent</li>
  <li>Traffic sources</li>
  <li>User journey analysis</li>
  <li>Performance metrics</li>
</ul>
<p>We use Google Analytics for website analytics. You can opt out using the Google Analytics Opt-out Browser Add-on.</p>

<h4>Functional Cookies</h4>
<p>These cookies enable enhanced functionality:</p>
<ul>
  <li>Remembering your preferences</li>
  <li>Language selection</li>
  <li>Region-specific content</li>
  <li>Customized display options</li>
</ul>

<h4>Marketing Cookies</h4>
<p>With your consent, we may use marketing cookies for:</p>
<ul>
  <li>Relevant advertising</li>
  <li>Campaign tracking</li>
  <li>Conversion measurement</li>
</ul>

<h3>Managing Cookies</h3>
<p>You can control cookies through:</p>
<ul>
  <li><strong>Browser Settings:</strong> Most browsers allow you to block or delete cookies</li>
  <li><strong>Cookie Preferences:</strong> Use our cookie consent tool to manage preferences</li>
  <li><strong>Opt-out Tools:</strong> Use industry opt-out tools for specific services</li>
</ul>

<h4>Browser Cookie Settings</h4>
<p>To manage cookies in your browser:</p>
<ul>
  <li><strong>Chrome:</strong> Settings > Privacy and Security > Cookies</li>
  <li><strong>Firefox:</strong> Settings > Privacy & Security > Cookies</li>
  <li><strong>Safari:</strong> Preferences > Privacy > Cookies</li>
  <li><strong>Edge:</strong> Settings > Cookies and Site Permissions</li>
</ul>

<h3>Impact of Disabling Cookies</h3>
<p>Disabling certain cookies may affect:</p>
<ul>
  <li>Website functionality</li>
  <li>User experience</li>
  <li>Personalization features</li>
</ul>

<h3>Third-Party Cookies</h3>
<p>We may use third-party services that set their own cookies:</p>
<ul>
  <li>Google Analytics</li>
  <li>Google Tag Manager</li>
  <li>Social media platforms</li>
</ul>
<p>These services have their own privacy policies governing cookie use.</p>

<h3>Updates to This Policy</h3>
<p>We may update this policy periodically. Significant changes will be notified on our website.</p>

<h3>Contact</h3>
<p>For questions about our use of cookies, contact us at <a href="mailto:privacy@seekdrone.com">privacy@seekdrone.com</a>.</p>
      `
    },
    zh: {
      title: 'Cookie 政策',
      content: `
<h2>什么是 Cookie</h2>
<p>Cookie 是您访问网站时存储在设备上的小型文本文件。它们帮助网站记住您的偏好并提供更好的用户体验。</p>

<h3>我们使用的 Cookie 类型</h3>

<h4>必要 Cookie</h4>
<p>这些 Cookie 对网站正常运行是必需的。它们支持：</p>
<ul>
  <li>安全身份验证</li>
  <li>导航和基本功能</li>
  <li>表单提交</li>
  <li>语言偏好</li>
</ul>

<h4>分析 Cookie</h4>
<p>我们使用分析 Cookie 来了解访问者如何与网站交互：</p>
<ul>
  <li>访问的页面和停留时间</li>
  <li>流量来源</li>
  <li>用户旅程分析</li>
  <li>性能指标</li>
</ul>
<p>我们使用 Google Analytics 进行网站分析。您可以使用 Google Analytics 选择退出浏览器插件退出。</p>

<h4>功能 Cookie</h4>
<p>这些 Cookie 支持增强功能：</p>
<ul>
  <li>记住您的偏好</li>
  <li>语言选择</li>
  <li>区域特定内容</li>
  <li>自定义显示选项</li>
</ul>

<h4>营销 Cookie</h4>
<p>经您同意，我们可能使用营销 Cookie：</p>
<ul>
  <li>相关广告</li>
  <li>活动跟踪</li>
  <li>转化测量</li>
</ul>

<h3>管理 Cookie</h3>
<p>您可以通过以下方式控制 Cookie：</p>
<ul>
  <li><strong>浏览器设置：</strong>大多数浏览器允许您阻止或删除 Cookie</li>
  <li><strong>Cookie 偏好：</strong>使用我们的 Cookie 同意工具管理偏好</li>
  <li><strong>退出工具：</strong>使用行业退出工具针对特定服务</li>
</ul>

<h4>浏览器 Cookie 设置</h4>
<p>在浏览器中管理 Cookie：</p>
<ul>
  <li><strong>Chrome：</strong>设置 > 隐私和安全 > Cookie</li>
  <li><strong>Firefox：</strong>设置 > 隐私与安全 > Cookie</li>
  <li><strong>Safari：</strong>偏好设置 > 隐私 > Cookie</li>
  <li><strong>Edge：</strong>设置 > Cookie 和网站权限</li>
</ul>

<h3>禁用 Cookie 的影响</h3>
<p>禁用某些 Cookie 可能影响：</p>
<ul>
  <li>网站功能</li>
  <li>用户体验</li>
  <li>个性化功能</li>
</ul>

<h3>第三方 Cookie</h3>
<p>我们可能使用设置自己 Cookie 的第三方服务：</p>
<ul>
  <li>Google Analytics</li>
  <li>Google Tag Manager</li>
  <li>社交媒体平台</li>
</ul>
<p>这些服务有自己的隐私政策管理 Cookie 使用。</p>

<h3>政策更新</h3>
<p>我们可能会定期更新本政策。重大变更将在网站上通知。</p>

<h3>联系方式</h3>
<p>如有关于我们使用 Cookie 的问题，请联系我们：<a href="mailto:privacy@seekdrone.com">privacy@seekdrone.com</a>。</p>
      `
    },
    ar: {
      title: 'سياسة ملفات تعريف الارتباط',
      content: `<h2>ما هي ملفات تعريف الارتباط</h2><p>ملفات تعريف الارتباط هي ملفات نصية صغيرة يتم تخزينها على جهازك عند زيارة موقع ويب.</p><p>للأسئلة حول استخدامنا لملفات تعريف الارتباط، اتصل بنا: <a href="mailto:privacy@seekdrone.com">privacy@seekdrone.com</a></p>`
    },
    es: {
      title: 'Política de Cookies',
      content: `<h2>Qué son las Cookies</h2><p>Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita un sitio web.</p><p>Para preguntas sobre nuestro uso de cookies, contáctenos: <a href="mailto:privacy@seekdrone.com">privacy@seekdrone.com</a></p>`
    },
    fr: {
      title: 'Politique des Cookies',
      content: `<h2>Que sont les Cookies</h2><p>Les cookies sont de petits fichiers texte stockés sur votre appareil lorsque vous visitez un site Web.</p><p>Pour toute question sur notre utilisation des cookies, contactez-nous: <a href="mailto:privacy@seekdrone.com">privacy@seekdrone.com</a></p>`
    },
    pt: {
      title: 'Política de Cookies',
      content: `<h2>O que são Cookies</h2><p>Cookies são pequenos arquivos de texto armazenados em seu dispositivo quando você visita um site.</p><p>Para perguntas sobre nosso uso de cookies, entre em contato: <a href="mailto:privacy@seekdrone.com">privacy@seekdrone.com</a></p>`
    },
    id: {
      title: 'Kebijakan Cookie',
      content: `<h2>Apa itu Cookie</h2><p>Cookie adalah file teks kecil yang disimpan di perangkat Anda saat Anda mengunjungi situs web.</p><p>Untuk pertanyaan tentang penggunaan cookie kami, hubungi kami: <a href="mailto:privacy@seekdrone.com">privacy@seekdrone.com</a></p>`
    }
  }
}

async function seedComplianceContent() {
  console.log('🚀 开始填充合规内容...\n')

  try {
    // 清空现有合规内容
    console.log('🗑️  清空现有合规内容...')

    const sections = ['export_compliance', 'privacy_policy', 'terms_of_use', 'cookie_policy']

    for (const section of sections) {
      await supabase
        .from('footer_content')
        .delete()
        .eq('section', section)
    }

    console.log('   ✅ 清空完成\n')

    // 插入新内容
    console.log('📝 插入合规内容...')

    for (const [section, translations] of Object.entries(complianceContent)) {
      const { error } = await supabase
        .from('footer_content')
        .insert({
          section,
          translations,
          published: true
        })

      if (error) {
        console.error(`   ❌ ${section} 插入失败:`, error)
      } else {
        const title = translations.en?.title || section
        const languages = Object.keys(translations)
        console.log(`   ✅ ${title} (${languages.join(', ')})`)
      }
    }

    console.log('\n✅ 合规内容填充完成!')

    // 验证
    console.log('\n📊 验证数据...')
    const { data } = await supabase
      .from('footer_content')
      .select('section, translations')
      .in('section', sections)

    console.log(`   - 已插入 ${data?.length || 0} 条合规内容`)
    data?.forEach(item => {
      const langs = Object.keys(item.translations)
      console.log(`   - ${item.section}: ${langs.length} 种语言`)
    })

  } catch (error) {
    console.error('\n❌ 填充失败:', error)
    process.exit(1)
  }
}

seedComplianceContent()
