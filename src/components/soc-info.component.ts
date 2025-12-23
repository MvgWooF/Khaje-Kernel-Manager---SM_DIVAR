
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { KernelDataService } from '../services/kernel-data.service';

@Component({
  selector: 'app-soc-info',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full overflow-y-auto p-4 space-y-6 text-sm">
      
      <!-- Device Identity -->
      <section class="bg-gray-800 rounded-lg p-4 border border-gray-700 shadow-lg">
        <h3 class="text-primary font-bold text-lg mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg>
          Информация об устройстве
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-gray-900 p-3 rounded">
            <span class="text-gray-400 block text-xs">Платформа</span>
            <span class="text-white font-mono">{{ks.PLATFORM}}</span>
          </div>
          <div class="bg-gray-900 p-3 rounded">
             <span class="text-gray-400 block text-xs">Модель</span>
             <span class="text-white font-mono">KHAJE (SM_DIVAR)</span>
          </div>
          <div class="bg-gray-900 p-3 rounded">
             <span class="text-gray-400 block text-xs">Chip ID</span>
             <span class="text-white font-mono">518 (0x206)</span>
          </div>
          <div class="bg-gray-900 p-3 rounded">
             <span class="text-gray-400 block text-xs">Family</span>
             <span class="text-white font-mono">0x7e</span>
          </div>
           <div class="bg-gray-900 p-3 rounded">
             <span class="text-gray-400 block text-xs">PMIC</span>
             <span class="text-white font-mono">65581 (Rev 65537)</span>
          </div>
           <div class="bg-gray-900 p-3 rounded">
             <span class="text-gray-400 block text-xs">Серийный номер</span>
             <span class="text-white font-mono">2020022777</span>
          </div>
        </div>
      </section>

      <!-- Firmware Info -->
      <section class="bg-gray-800 rounded-lg p-4 border border-gray-700 shadow-lg">
        <h3 class="text-secondary font-bold text-lg mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
          Прошивка и Ядро
        </h3>
        <div class="space-y-2 font-mono text-xs text-gray-300">
          <div class="flex justify-between border-b border-gray-700 pb-2">
            <span>Версия ядра</span>
            <span class="text-white text-right">{{ks.KERNEL_VERSION}}</span>
          </div>
          <div class="flex justify-between border-b border-gray-700 pb-2">
            <span>Образ системы</span>
            <span class="text-white text-right">10:BP1A.250505.005.D1</span>
          </div>
          <div class="flex justify-between pt-2">
            <span>Архитектура</span>
            <span class="text-white text-right">aarch64 (Toybox)</span>
          </div>
           <div class="flex justify-between pt-2">
            <span>Сборщик</span>
            <span class="text-white text-right">{{ks.BUILD_USER}}</span>
          </div>
        </div>
      </section>
      
      <!-- Subsystems -->
      <section class="bg-gray-800 rounded-lg p-4 border border-gray-700 shadow-lg">
         <h3 class="text-success font-bold text-lg mb-4">Компоненты</h3>
         <div class="grid grid-cols-1 gap-2 text-xs font-mono">
           <div class="bg-gray-900 p-2 rounded flex justify-between">
              <span class="text-gray-400">MPSS (Модем)</span>
              <span class="text-white">11:MPSS.HA.1.1.c1-00097-DIVAR</span>
           </div>
           <div class="bg-gray-900 p-2 rounded flex justify-between">
              <span class="text-gray-400">ADSP (Аудио)</span>
              <span class="text-white">12:ADSP.VT.5.4.3.c1-00047-DIVAR</span>
           </div>
           <div class="bg-gray-900 p-2 rounded flex justify-between">
              <span class="text-gray-400">CDSP (Вычисления)</span>
              <span class="text-white">16:CDSP.VT.2.4.1-00268-KAMORTA</span>
           </div>
         </div>
      </section>

    </div>
  `
})
export class SocInfoComponent {
  ks = inject(KernelDataService);
}
