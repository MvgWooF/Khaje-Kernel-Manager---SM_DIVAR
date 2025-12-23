
import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KernelDataService } from '../services/kernel-data.service';

@Component({
  selector: 'app-cpu-detail',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full overflow-y-auto p-4 space-y-6 pb-20 md:pb-4">
      
      <!-- Cluster 0 -->
      <div class="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden shadow-lg">
        <div class="bg-gray-750 p-3 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h3 class="text-white font-bold">Policy 0: Эффективность (LITTLE)</h3>
            <p class="text-xs text-gray-400 font-mono">Cortex-A53 • 4 Ядра</p>
          </div>
          <span class="bg-primary/20 text-primary text-xs px-2 py-1 rounded font-mono">Max: 1.9 ГГц</span>
        </div>
        <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
             <label class="text-xs text-gray-400 uppercase">Режим (Governor)</label>
             <select class="w-full bg-gray-900 text-white text-sm border border-gray-600 rounded p-2 mt-1"
                (change)="ks.setCpuGovernor(0, $any($event.target).value)">
               @for (gov of ks.CPU_GOVERNORS; track gov) {
                 <option [value]="gov" [selected]="gov === 'schedhorizon'">{{gov}}</option>
               }
             </select>
          </div>
          <div>
             <label class="text-xs text-gray-400 uppercase">Макс. Частота</label>
             <select class="w-full bg-gray-900 text-white text-sm border border-gray-600 rounded p-2 mt-1"
                (change)="ks.setCpuMaxFreq(0, $any($event.target).value)">
               @for (freq of ks.LITTLE_FREQS; track freq) {
                 <option [value]="freq" [selected]="freq === 1900800">{{ks.formatFreq(freq)}}</option>
               }
             </select>
          </div>
          <div class="col-span-1 md:col-span-2 space-y-2 mt-2">
             @for (core of efficiencyCores(); track core.id) {
               <div class="flex items-center space-x-2 text-xs">
                 <span class="w-8 text-gray-500 font-mono">CPU{{core.id}}</span>
                 <div class="flex-1 bg-gray-900 rounded-full h-2 overflow-hidden">
                    <div class="bg-primary h-full transition-all duration-300" [style.width.%]="core.load"></div>
                 </div>
                 <span class="w-16 text-right font-mono">{{ks.formatFreq(core.currentFreq)}}</span>
               </div>
             }
          </div>
        </div>
      </div>

      <!-- Cluster 1 -->
      <div class="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden shadow-lg">
        <div class="bg-gray-750 p-3 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h3 class="text-white font-bold">Policy 4: Производительность (BIG)</h3>
             <p class="text-xs text-gray-400 font-mono">Cortex-A73 • 4 Ядра</p>
          </div>
          <span class="bg-secondary/20 text-secondary text-xs px-2 py-1 rounded font-mono">Max: 2.8 ГГц</span>
        </div>
        <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
             <label class="text-xs text-gray-400 uppercase">Режим (Governor)</label>
             <select class="w-full bg-gray-900 text-white text-sm border border-gray-600 rounded p-2 mt-1"
                (change)="ks.setCpuGovernor(4, $any($event.target).value)">
               @for (gov of ks.CPU_GOVERNORS; track gov) {
                 <option [value]="gov" [selected]="gov === 'walt'">{{gov}}</option>
               }
             </select>
          </div>
          <div>
             <label class="text-xs text-gray-400 uppercase">Макс. Частота</label>
             <select class="w-full bg-gray-900 text-white text-sm border border-gray-600 rounded p-2 mt-1"
                (change)="ks.setCpuMaxFreq(4, $any($event.target).value)">
               @for (freq of ks.BIG_FREQS; track freq) {
                 <option [value]="freq" [selected]="freq === 2803200">{{ks.formatFreq(freq)}}</option>
               }
             </select>
          </div>
          <div class="col-span-1 md:col-span-2 space-y-2 mt-2">
             @for (core of performanceCores(); track core.id) {
               <div class="flex items-center space-x-2 text-xs">
                 <span class="w-8 text-gray-500 font-mono">CPU{{core.id}}</span>
                 <div class="flex-1 bg-gray-900 rounded-full h-2 overflow-hidden">
                    <div class="bg-secondary h-full transition-all duration-300" [style.width.%]="core.load"></div>
                 </div>
                 <span class="w-16 text-right font-mono">{{ks.formatFreq(core.currentFreq)}}</span>
               </div>
             }
          </div>
        </div>
      </div>

      <!-- Advanced Tunables -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-gray-800 rounded-lg border border-gray-700 p-4 shadow-lg">
          <h3 class="text-white font-bold mb-3 flex items-center text-sm uppercase tracking-wide">
             <svg class="w-4 h-4 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
             Группы UClamp (Планировщик)
          </h3>
          <div class="space-y-4">
             <!-- Global System -->
             <div class="bg-gray-900/50 p-2 rounded border border-gray-700/50">
                <div class="flex justify-between text-xs text-gray-300 font-bold mb-1">Global System</div>
                <div class="grid grid-cols-2 gap-3">
                   <div>
                     <span class="text-[10px] text-gray-500 block">Min: {{ks.schedUclampMin()}}</span>
                     <input type="range" min="0" max="1024" [value]="ks.schedUclampMin()" 
                        (input)="ks.setUclamp('system', 'min', $any($event.target).value)"
                        class="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer">
                   </div>
                   <div>
                     <span class="text-[10px] text-gray-500 block">Max: {{ks.schedUclampMax()}}</span>
                     <input type="range" min="0" max="1024" [value]="ks.schedUclampMax()" 
                        (input)="ks.setUclamp('system', 'max', $any($event.target).value)"
                        class="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer">
                   </div>
                </div>
             </div>

             <!-- Top App -->
             <div class="bg-gray-900/50 p-2 rounded border border-gray-700/50">
                <div class="flex justify-between text-xs text-purple-300 font-bold mb-1">Top App (Active)</div>
                <div class="grid grid-cols-2 gap-3">
                   <div>
                     <span class="text-[10px] text-gray-500 block">Min: {{ks.uclampTopAppMin()}}</span>
                     <input type="range" min="0" max="1024" [value]="ks.uclampTopAppMin()" 
                        (input)="ks.setUclamp('top-app', 'min', $any($event.target).value)"
                        class="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500">
                   </div>
                   <div>
                     <span class="text-[10px] text-gray-500 block">Max: {{ks.uclampTopAppMax()}}</span>
                     <input type="range" min="0" max="1024" [value]="ks.uclampTopAppMax()" 
                        (input)="ks.setUclamp('top-app', 'max', $any($event.target).value)"
                        class="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500">
                   </div>
                </div>
             </div>

             <!-- Foreground -->
             <div class="bg-gray-900/50 p-2 rounded border border-gray-700/50">
                <div class="flex justify-between text-xs text-blue-300 font-bold mb-1">Foreground</div>
                <div class="grid grid-cols-2 gap-3">
                   <div>
                     <span class="text-[10px] text-gray-500 block">Min: {{ks.uclampForegroundMin()}}</span>
                     <input type="range" min="0" max="1024" [value]="ks.uclampForegroundMin()" 
                        (input)="ks.setUclamp('foreground', 'min', $any($event.target).value)"
                        class="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500">
                   </div>
                   <div>
                     <span class="text-[10px] text-gray-500 block">Max: {{ks.uclampForegroundMax()}}</span>
                     <input type="range" min="0" max="1024" [value]="ks.uclampForegroundMax()" 
                        (input)="ks.setUclamp('foreground', 'max', $any($event.target).value)"
                        class="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500">
                   </div>
                </div>
             </div>

             <!-- Background -->
             <div class="bg-gray-900/50 p-2 rounded border border-gray-700/50">
                <div class="flex justify-between text-xs text-gray-400 font-bold mb-1">Background</div>
                <div class="grid grid-cols-2 gap-3">
                   <div>
                     <span class="text-[10px] text-gray-500 block">Min: {{ks.uclampBgMin()}}</span>
                     <input type="range" min="0" max="1024" [value]="ks.uclampBgMin()" 
                        (input)="ks.setUclamp('background', 'min', $any($event.target).value)"
                        class="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gray-500">
                   </div>
                   <div>
                     <span class="text-[10px] text-gray-500 block">Max: {{ks.uclampBgMax()}}</span>
                     <input type="range" min="0" max="1024" [value]="ks.uclampBgMax()" 
                        (input)="ks.setUclamp('background', 'max', $any($event.target).value)"
                        class="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gray-500">
                   </div>
                </div>
             </div>

             <!-- System Background -->
             <div class="bg-gray-900/50 p-2 rounded border border-gray-700/50">
                <div class="flex justify-between text-xs text-yellow-500 font-bold mb-1">System Background</div>
                <div class="grid grid-cols-2 gap-3">
                   <div>
                     <span class="text-[10px] text-gray-500 block">Min: {{ks.uclampSysBgMin()}}</span>
                     <input type="range" min="0" max="1024" [value]="ks.uclampSysBgMin()" 
                        (input)="ks.setUclamp('system-background', 'min', $any($event.target).value)"
                        class="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-600">
                   </div>
                   <div>
                     <span class="text-[10px] text-gray-500 block">Max: {{ks.uclampSysBgMax()}}</span>
                     <input type="range" min="0" max="1024" [value]="ks.uclampSysBgMax()" 
                        (input)="ks.setUclamp('system-background', 'max', $any($event.target).value)"
                        class="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-600">
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div class="space-y-6">
            <div class="bg-gray-800 rounded-lg border border-gray-700 p-4 shadow-lg">
                <h3 class="text-white font-bold mb-3 flex items-center text-sm uppercase tracking-wide">
                    CPUSET (Маски Ядер)
                </h3>
                <div class="space-y-4">
                    
                    <!-- Top App -->
                    <div class="bg-gray-900 p-2 rounded">
                        <span class="block text-purple-400 text-xs mb-2 font-bold">Top App (Active)</span>
                        <div class="flex space-x-1 overflow-x-auto">
                            @for (cpu of [0,1,2,3,4,5,6,7]; track cpu) {
                            <button class="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded text-xs font-bold border border-gray-700 transition-colors cursor-pointer"
                                (click)="ks.toggleCpuset('top-app', cpu)"
                                [class.bg-purple-600]="ks.cpusetTopApp().includes(cpu)"
                                [class.text-white]="ks.cpusetTopApp().includes(cpu)"
                                [class.bg-gray-800]="!ks.cpusetTopApp().includes(cpu)"
                                [class.text-gray-500]="!ks.cpusetTopApp().includes(cpu)">{{cpu}}</button>
                            }
                        </div>
                    </div>

                    <!-- Foreground -->
                    <div class="bg-gray-900 p-2 rounded">
                        <span class="block text-blue-400 text-xs mb-2 font-bold">Foreground</span>
                        <div class="flex space-x-1 overflow-x-auto">
                            @for (cpu of [0,1,2,3,4,5,6,7]; track cpu) {
                            <button class="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded text-xs font-bold border border-gray-700 transition-colors cursor-pointer"
                                (click)="ks.toggleCpuset('foreground', cpu)"
                                [class.bg-blue-600]="ks.cpusetForeground().includes(cpu)"
                                [class.text-white]="ks.cpusetForeground().includes(cpu)"
                                [class.bg-gray-800]="!ks.cpusetForeground().includes(cpu)"
                                [class.text-gray-500]="!ks.cpusetForeground().includes(cpu)">{{cpu}}</button>
                            }
                        </div>
                    </div>

                    <!-- Background -->
                    <div class="bg-gray-900 p-2 rounded">
                        <span class="block text-gray-400 text-xs mb-2 font-bold">Background</span>
                        <div class="flex space-x-1 overflow-x-auto">
                            @for (cpu of [0,1,2,3,4,5,6,7]; track cpu) {
                            <button class="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded text-xs font-bold border border-gray-700 transition-colors cursor-pointer"
                                (click)="ks.toggleCpuset('background', cpu)"
                                [class.bg-gray-600]="ks.cpusetBackground().includes(cpu)"
                                [class.text-white]="ks.cpusetBackground().includes(cpu)"
                                [class.bg-gray-800]="!ks.cpusetBackground().includes(cpu)"
                                [class.text-gray-500]="!ks.cpusetBackground().includes(cpu)">{{cpu}}</button>
                            }
                        </div>
                    </div>

                    <!-- System BG -->
                    <div class="bg-gray-900 p-2 rounded">
                        <span class="block text-yellow-500 text-xs mb-2 font-bold">System Background</span>
                        <div class="flex space-x-1 overflow-x-auto">
                            @for (cpu of [0,1,2,3,4,5,6,7]; track cpu) {
                            <button class="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded text-xs font-bold border border-gray-700 transition-colors cursor-pointer"
                                (click)="ks.toggleCpuset('system-background', cpu)"
                                [class.bg-yellow-600]="ks.cpusetSystemBg().includes(cpu)"
                                [class.text-white]="ks.cpusetSystemBg().includes(cpu)"
                                [class.bg-gray-800]="!ks.cpusetSystemBg().includes(cpu)"
                                [class.text-gray-500]="!ks.cpusetSystemBg().includes(cpu)">{{cpu}}</button>
                            }
                        </div>
                    </div>

                </div>
            </div>

            <div class="bg-gray-800 rounded-lg border border-gray-700 p-4 shadow-lg">
                <h3 class="text-white font-bold mb-3 flex items-center text-sm uppercase tracking-wide">
                    Stune / Boost
                </h3>
                <div class="bg-gray-900 p-3 rounded">
                     <div class="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Schedtune Boost (Top App)</span>
                        <span class="text-white font-mono">{{ks.stuneBoost()}}</span>
                     </div>
                     <input type="range" min="0" max="100" [value]="ks.stuneBoost()"
                            (input)="ks.setStuneBoost($any($event.target).value)" 
                            class="w-full h-1 bg-gray-700 rounded-lg cursor-pointer accent-purple-500">
                </div>
            </div>
        </div>
      </div>
    </div>
  `
})
export class CpuDetailComponent {
  ks = inject(KernelDataService);
  efficiencyCores = computed(() => this.ks.cpuCores().filter(c => c.cluster === 'Efficiency'));
  performanceCores = computed(() => this.ks.cpuCores().filter(c => c.cluster === 'Performance'));
}
