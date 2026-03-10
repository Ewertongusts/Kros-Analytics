<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div class="space-y-6">
        <h3 class="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-kros-blue"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Alterar Senha
        </h3>
        <div class="space-y-4">
          <div class="space-y-2">
            <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Senha Atual</label>
            <input type="password" class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-kros-blue outline-none transition-all" />
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Nova Senha</label>
            <input type="password" class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-kros-blue outline-none transition-all" />
          </div>
          <button class="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-all">
            Redefinir Senha
          </button>
        </div>
      </div>

      <div class="p-8 rounded-[2rem] bg-amber-500/[0.03] border border-amber-500/10 space-y-4">
        <div class="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="m12.8 2.39 8.1 13.9a2 2 0 0 1-1.7 2.9H4.8a2 2 0 0 1-1.7-2.9l8.1-13.9a2 2 0 0 1 3.5 0z"/></svg>
        </div>
        <h3 class="text-sm font-bold text-white uppercase tracking-widest">Autenticação em Duas Etapas</h3>
        <p class="text-xs text-white/40 leading-relaxed">Adicione uma camada extra de proteção à sua conta financeira. Recomendamos o uso do Google Authenticator.</p>
        <button disabled class="px-6 py-3 rounded-xl bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-widest border border-amber-500/20 opacity-50 cursor-not-allowed">
          Em breve
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
