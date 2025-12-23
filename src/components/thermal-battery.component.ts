
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KernelDataService } from '../services/kernel-data.service';

@Component({
  selector: 'app-thermal-battery',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full overflow-y-auto p-4 space-y-6">
      
      <!-- Battery -->
      <section class="bg-gray-800 rounded-lg p-4 border border-gray-700 shadow-lg">
         <div class="flex items-center justify-between mb-4">
             <h3 class="text-success font-bold text-lg flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                Питание (BMS)
             </h3>
             <div class="text-2xl font-mono text-white">{{ks.batteryLevel()}}%</div>
         </div>

         <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs mb-4">
            <div class="bg-gray-900 p-2 rounded">
               <span class="text-gray-500 block">Напряжение</span>
               <span class="text-white font-mono">{{ks.batteryVoltage()}} мВ</span>
            </div>
             <div class="bg-gray-900 p-2 rounded">
               <span class="text-gray-500 block">Ток</span>
               <span class="text-white font-mono">{{ks.batteryCurrent()}} мА</span>
            </div>
             <div class="bg-gray-900 p-2 rounded">
               <span class="text-gray-500 block">Температура</span>
               <span class="text-white font-mono">{{ks.batteryTemp().toFixed(1)}} °C</span>
            </div>
            <div class="bg-gray-900 p-2 rounded">
               <span class="text-gray-500 block">Статус</span>
               <span class="text-white font-mono">{{ks.batteryStatus()}}</span>
            </div>
         </div>

         <div class="space-y-3">
            <div>
               <div class="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Лимит заряда</span>
                  <span class="text-white">{{ks.chargingLimit() === 0 ? 'Выкл' : ks.chargingLimit() + '%'}}</span>
               </div>
               <input type="range" min="0" max="100" [value]="ks.chargingLimit()" class="w-full h-1 bg-gray-700 rounded-lg cursor-pointer">
            </div>
             <div>
               <div class="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Лимит входящего тока</span>
                  <span class="text-white">{{ks.inputCurrentLimit()}} мкА</span>
               </div>
               <input type="range" min="0" max="3000000" step="50000" [value]="ks.inputCurrentLimit()" class="w-full h-1 bg-gray-700 rounded-lg cursor-pointer">
            </div>
         </div>
      </section>

      <!-- Cooling Devices -->
       <section class="bg-gray-800 rounded-lg p-4 border border-gray-700 shadow-lg">
         <h3 class="text-blue-400 font-bold text-lg mb-4 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path></svg>
            Устройства охлаждения
         </h3>
         <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
             @for (cdev of ks.coolingDevices(); track cdev.id) {
                 <div class="bg-gray-900 p-3 rounded">
                    <div class="flex justify-between mb-2">
                    <span class="text-xs text-gray-400 truncate pr-2" [title]="cdev.type">{{cdev.type}}</span>
                    <span class="text-xs font-mono font-bold text-white">{{cdev.curState}} / {{cdev.maxState}}</span>
                    </div>
                    <input type="range" min="0" [max]="cdev.maxState || 1" [value]="cdev.curState"
                           (input)="ks.setCoolingDeviceState(cdev.id, $any($event.target).value)" 
                           class="w-full h-1.5 bg-gray-700 rounded-lg cursor-pointer accent-blue-500 appearance-none">
                </div>
             }
         </div>
       </section>

      <!-- Thermal Zones -->
      <section class="bg-gray-800 rounded-lg p-4 border border-gray-700 shadow-lg">
         <h3 class="text-danger font-bold text-lg mb-4 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"></path></svg>
            Термальные зоны
         </h3>
         
         <div class="space-y-4">
            @for (zone of ks.thermalZones(); track zone.id) {
               <div class="bg-gray-900 rounded p-3 border-l-4"
                 [class.border-l-green-500]="zone.temp < 45"
                 [class.border-l-yellow-500]="zone.temp >= 45 && zone.temp < 60"
                 [class.border-l-red-500]="zone.temp >= 60">
                  
                  <div class="flex justify-between items-center mb-2">
                     <div>
                        <div class="text-gray-200 text-sm font-bold">{{zone.name}}</div>
                     </div>
                     <div class="text-2xl font-mono text-white">{{zone.temp.toFixed(1)}}°C</div>
                  </div>

                  @if (zone.trips && zone.trips.length > 0) {
                      <div class="mt-2 bg-gray-800 rounded p-2">
                        <div class="flex justify-between text-[10px] text-gray-500 uppercase border-b border-gray-700 pb-1 mb-1">
                            <span>Тип</span>
                            <span>Темп (°C)</span>
                            <span>Гист</span>
                        </div>
                        @for (trip of zone.trips; track trip.temp; let i = $index) {
                            <div class="flex justify-between items-center text-xs text-gray-300 font-mono py-1">
                                <span class="uppercase w-1/3" [class.text-red-400]="trip.type === 'critical'">{{trip.type}}</span>
                                <input type="number" [value]="trip.temp" 
                                    (change)="ks.updateThermalTrip(zone.id, i, 'temp', $any($event.target).value)"
                                    class="w-16 bg-gray-900 border border-gray-600 rounded px-1 text-center text-white">
                                <input type="number" [value]="trip.hysteresis" 
                                    (change)="ks.updateThermalTrip(zone.id, i, 'hysteresis', $any($event.target).value)"
                                    class="w-12 bg-gray-900 border border-gray-600 rounded px-1 text-center text-white">
                            </div>
                        }
                      </div>
                  }
               </div>
            }
         </div>
      </section>

    </div>
  `
})
export class ThermalBatteryComponent {
  ks = inject(KernelDataService);
}
