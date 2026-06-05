import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
const envPath = join(__dirname, '..', '.env.local')
const envContent = readFileSync(envPath, 'utf-8')

envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length > 0) {
    process.env[key.trim()] = valueParts.join('=').trim()
  }
})

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function importSeed() {
  console.log('📦 Importing seed data...\n')

  // 1. Site Settings
  console.log('📄 site_settings...')
  const { error: e1 } = await supabase.from('site_settings').upsert({
    id: 1,
    site_name: { en: 'SeekDrone' },
    seo_description: { en: 'Industrial UAV platforms and counter-UAS solutions for defense, security, and critical infrastructure worldwide.' },
    contact_email: 'info@seekdrone.com',
    hero_config: {
      en: {
        background_type: 'image',
        background_image_url: '',
        background_video_url: '',
        title: 'Industrial UAVs, Tested Where It Matters Most',
        subtitle: 'Battle-proven drone platforms and counter-UAS solutions for defense, security, and critical infrastructure.',
        cta_text: 'Request a Demo',
        cta_url: '/request-demo'
      }
    },
    enabled_languages: ['en', 'ar', 'es', 'fr', 'pt', 'id'],
    enable_chinese: false,
    enable_chinese_by_ip: false
  })
  console.log(e1 ? `   ❌ ${e1.message}` : '   ✅ Success')

  // 2. Navigation
  console.log('📄 navigation...')
  const { error: e2 } = await supabase.from('navigation').upsert([
    { position: 'header', order_index: 1, link_type: 'internal', url: '/products', translations: { en: 'Products' }, published: true },
    { position: 'header', order_index: 2, link_type: 'internal', url: '/solutions/public-safety', translations: { en: 'Solutions' }, published: true },
    { position: 'header', order_index: 3, link_type: 'internal', url: '/case-studies', translations: { en: 'Case Studies' }, published: true },
    { position: 'header', order_index: 4, link_type: 'internal', url: '/compliance', translations: { en: 'Support' }, published: true }
  ])
  console.log(e2 ? `   ❌ ${e2.message}` : '   ✅ Success')

  // 3. Email Templates
  console.log('📄 email_templates...')
  const { error: e3 } = await supabase.from('email_templates').upsert([
    {
      template_key: 'inquiry_received',
      description: 'Auto-reply to inquiry submissions',
      translations: {
        en: {
          subject: 'Thank you for your inquiry - SeekDrone',
          body: 'Dear {full_name},\n\nThank you for your interest in SeekDrone solutions. Our team will review your inquiry and contact you within 24-48 hours.\n\nBest regards,\nSeekDrone Team'
        }
      },
      available_variables: ['full_name', 'company', 'email'],
      is_active: true
    },
    {
      template_key: 'inquiry_notification',
      description: 'Internal notification for new inquiries',
      translations: {
        en: {
          subject: 'New Inquiry from {full_name} - {company}',
          body: 'New inquiry received:\n\nName: {full_name}\nCompany: {company}\nEmail: {email}\nCountry: {country}\nInterest: {application_interest}'
        }
      },
      available_variables: ['full_name', 'company', 'email', 'country', 'application_interest'],
      is_active: true
    }
  ])
  console.log(e3 ? `   ❌ ${e3.message}` : '   ✅ Success')

  // 4. Solutions
  console.log('📄 solutions...')
  const { error: e4 } = await supabase.from('solutions').upsert([
    {
      slug: 'public-safety',
      icon: 'Shield',
      translations: {
        en: {
          title: 'Public Safety',
          description: 'UAV solutions for emergency response, search & rescue, and disaster management.',
          features: ['Real-time situational awareness', 'Thermal imaging', 'Rapid deployment']
        }
      },
      metrics: [
        { label: 'Response Time', value: '50%', suffix: 'faster' },
        { label: 'Coverage', value: '10x', suffix: 'larger' }
      ],
      published: true,
      sort_order: 1
    }
  ])
  console.log(e4 ? `   ❌ ${e4.message}` : '   ✅ Success')

  // 5. Footer Content
  console.log('📄 footer_content...')
  const { error: e5 } = await supabase.from('footer_content').upsert([
    {
      section: 'contact',
      translations: {
        en: {
          title: 'Contact Us',
          email: 'info@seekdrone.com',
          phone: '+1 (555) 123-4567'
        }
      },
      published: true
    },
    {
      section: 'social',
      translations: {
        en: {
          title: 'Follow Us',
          linkedin: 'https://linkedin.com/company/seekdrone',
          twitter: 'https://twitter.com/seekdrone'
        }
      },
      published: true
    }
  ])
  console.log(e5 ? `   ❌ ${e5.message}` : '   ✅ Success')

  // 6. Products (simplified)
  console.log('📄 products...')
  const { error: e6 } = await supabase.from('products').upsert([
    {
      model: 'SD-100',
      slug: 'sd-100',
      category: 'uav',
      translations: {
        en: {
          name: 'SeekDrone SD-100',
          short_description: 'Compact tactical UAV for reconnaissance',
          description: 'The SD-100 is a compact, portable tactical UAV designed for short-range reconnaissance and surveillance missions.'
        }
      },
      featured: true,
      published: true,
      sort_order: 1
    },
    {
      model: 'SD-500',
      slug: 'sd-500',
      category: 'uav',
      translations: {
        en: {
          name: 'SeekDrone SD-500',
          short_description: 'Long-endurance multi-mission UAV',
          description: 'The SD-500 offers extended flight time and multi-sensor capabilities for complex missions.'
        }
      },
      featured: true,
      published: true,
      sort_order: 2
    }
  ])
  console.log(e6 ? `   ❌ ${e6.message}` : '   ✅ Success')

  console.log('\n✨ Seed data imported successfully!\n')
  console.log('📝 Next: Create admin user at:')
  console.log('   https://supabase.com/dashboard/project/jbavapzrbjdsaprwswid/auth/users\n')
  console.log('   Email: admin@seekdrone.com')
  console.log('   Password: [Your strong password]')
  console.log('   ✅ Auto Confirm User: Check\n')
}

importSeed().catch(console.error)
