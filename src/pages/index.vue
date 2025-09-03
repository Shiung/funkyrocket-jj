<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
    <!-- 背景裝飾 -->
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(120,119,198,0.3)_0%,_transparent_50%)]"></div>
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,_rgba(255,119,198,0.3)_0%,_transparent_50%)]"></div>
    
    <div class="relative container mx-auto px-4 py-8">

      <!-- 動畫展示區 -->
      <div class="text-center mb-16">
        <h2 class="text-3xl font-bold mb-8 bg-gradient-to-r from-pink-400 to-yellow-400 bg-clip-text text-transparent">
          🎭 動畫展示
        </h2>
        
        <div class="max-w-4xl mx-auto mb-8">
          <div class="space-y-8">
            <!-- Funky Rocket 遊戲流程展示 -->
            <RouterLink 
              to="/funky-rocket-demo"
              class="group bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-lg rounded-3xl p-8 border border-yellow-400/30 hover:border-yellow-300/50 transition-all duration-300 hover:scale-[1.02] shadow-2xl block"
            >
              <div class="absolute top-4 right-4 bg-yellow-500/20 text-yellow-300 px-3 py-1.5 rounded-full text-sm font-semibold">
                🎸 新功能
              </div>
              <div class="flex items-start gap-6">
                <div class="text-6xl group-hover:scale-110 transition-transform duration-300">🎸</div>
                <div class="flex-1 text-left">
                  <h4 class="text-2xl font-bold mb-3 text-yellow-300">Funky Rocket 遊戲流程展示</h4>
                  <p class="text-slate-300 text-base mb-4 leading-relaxed">
                    專門展示 Funky Rocket 素材包的遊戲流程：上車、倒數、發射、下車
                  </p>
                  <div class="inline-flex items-center gap-2 text-yellow-400 font-semibold text-lg">
                    立即體驗 <span class="group-hover:translate-x-2 transition-transform duration-300">→</span>
                  </div>
                </div>
              </div>
            </RouterLink>

            <!-- Funky Rocket 動畫展示 -->
            <RouterLink 
              to="/funky-rocket-showcase"
              class="group bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-lg rounded-3xl p-8 border border-blue-400/30 hover:border-blue-300/50 transition-all duration-300 hover:scale-[1.02] shadow-2xl block"
            >
              <div class="absolute top-4 right-4 bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded-full text-sm font-semibold">
                🆕 全新素材
              </div>
              <div class="flex items-start gap-6">
                <div class="text-6xl group-hover:scale-110 transition-transform duration-300">🎸</div>
                <div class="flex-1 text-left">
                  <h4 class="text-2xl font-bold mb-3 text-blue-300">Funky Rocket 動畫展示</h4>
                  <p class="text-slate-300 text-base mb-4 leading-relaxed">
                    專門展示 Funky Rocket 素材包的全新三個核心動畫：walk、jump、rocket
                  </p>
                  <div class="inline-flex items-center gap-2 text-blue-400 font-semibold text-lg">
                    查看動畫 <span class="group-hover:translate-x-2 transition-transform duration-300">→</span>
                  </div>
                </div>
              </div>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>