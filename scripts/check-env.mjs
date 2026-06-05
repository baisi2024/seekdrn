console.log('=== Environment Variables Check ===\n')

console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` : 'MISSING')
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? `${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...` : 'MISSING')

console.log('\n=== Validation ===')
console.log('URL valid:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Anon Key valid:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
console.log('Service Role Key valid:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
