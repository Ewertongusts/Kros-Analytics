export default defineNuxtRouteMiddleware((to) => {
    const user = useSupabaseUser()

    // Se o usuário não está logado e tenta acessar uma rota protegida (como dashboard), manda pro login
    if (!user.value && to.path !== '/') {
        return navigateTo('/')
    }
})
