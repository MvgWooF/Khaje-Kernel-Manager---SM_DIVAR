
import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CpuDetailComponent } from './components/cpu-detail.component';
import { GpuDetailComponent } from './components/gpu-detail.component';
import { MemoryIoComponent } from './components/memory-io.component';
import { ThermalBatteryComponent } from './components/thermal-battery.component';
import { AudioProfilesComponent } from './components/audio-profiles.component';
import { SocInfoComponent } from './components/soc-info.component';
import { FileManagerComponent } from './components/file-manager.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    CpuDetailComponent, 
    GpuDetailComponent, 
    MemoryIoComponent,
    ThermalBatteryComponent, 
    AudioProfilesComponent,
    SocInfoComponent,
    FileManagerComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html'
})
export class AppComponent {
  activeTab = signal<'cpu' | 'gpu' | 'memory' | 'power' | 'audio' | 'soc' | 'files'>('cpu');
  sidebarOpen = signal(false);
  
  tabName = computed(() => {
    switch (this.activeTab()) {
      case 'cpu': return 'CPU & Планировщик';
      case 'gpu': return 'Графика (GPU Adreno 610)';
      case 'memory': return 'Память & I/O';
      case 'power': return 'Питание & Охлаждение';
      case 'audio': return 'Аудио, Профили & Бэкап';
      case 'files': return 'Файловый Менеджер (Root)';
      case 'soc': return 'Информация о системе';
      default: return 'Панель управления';
    }
  });

  navigate(tab: 'cpu' | 'gpu' | 'memory' | 'power' | 'audio' | 'soc' | 'files') {
    this.activeTab.set(tab);
    this.sidebarOpen.set(false); // Закрываем меню на мобильном после клика
  }
}
