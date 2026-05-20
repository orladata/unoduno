'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    redirect('/reset-password?error=Nao foi possivel atualizar a senha.')
  }

  redirect('/login?message=Sua senha foi atualizada com sucesso! Conecte-se com sua nova senha.')
}
