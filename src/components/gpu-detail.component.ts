
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KernelDataService } from '../services/kernel-data.service';

@Component({
  selector: 'app-gpu-detail',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full overflow-y-auto p-4 flex flex-col space-y-6">
      
      <!-- GPU Header -->
      <div class="w-full bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h2 class="text-2xl font-bold text-white">Adreno 610 v2</h2>
            <p class="text-gray-400 font-mono text-sm">/sys/class/kgsl/kgsl-3d0</p>
          </div>
          <div class="text-right">
             <div class="text-3xl font-bold text-red-400">{{ks.gpuFreq()}} МГц</div>
             <div class="text-xs text-gray-500">Текущая Частота</div>
          </div>
        </div>

        <div class="w-full bg-gray-900 rounded-full h-4 mb-6 relative overflow-hidden">
           <div class="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-green-500 to-red-500 transition-all duration-300"
                [style.width.%]="ks.gpuLoad()"></div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-gray-900 p-3 rounded border border-gray-700">
            <label class="block text-xs text-gray-500 mb-1">Мин. Частота (МГц)</label>
            <select class="w-full bg-gray-800 text-white text-sm border border-gray-600 rounded p-1">
              @for (freq of ks.GPU_FREQS; track freq) {
                <option [value]="freq" [selected]="freq === 320">{{freq}}</option>
              }
            </select>
          </div>
          <div class="bg-gray-900 p-3 rounded border border-gray-700">
            <label class="block text-xs text-gray-500 mb-1">Макс. Частота (МГц)</label>
            <select class="w-full bg-gray-800 text-white text-sm border border-gray-600 rounded p-1">
               @for (freq of ks.GPU_FREQS; track freq) {
                <option [value]="freq" [selected]="freq === 1260">{{freq}}</option>
              }
            </select>
          </div>
          <div class="bg-gray-900 p-3 rounded border border-gray-700 col-span-1 md:col-span-2">
            <label class="block text-xs text-gray-500 mb-1">Режим (Governor)</label>
            <select class="w-full bg-gray-800 text-white text-sm border border-gray-600 rounded p-1">
               @for (gov of ks.GPU_GOVERNORS; track gov) {
                 <option [value]="gov" [selected]="gov === ks.gpuGovernor()">{{gov}}</option>
               }
            </select>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- KGSL Power -->
        <div class="bg-gray-800 rounded-lg p-4 border border-gray-700 shadow-lg">
          <h3 class="text-white font-bold mb-4 border-b border-gray-700 pb-2">KGSL Флаги</h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center bg-gray-900 p-2 rounded">
               <span class="text-sm text-gray-300">Троттлинг (Throttling)</span>
               <button class="px-3 py-1 rounded text-xs font-bold transition-colors"
                  [class.bg-green-600]="ks.gpuThrottling()" [class.text-white]="ks.gpuThrottling()"
                  [class.bg-red-600]="!ks.gpuThrottling()" [class.text-white]="!ks.gpuThrottling()"
                  (click)="ks.gpuThrottling.set(!ks.gpuThrottling())">
                  {{ks.gpuThrottling() ? 'ВКЛ' : 'ВЫКЛ'}}
               </button>
            </div>
            
            <div class="flex justify-between items-center bg-gray-900 p-2 rounded">
               <span class="text-sm text-gray-300">Force Bus On</span>
               <button class="px-3 py-1 rounded text-xs font-bold transition-colors"
                  [class.bg-green-600]="ks.gpuForceBusOn()" [class.text-white]="ks.gpuForceBusOn()"
                  [class.bg-gray-600]="!ks.gpuForceBusOn()" [class.text-gray-400]="!ks.gpuForceBusOn()"
                  (click)="ks.gpuForceBusOn.set(!ks.gpuForceBusOn()); ks.writeTunable('/sys/class/kgsl/kgsl-3d0/force_bus_on', ks.gpuForceBusOn() ? 1 : 0)">
                  {{ks.gpuForceBusOn() ? 'ON' : 'OFF'}}
               </button>
            </div>

            <div class="flex justify-between items-center bg-gray-900 p-2 rounded">
               <span class="text-sm text-gray-300">Force Clk On</span>
               <button class="px-3 py-1 rounded text-xs font-bold transition-colors"
                  [class.bg-green-600]="ks.gpuForceClkOn()" [class.text-white]="ks.gpuForceClkOn()"
                  [class.bg-gray-600]="!ks.gpuForceClkOn()" [class.text-gray-400]="!ks.gpuForceClkOn()"
                  (click)="ks.gpuForceClkOn.set(!ks.gpuForceClkOn()); ks.writeTunable('/sys/class/kgsl/kgsl-3d0/force_clk_on', ks.gpuForceClkOn() ? 1 : 0)">
                  {{ks.gpuForceClkOn() ? 'ON' : 'OFF'}}
               </button>
            </div>

            <div class="flex justify-between items-center bg-gray-900 p-2 rounded">
               <span class="text-sm text-gray-300">Bus Split</span>
               <button class="px-3 py-1 rounded text-xs font-bold transition-colors"
                  [class.bg-green-600]="ks.gpuBusSplit()" [class.text-white]="ks.gpuBusSplit()"
                  [class.bg-gray-600]="!ks.gpuBusSplit()" [class.text-gray-400]="!ks.gpuBusSplit()"
                  (click)="ks.gpuBusSplit.set(!ks.gpuBusSplit()); ks.writeTunable('/sys/class/kgsl/kgsl-3d0/bus_split', ks.gpuBusSplit() ? 1 : 0)">
                  {{ks.gpuBusSplit() ? 'ON' : 'OFF'}}
               </button>
            </div>

             <div class="bg-gray-900 p-2 rounded text-xs">
               <div class="flex justify-between mb-1">
                 <span class="text-gray-400">Таймер простоя (мс)</span>
                 <span class="text-white font-mono">{{ks.gpuIdleTimer()}}</span>
               </div>
               <input type="range" min="50" max="5000" [value]="ks.gpuIdleTimer()" class="w-full h-1 bg-gray-700 rounded-lg cursor-pointer">
             </div>
          </div>
        </div>

        <div class="bg-gray-800 rounded-lg p-4 border border-gray-700 shadow-lg flex flex-col gap-4">
          <div>
            <h3 class="text-white font-bold mb-4 border-b border-gray-700 pb-2">Монитор шины (Busmon)</h3>
            <div class="space-y-3 font-mono text-sm">
              <div class="bg-gray-900 p-2 rounded">
                  <label class="block text-[10px] text-gray-400 mb-1">Режим (Governor)</label>
                  <select class="w-full bg-gray-800 text-white text-xs border border-gray-600 rounded p-1"
                          (change)="ks.setGpuBusMonGov($any($event.target).value)">
                     @for (gov of ks.BUS_GOVERNORS; track gov) {
                        <option [value]="gov" [selected]="gov === ks.gpuBusMonGov()">{{gov}}</option>
                     }
                  </select>
              </div>
              <div class="bg-gray-900 p-2 rounded">
                  <label class="block text-[10px] text-gray-400 mb-1">Целевая частота (МГц)</label>
                  <div class="flex items-center space-x-2">
                     <input type="range" min="200" max="2200" step="10" [value]="ks.gpuBusMonTargetFreq()"
                            (input)="ks.setGpuBusMonTargetFreq($any($event.target).value)" 
                            class="flex-1 h-1 bg-gray-700 rounded-lg cursor-pointer">
                     <span class="text-white w-16 text-right">{{ks.gpuBusMonTargetFreq()}}</span>
                  </div>
              </div>
            </div>
          </div>
          <div>
             <h3 class="text-white font-bold mb-4 border-b border-gray-700 pb-2">Уровни питания</h3>
             <div class="space-y-2 text-xs">
                <div class="bg-gray-900 p-2 rounded flex justify-between items-center">
                   <span class="text-gray-400">Мин. Уровень</span>
                   <div class="flex items-center space-x-2">
                       <span class="text-white font-mono">{{ks.gpuMinPwrLevel()}}</span>
                       <input type="range" min="0" max="6" [value]="ks.gpuMinPwrLevel()" 
                          (input)="ks.setGpuPowerLevel('min', $any($event.target).value)" 
                          class="w-20 h-1 bg-gray-700 rounded-lg cursor-pointer">
                   </div>
                </div>
                <div class="bg-gray-900 p-2 rounded flex justify-between items-center">
                   <span class="text-gray-400">Макс. Уровень</span>
                    <div class="flex items-center space-x-2">
                       <span class="text-white font-mono">{{ks.gpuMaxPwrLevel()}}</span>
                       <input type="range" min="0" max="6" [value]="ks.gpuMaxPwrLevel()" 
                          (input)="ks.setGpuPowerLevel('max', $any($event.target).value)" 
                          class="w-20 h-1 bg-gray-700 rounded-lg cursor-pointer">
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class GpuDetailComponent {
  ks = inject(KernelDataService);
}
