
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KernelDataService } from '../services/kernel-data.service';

@Component({
  selector: 'app-memory-io',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full overflow-y-auto p-4 space-y-6">
      
      <!-- DDR Bus & BWMON -->
      <section class="bg-gray-800 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
        <div class="bg-gray-750 p-3 border-b border-gray-700 flex justify-between items-center">
             <h3 class="text-indigo-400 font-bold flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
                Память DDR & BWMON
             </h3>
             <span class="text-xs font-mono text-gray-400">1b8e300.qcom,bwmon-ddr</span>
        </div>
        
        <div class="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
           <!-- Status -->
           <div class="bg-gray-900 p-4 rounded text-center border border-gray-700 flex flex-col justify-center">
              <span class="text-xs text-gray-500 uppercase">Текущая Частота</span>
              <div class="text-3xl font-mono text-white my-2">{{ks.formatFreq(ks.ddrFreq())}}</div>
              <span class="text-xs text-indigo-400">Режим: memlat</span>
           </div>
           
           <!-- Memlat Tunables -->
           <div class="space-y-3 bg-gray-900/50 p-3 rounded">
              <h4 class="text-xs text-gray-300 font-bold uppercase mb-2">Настройки Memlat</h4>
              
              <!-- Gold Cluster -->
              <div class="mb-2">
                <span class="text-[10px] text-yellow-500 font-bold block mb-1">GOLD Cluster</span>
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="text-[10px] text-gray-400">Мин. Частота</label>
                        <select class="w-full bg-gray-800 text-white text-xs border border-gray-600 rounded p-1">
                            @for (freq of ks.DDR_FREQS; track freq) {
                            <option [value]="freq" [selected]="freq === ks.memlatGoldMin()">{{ks.formatFreq(freq)}}</option>
                            }
                        </select>
                    </div>
                    <div>
                        <label class="text-[10px] text-gray-400">Макс. Частота</label>
                        <select class="w-full bg-gray-800 text-white text-xs border border-gray-600 rounded p-1">
                            @for (freq of ks.DDR_FREQS; track freq) {
                            <option [value]="freq" [selected]="freq === ks.memlatGoldMax()">{{ks.formatFreq(freq)}}</option>
                            }
                        </select>
                    </div>
                </div>
              </div>

              <!-- Silver Cluster -->
              <div>
                <span class="text-[10px] text-gray-400 font-bold block mb-1">SILVER Cluster</span>
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="text-[10px] text-gray-400">Мин. Частота</label>
                        <select class="w-full bg-gray-800 text-white text-xs border border-gray-600 rounded p-1">
                            @for (freq of ks.DDR_FREQS; track freq) {
                            <option [value]="freq" [selected]="freq === ks.memlatSilverMin()">{{ks.formatFreq(freq)}}</option>
                            }
                        </select>
                    </div>
                    <div>
                        <label class="text-[10px] text-gray-400">Макс. Частота</label>
                        <select class="w-full bg-gray-800 text-white text-xs border border-gray-600 rounded p-1">
                            @for (freq of ks.DDR_FREQS; track freq) {
                            <option [value]="freq" [selected]="freq === ks.memlatSilverMax()">{{ks.formatFreq(freq)}}</option>
                            }
                        </select>
                    </div>
                </div>
              </div>

           </div>
        </div>
      </section>

      <!-- UFS / IO -->
      <section class="bg-gray-800 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
        <div class="bg-gray-750 p-3 border-b border-gray-700 flex justify-between items-center">
            <h3 class="text-emerald-400 font-bold flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
            UFS Хранилище (4804000.ufshc)
            </h3>
        </div>
        <div class="p-4">
            <div class="flex items-center space-x-4 mb-4">
            <div class="bg-gray-900 px-4 py-2 rounded border border-gray-700">
                <span class="block text-xs text-gray-500">Частота шины</span>
                <span class="font-mono text-white">{{ks.formatFreqHz(ks.ufsFreq())}}</span>
            </div>
            <div class="flex-1">
                <label class="text-xs text-gray-400">Режим (Governor)</label>
                <select class="w-full bg-gray-900 text-white text-sm border border-gray-600 rounded p-1"
                  (change)="ks.setUfsGovernor($any($event.target).value)">
                    @for (gov of ks.UFS_GOVERNORS; track gov) {
                    <option [value]="gov" [selected]="gov === ks.ufsGovernor()">{{gov}}</option>
                    }
                </select>
            </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                <div class="bg-gray-900 p-2 rounded flex items-center justify-between">
                    <span class="text-xs text-gray-300">Clk Gate Enable</span>
                    <button class="w-10 h-5 rounded-full relative transition-colors duration-200"
                        [class.bg-emerald-600]="ks.ufsClkGateEnable()" [class.bg-gray-600]="!ks.ufsClkGateEnable()"
                        (click)="ks.ufsClkGateEnable.set(!ks.ufsClkGateEnable())">
                        <div class="absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200" 
                            [class.left-6]="ks.ufsClkGateEnable()" [class.left-1]="!ks.ufsClkGateEnable()"></div>
                    </button>
                </div>
                <div class="bg-gray-900 p-2 rounded">
                    <label class="text-[10px] text-gray-400 block">Read Ahead (KB)</label>
                    <input type="number" [value]="ks.ioReadAhead()" 
                           (change)="ks.setIoReadAhead($any($event.target).value)"
                           class="w-full bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 text-sm font-mono mt-1">
                </div>
            </div>

            <!-- Extended IO Settings -->
            <div class="mt-4 grid grid-cols-2 gap-4 bg-gray-900/50 p-2 rounded border border-gray-700/50">
                 <div>
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-[10px] text-gray-400">IO Add Random</span>
                        <input type="checkbox" [checked]="ks.ioAddRandom()" 
                               (change)="ks.ioAddRandom.set($any($event.target).checked); ks.writeTunable('/sys/block/sda/queue/add_random', $any($event.target).checked ? 1 : 0)"
                               class="accent-emerald-500">
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-[10px] text-gray-400">Rotational</span>
                        <span class="text-xs text-white font-mono">{{ks.ioRotational()}}</span>
                    </div>
                 </div>
                 <div>
                    <label class="text-[10px] text-gray-400 block">NR Requests</label>
                    <input type="number" [value]="ks.ioNrRequests()" 
                           (change)="ks.ioNrRequests.set($any($event.target).value); ks.writeTunable('/sys/block/sda/queue/nr_requests', $any($event.target).value)"
                           class="w-full bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 text-xs font-mono mt-1">
                 </div>
            </div>
        </div>
      </section>

      <!-- VM & Memory -->
      <section class="bg-gray-800 rounded-lg border border-gray-700 shadow-lg p-4">
         <h3 class="text-orange-400 font-bold mb-4 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Виртуальная память (VM) & ZRAM
         </h3>
         <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
                <div>
                   <div class="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Swappiness</span>
                      <span class="text-white font-mono">{{ks.vmSwappiness()}}</span>
                   </div>
                   <input type="range" min="0" max="200" [value]="ks.vmSwappiness()" 
                          (input)="ks.vmSwappiness.set($any($event.target).value); ks.writeTunable('/proc/sys/vm/swappiness', $any($event.target).value)" 
                          class="w-full h-1 bg-gray-700 rounded-lg cursor-pointer accent-orange-500">
                </div>
                 <div>
                   <div class="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Dirty Ratio</span>
                      <span class="text-white font-mono">{{ks.vmDirtyRatio()}}%</span>
                   </div>
                   <input type="range" min="0" max="100" [value]="ks.vmDirtyRatio()" 
                          (input)="ks.vmDirtyRatio.set($any($event.target).value); ks.writeTunable('/proc/sys/vm/dirty_ratio', $any($event.target).value)"
                          class="w-full h-1 bg-gray-700 rounded-lg cursor-pointer accent-orange-500">
                </div>
                 <div>
                   <div class="flex justify-between text-xs text-gray-400 mb-1">
                      <span>VFS Cache Pressure</span>
                      <span class="text-white font-mono">{{ks.vmVfsCachePressure()}}</span>
                   </div>
                   <input type="range" min="0" max="500" [value]="ks.vmVfsCachePressure()" 
                          (input)="ks.vmVfsCachePressure.set($any($event.target).value); ks.writeTunable('/proc/sys/vm/vfs_cache_pressure', $any($event.target).value)"
                          class="w-full h-1 bg-gray-700 rounded-lg cursor-pointer accent-orange-500">
                </div>
            </div>
            
            <div class="space-y-3">
                <div>
                   <label class="text-[10px] text-gray-400 block mb-1">Min Free Kbytes</label>
                   <input type="number" [value]="ks.vmMinFreeKbytes()" 
                          (change)="ks.vmMinFreeKbytes.set($any($event.target).value); ks.writeTunable('/proc/sys/vm/min_free_kbytes', $any($event.target).value)"
                          class="w-full bg-gray-900 text-white border border-gray-600 rounded px-2 py-1 text-sm font-mono">
                </div>
                
                <div class="bg-gray-900 p-3 rounded flex justify-between items-center border border-gray-700 mt-4">
                    <div>
                    <div class="text-xs text-gray-400">ZRAM Размер</div>
                    <div class="text-white font-bold">{{ks.zramSize()}} МБ</div>
                    </div>
                    <div class="text-right">
                    <div class="text-xs text-gray-400">Алгоритм</div>
                    <div class="text-orange-400 font-mono">{{ks.zramAlgo()}}</div>
                    </div>
                </div>
            </div>
         </div>
      </section>

    </div>
  `
})
export class MemoryIoComponent {
  ks = inject(KernelDataService);
}
