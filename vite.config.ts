import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    chunkSizeWarningLimit: 600, // Increase the warning limit to avoid the warning
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code into separate chunks
          'react-vendor': ['react', 'react-dom'],
          'lucide-vendor': ['lucide-react'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'utils': [
            './src/utils/achievements.ts',
            './src/utils/audioPlayer.ts',
            './src/utils/battlePass.ts',
            './src/utils/battleSystem.ts',
            './src/utils/cosmeticSystem.ts',
            './src/utils/dailyRewards.ts',
            './src/utils/energySystem.ts',
            './src/utils/entityGenerator.ts',
            './src/utils/events.ts',
            './src/utils/gachaSystem.ts',
            './src/utils/questSystem.ts',
            './src/utils/weather.ts'
          ]
        }
      }
    }
  }
});