
import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KernelDataService } from '../services/kernel-data.service';

@Component({
  selector: 'app-audio-profiles',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full overflow-y-auto p-4 space-y-6">
      
      <!-- Audio Section -->
      <section class="bg-gray-800 rounded-lg border border-gray-700 p-4 shadow-lg">
        <h3 class="text-pink-400 font-bold text-lg mb-4 flex items-center">
           <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>
           Аудио подсистема (ALSA/DAPM)
        </h3>
        <div class="space-y-4">
           <div>
              <label class="text-xs text-gray-400 block mb-1">PM Down Time (ms)</label>
              <div class="flex items-center space-x-2">
                 <input type="number" [value]="ks.audioPmDownTime()" class="bg-gray-900 text-white border border-gray-600 rounded p-1 text-sm w-24">
                 <span class="text-xs text-gray-500">/sys/.../pm_down_time</span>
              </div>
           </div>
           <div>
              <label class="text-xs text-gray-400 block mb-1">Mic Bias</label>
              <div class="flex items-center space-x-2">
                 <input type="number" [value]="ks.audioMicBias()" class="bg-gray-900 text-white border border-gray-600 rounded p-1 text-sm w-24">
                 <span class="text-xs text-gray-500">/sys/.../mic_bias</span>
              </div>
           </div>
           <div class="p-2 bg-red-900/20 border border-red-900/50 rounded">
              <p class="text-[10px] text-red-300">Внимание: Неверные значения DAPM могут повредить динамик.</p>
           </div>
        </div>
      </section>

      <!-- Profiles & Backup Section -->
      <section class="bg-gray-800 rounded-lg border border-gray-700 p-4 shadow-lg">
         <h3 class="text-yellow-400 font-bold text-lg mb-4 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
            Профили и Резервные копии
         </h3>
         
         <div class="grid grid-cols-1 gap-3 mb-6">
            <div class="bg-gray-900 p-3 rounded border border-gray-700 flex justify-between items-center hover:bg-gray-750 cursor-pointer transition-colors group">
               <div>
                  <div class="font-bold text-white text-sm">Игры / Производительность</div>
                  <div class="text-[10px] text-gray-500">Применяет: CPU Max, GPU Performance, UFS Fast</div>
               </div>
               <button class="bg-gray-800 group-hover:bg-primary text-gray-300 group-hover:text-white px-3 py-1 rounded text-xs">Применить</button>
            </div>
            
            <div class="bg-gray-900 p-3 rounded border border-gray-700 flex justify-between items-center hover:bg-gray-750 cursor-pointer transition-colors group">
               <div>
                  <div class="font-bold text-white text-sm">Энергосбережение</div>
                  <div class="text-[10px] text-gray-500">Применяет: Efficiency Core bias, GPU Powersave</div>
               </div>
               <button class="bg-gray-800 group-hover:bg-success text-gray-300 group-hover:text-white px-3 py-1 rounded text-xs">Применить</button>
            </div>
         </div>

         <div class="bg-gray-900 p-4 rounded border border-gray-700">
             <h4 class="text-sm font-bold text-white mb-2">Резервное копирование настроек (JSON)</h4>
             <div class="flex gap-2">
                <button (click)="exportProfile()" class="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-xs py-2 rounded border border-gray-600">Экспорт в JSON</button>
                <button (click)="importProfile()" class="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-xs py-2 rounded border border-gray-600">Импорт из JSON</button>
             </div>
             @if (backupJson()) {
                 <div class="mt-3">
                    <p class="text-[10px] text-gray-400 mb-1">Скопируйте этот код:</p>
                    <textarea readonly class="w-full h-24 bg-black text-green-400 font-mono text-[10px] p-2 rounded border border-gray-700" [value]="backupJson()"></textarea>
                 </div>
             }
         </div>
      </section>

    </div>
  `
})
export class AudioProfilesComponent {
  ks = inject(KernelDataService);
  backupJson = signal<string>('');

  exportProfile() {
      this.backupJson.set(this.ks.getProfileJson());
  }

  importProfile() {
      const json = prompt("Вставьте JSON код профиля:");
      if (json) {
          this.ks.applyProfileJson(json);
          alert('Профиль применен!');
      }
  }
}
