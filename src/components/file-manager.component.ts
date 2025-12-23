
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KernelDataService } from '../services/kernel-data.service';

@Component({
  selector: 'app-file-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full overflow-y-auto p-4 flex flex-col space-y-4">
      <div class="bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700">
        <h3 class="text-white font-bold mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
          Файловый менеджер (Root)
        </h3>
        
        <div class="flex space-x-2 mb-4">
          <input type="text" [(ngModel)]="path" class="flex-1 bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm font-mono text-white placeholder-gray-500" placeholder="/sys/...">
          <button (click)="readFile()" class="bg-primary hover:bg-sky-600 text-white px-4 py-2 rounded text-sm font-bold transition-colors">
            Читать
          </button>
        </div>

        <textarea [(ngModel)]="content" rows="10" class="w-full bg-gray-950 border border-gray-700 rounded p-3 font-mono text-xs text-green-400 mb-4 focus:outline-none focus:border-gray-500"></textarea>

        <div class="flex justify-end">
          <button (click)="saveFile()" class="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded text-sm font-bold flex items-center transition-colors">
            <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
            Записать (Root)
          </button>
        </div>
      </div>

      <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h4 class="text-sm font-bold text-gray-400 mb-2">Избранные пути:</h4>
        <div class="space-y-1">
          <button (click)="setPath('/proc/version')" class="block w-full text-left text-xs font-mono text-primary hover:text-white hover:bg-gray-700 p-1 rounded">/proc/version</button>
          <button (click)="setPath('/sys/devices/system/cpu/cpu0/cpufreq/scaling_governor')" class="block w-full text-left text-xs font-mono text-primary hover:text-white hover:bg-gray-700 p-1 rounded">.../cpu0/.../scaling_governor</button>
          <button (click)="setPath('/sys/class/kgsl/kgsl-3d0/gpu_busy_percentage')" class="block w-full text-left text-xs font-mono text-primary hover:text-white hover:bg-gray-700 p-1 rounded">.../kgsl-3d0/gpu_busy_percentage</button>
        </div>
      </div>
    </div>
  `
})
export class FileManagerComponent {
  ks = inject(KernelDataService);
  path = signal('/proc/version');
  content = signal('');

  setPath(p: string) {
    this.path.set(p);
    this.readFile();
  }

  readFile() {
    this.content.set(this.ks.readFile(this.path()));
  }

  saveFile() {
    if (confirm(`Вы уверены, что хотите перезаписать ${this.path()}?\nЭто действие необратимо.`)) {
      this.ks.writeFile(this.path(), this.content());
      alert('Команда отправлена в shell.');
    }
  }
}
