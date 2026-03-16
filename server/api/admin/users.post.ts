import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  
  // Create admin client with service key
  const supabaseAdmin = createClient(
    config.public.supabase.url,
    config.supabaseServiceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  try {
    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: {
        full_name: body.full_name || body.name,
        name: body.name,
        role: body.role
      }
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('Failed to create auth user')

    // Create user record in custom table
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert([{
        id: authData.user.id,
        email: body.email,
        name: body.name,
        role: body.role
      }])

    if (userError) throw userError

    // Create user profile if additional data provided
    if (body.full_name || body.phone) {
      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .insert([{
          id: authData.user.id,
          full_name: body.full_name,
          name: body.name,
          phone: body.phone,
          role: body.role
        }])

      if (profileError) {
        console.warn('Error creating user profile:', profileError)
      }
    }

    return { success: true, user: authData.user }
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    })
  }
})