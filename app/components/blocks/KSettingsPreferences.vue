<template>
  <div class="space-y-8 animate-in fade-in duration-500">
     <div class="space-y-12">
        <div class="flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.02] border border-white/5">
          <div class="space-y-1">
            <p class="text-sm font-bold text-white">Modo Noturno Automático</p>
            <p class="text-[10px] text-white/40 uppercase tracking-widest">Sincronizar tema com o sistema operacional</p>
          </div>
          <div class="w-12 h-6 rounded-full bg-kros-blue p-1 flex justify-end cursor-pointer shadow-[0_0_15px_rgba(var(--kros-blue-rgb),0.3)]">
            <div class="w-4 h-4 rounded-full bg-white shadow-lg"></div>
          </div>
        </div>

        <div class="flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.02] border border-white/5">
          <div class="space-y-1">
            <p class="text-sm font-bold text-white">Notificações Diárias</p>
            <p class="text-[10px] text-white/40 uppercase tracking-widest">Resumo de cobranças e entradas no e-mail</p>
          </div>
          <div class="w-12 h-6 rounded-full bg-white/10 p-1 flex justify-start cursor-pointer">
            <div class="w-4 h-4 rounded-full bg-white/20"></div>
          </div>
        </div>

        <div class="p-8 border border-red-500/20 bg-red-500/5 rounded-[2rem] space-y-4">
           <h4 class="text-xs font-bold text-red-500 uppercase tracking-[0.2em]">Zona de Perigo</h4>
           <p class="text-xs text-red-500/60 leading-relaxed">Ao encerrar sua conta, todos os dados de faturamento, empresas e fluxos serão permanentemente removidos de nossos servidores.</p>
           <button class="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-all underline underline-offset-8">
              Encerrar Minha Conta
           </button>
        </div>
     </div>
  </div>
</template>

<script setup lang="ts"></script>
