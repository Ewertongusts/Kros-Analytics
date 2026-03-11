export default defineNuxtRouteMiddleware((to) => {
    const user = useSupabaseUser()

    // Se o usuário está logado e tenta acessar login/cadastro/recuperar-senha, manda pro dashboard
    if (user.value) {
        return navigateTo('/dashboard')
    }
})
