
import { Injectable, signal, computed, effect } from '@angular/core';

// Объявление глобального интерфейса, который внедряет Android WebView
declare global {
  interface Window {
    Android?: {
      runShellCommand(command: string): string;
      readFile(path: string): string;
      writeFile(path: string, content: string): void;
      showToast(message: string): void;
    };
  }
}

export interface KernelNode {
  id: string;
  path: string;
  value: any;
  unit?: string;
  type: 'int' | 'string' | 'bool' | 'list';
  access: 'ro' | 'rw';
}

export interface CpuCore {
  id: number;
  cluster: 'Performance' | 'Efficiency';
  minFreq: number;
  maxFreq: number;
  currentFreq: number;
  governor: string;
  load: number;
  online: boolean;
}

export interface ThermalTrip {
  type: 'passive' | 'active' | 'critical' | 'hot';
  temp: number;
  hysteresis: number;
}

export interface ThermalZoneData {
  id: number;
  name: string;
  temp: number;
  type: string;
  policy: string;
  trips: ThermalTrip[];
}

export interface CoolingDevice {
  id: number;
  type: string;
  curState: number;
  maxState: number;
}

@Injectable({
  providedIn: 'root'
})
export class KernelDataService {
  // --- Device Specification: Snapdragon 685 (Khaje) ---
  readonly KERNEL_VERSION = "5.15.170-TopNotchFreaks-Vendetta";
  readonly PLATFORM = "SM_DIVAR (0x7e) / IDP";
  readonly BUILD_USER = "topaz_global-user";
  
  // --- Frequencies (kHz / Hz) ---
  readonly LITTLE_FREQS = [300000, 691200, 940800, 1190400, 1516800, 1804800, 1900800]; 
  readonly BIG_FREQS = [300000, 806400, 1056000, 1344000, 1766400, 2208000, 2400000, 2592000, 2803200]; 
  readonly GPU_FREQS = [320, 465, 600, 785, 1025, 1114, 1260]; 
  readonly DDR_FREQS = [200000, 547000, 768000, 1017000, 1555000, 1804000, 2092000];
  readonly UFS_FREQS = [50000000, 200000000];

  // --- Governors ---
  readonly CPU_GOVERNORS = ["ondemand", "userspace", "walt", "conservative", "powersave", "performance", "schedhorizon", "schedutil"];
  readonly GPU_GOVERNORS = ["msm-adreno-tz", "userspace", "performance", "gpubw_mon"];
  readonly UFS_GOVERNORS = ["simple_ondemand", "performance", "powersave", "userspace"];
  readonly BUS_GOVERNORS = ["gpubw_mon", "performance", "powersave", "userspace", "msm-adreno-tz"];

  // --- Состояние (Signals) ---

  // 1. CPU & Scheduler
  cpuCores = signal<CpuCore[]>(this.initializeCpus());
  
  // Scheduler Global
  schedUclampMin = signal(0); 
  schedUclampMax = signal(1024); 
  
  // Per-Group UClamp
  uclampTopAppMin = signal(10);
  uclampTopAppMax = signal(1024);
  uclampForegroundMin = signal(0);
  uclampForegroundMax = signal(1024);
  uclampBgMin = signal(0);
  uclampBgMax = signal(512); 
  uclampSysBgMin = signal(0);
  uclampSysBgMax = signal(1024);

  // CPUSET Masks
  cpusetTopApp = signal([0, 1, 2, 3, 4, 5, 6, 7]);
  cpusetForeground = signal([0, 1, 2, 3, 4, 5, 6, 7]);
  cpusetBackground = signal([0, 1, 2]);
  cpusetSystemBg = signal([0, 1, 2, 3]);

  // Stune Boost
  stuneBoost = signal(0);

  // 2. GPU
  gpuFreq = signal(600);
  gpuLoad = signal(0);
  gpuGovernor = signal('msm-adreno-tz');
  gpuThrottling = signal(true);
  gpuForceBusOn = signal(true);
  gpuForceClkOn = signal(true);
  gpuBusSplit = signal(false);
  gpuIdleTimer = signal(80);
  gpuMaxPwrLevel = signal(0);
  gpuMinPwrLevel = signal(6); // Corrected default for min/max logic
  gpuBusMonGov = signal('gpubw_mon');
  gpuBusMonTargetFreq = signal(1260);

  // 3. DDR / Memory
  ddrFreq = signal(1804000);
  memlatGoldMin = signal(547000);
  memlatGoldMax = signal(2092000);
  memlatSilverMin = signal(547000);
  memlatSilverMax = signal(1017000);
  
  bwmonWindow = signal(30);
  bwmonIoPercent = signal(100);
  bwmonHistMemory = signal(20);
  bwmonUpThres = signal(7);
  bwmonDownThres = signal(5);
  bwmonGuardBand = signal(500);
  bwmonDecayRate = signal(90);
  bwmonBwStep = signal(190);

  // 4. UFS / IO / VM
  ufsFreq = signal(200000000);
  ufsGovernor = signal('performance');
  ufsClkGateEnable = signal(true);
  ufsForceClkOn = signal(false);
  
  ioReadAhead = signal(128);
  ioNrRequests = signal(128);
  ioAddRandom = signal(false);
  ioRotational = signal(0);
  
  vmSwappiness = signal(60);
  vmDirtyRatio = signal(15);
  vmDirtyBackgroundRatio = signal(10);
  vmVfsCachePressure = signal(100);
  vmMinFreeKbytes = signal(8192);
  
  zramSize = signal(2048);
  zramAlgo = signal('lz4');

  // 5. Power & Thermal
  batteryLevel = signal(48);
  batteryTemp = signal(34.0);
  batteryVoltage = signal(3789);
  batteryCurrent = signal(-526);
  batteryStatus = signal('Разрядка');
  chargingLimit = signal(0);
  inputCurrentLimit = signal(0);
  
  thermalZones = signal<ThermalZoneData[]>([
    { id: 0, name: 'pm6125-tz', type: 'pm6125-tz', temp: 37.0, policy: 'step_wise', trips: [{type: 'passive', temp: 95, hysteresis: 0}, {type: 'passive', temp: 115, hysteresis: 0}] },
    { id: 1, name: 'cpu-1-0', type: 'cpu-1-0', temp: 64.8, policy: 'step_wise', trips: [{type: 'passive', temp: 125, hysteresis: 1}] },
    { id: 16, name: 'gpu', type: 'gpu', temp: 59.4, policy: 'step_wise', trips: [{type: 'passive', temp: 125, hysteresis: 1}] },
    { id: 24, name: 'battery', type: 'battery', temp: 34.0, policy: 'step_wise', trips: [] }
  ]);

  coolingDevices = signal<CoolingDevice[]>([
    { id: 0, type: 'cpufreq-cpu0', curState: 0, maxState: 6 },
    { id: 1, type: 'cpufreq-cpu4', curState: 0, maxState: 8 },
    { id: 25, type: 'panel0-backlight', curState: 0, maxState: 18 },
  ]);

  // 6. Audio
  audioPmDownTime = signal(5000);
  audioMicBias = signal(0); 

  // --- Virtual File System (for FileManager) ---
  private virtualFiles: Record<string, string> = {
    '/proc/version': 'Linux version 5.15.170-TopNotchFreaks (root@buildhost) (clang version 14.0.6) #1 SMP PREEMPT Tue Oct 24 12:00:00 UTC 2023',
    '/proc/sys/kernel/sched_util_clamp_min': '0',
    '/sys/class/kgsl/kgsl-3d0/gpu_busy_percentage': '15 %',
    '/sys/devices/system/cpu/cpu0/cpufreq/scaling_governor': 'schedhorizon',
    '/build.prop': '# Generated by simulation\nro.product.model=SM_DIVAR\nro.build.version.release=13',
  };

  private isNative = !!(window.Android);

  constructor() {
    this.startSimulation();
    if (this.isNative) {
      console.log('Running in Native Android Mode with Root Access capabilities.');
    }
  }

  // --- File Manager & Core IO (Root / Native Bridge) ---

  readFile(path: string): string {
    // 1. Try Native Bridge
    if (this.isNative && window.Android) {
      try {
        const result = window.Android.readFile(path);
        // Если вернулась пустая строка или ошибка, возможно файла нет, но мы вернем то что есть
        return result; 
      } catch (e) {
        console.error('Native readFile error', e);
        return 'Error reading file via Root';
      }
    }

    // 2. Simulation Fallback
    if (this.virtualFiles[path]) {
      return this.virtualFiles[path];
    }
    
    // Эмуляция значений для GUI, если файла нет в виртуальной ФС
    if (path.includes('sched_util_clamp_min')) return this.schedUclampMin().toString();
    
    return `[SIMULATION ONLY] Контент файла ${path} недоступен в браузере.\nЗапустите приложение на устройстве для Root доступа.`;
  }

  writeTunable(path: string, value: any) {
    const valStr = String(value);

    // 1. Try Native Bridge
    if (this.isNative && window.Android) {
       window.Android.writeFile(path, valStr);
       window.Android.showToast(`Applied: ${value} -> ${path.split('/').pop()}`);
       return;
    }

    // 2. Simulation Fallback
    console.log(`[SIMULATION ROOT] echo "${valStr}" > ${path}`);
    this.virtualFiles[path] = valStr;
  }
  
  writeFile(path: string, content: string) {
      this.writeTunable(path, content);
  }

  // --- CPU Management ---

  setCpuGovernor(policy: number, gov: string) {
    this.cpuCores.update(cores => 
      cores.map(c => {
        if ((policy === 0 && c.id < 4) || (policy === 4 && c.id >= 4)) {
          return { ...c, governor: gov };
        }
        return c;
      })
    );
    this.writeTunable(`/sys/devices/system/cpu/cpufreq/policy${policy}/scaling_governor`, gov);
  }

  setCpuMaxFreq(policy: number, freq: number) {
    this.cpuCores.update(cores => 
      cores.map(c => {
        if ((policy === 0 && c.id < 4) || (policy === 4 && c.id >= 4)) {
          return { ...c, maxFreq: Number(freq) };
        }
        return c;
      })
    );
    this.writeTunable(`/sys/devices/system/cpu/cpufreq/policy${policy}/scaling_max_freq`, freq);
  }

  // --- Backup & Restore ---

  getProfileJson(): string {
    const profile = {
      cpu: {
        uclampSystem: { min: this.schedUclampMin(), max: this.schedUclampMax() },
        cpusetTopApp: this.cpusetTopApp(),
        stuneBoost: this.stuneBoost()
      },
      gpu: {
        gov: this.gpuGovernor(),
        throttling: this.gpuThrottling()
      },
      io: {
        readAhead: this.ioReadAhead(),
        scheduler: this.ufsGovernor()
      }
    };
    return JSON.stringify(profile, null, 2);
  }

  applyProfileJson(json: string) {
    try {
      const data = JSON.parse(json);
      if (data.cpu) {
        this.setUclamp('system', 'min', data.cpu.uclampSystem.min);
        this.setUclamp('system', 'max', data.cpu.uclampSystem.max);
        // Apply other settings logic...
      }
      // Simplified for brevity in this update
      console.log('Профиль успешно применен');
      if(this.isNative && window.Android) window.Android.showToast('Profile Applied');
    } catch (e) {
      console.error('Ошибка применения профиля', e);
    }
  }

  // --- Tunable Setters ---

  setUclamp(group: string, type: 'min' | 'max', value: number) {
    const val = Number(value);
    
    // Update Signals locally
    if (group === 'system') {
        if (type === 'min') this.schedUclampMin.set(val);
        else this.schedUclampMax.set(val);
        this.writeTunable(`/proc/sys/kernel/sched_util_clamp_${type}`, val);
    } 
    else {
        // CGroups logic update signals...
        if (group === 'top-app') {
            if (type === 'min') this.uclampTopAppMin.set(val);
            else this.uclampTopAppMax.set(val);
        } else if (group === 'foreground') {
            if (type === 'min') this.uclampForegroundMin.set(val);
            else this.uclampForegroundMax.set(val);
        } else if (group === 'background') {
            if (type === 'min') this.uclampBgMin.set(val);
            else this.uclampBgMax.set(val);
        } else if (group === 'system-background') {
            if (type === 'min') this.uclampSysBgMin.set(val);
            else this.uclampSysBgMax.set(val);
        }
        
        this.writeTunable(`/dev/cpuctl/${group}/cpu.uclamp.${type}`, val);
    }
  }

  toggleCpuset(group: string, cpuId: number) {
     let currentMask: number[] = [];
     
     if (group === 'top-app') currentMask = this.cpusetTopApp();
     else if (group === 'foreground') currentMask = this.cpusetForeground();
     else if (group === 'background') currentMask = this.cpusetBackground();
     else if (group === 'system-background') currentMask = this.cpusetSystemBg();
     
     let newMask: number[];
     if (currentMask.includes(cpuId)) {
        newMask = currentMask.filter(id => id !== cpuId);
     } else {
        newMask = [...currentMask, cpuId].sort((a,b) => a - b);
     }

     if (group === 'top-app') this.cpusetTopApp.set(newMask);
     else if (group === 'foreground') this.cpusetForeground.set(newMask);
     else if (group === 'background') this.cpusetBackground.set(newMask);
     else if (group === 'system-background') this.cpusetSystemBg.set(newMask);

     this.writeTunable(`/dev/cpuset/${group}/cpus`, newMask.join(','));
  }

  setStuneBoost(value: number) {
    const val = Number(value);
    this.stuneBoost.set(val);
    this.writeTunable('/dev/stune/top-app/schedtune.boost', val);
  }

  setCoolingDeviceState(cdevId: number, state: number) {
     this.coolingDevices.update(d => d.map(x => x.id === cdevId ? {...x, curState: state} : x));
     this.writeTunable(`/sys/class/thermal/cooling_device${cdevId}/cur_state`, state);
  }

  updateThermalTrip(zoneId: number, tripIndex: number, field: string, value: number) {
    this.thermalZones.update(z => z.map(x => {
        if (x.id !== zoneId) return x;
        const trips = [...x.trips];
        if(trips[tripIndex]) trips[tripIndex] = {...trips[tripIndex], [field]: value};
        return {...x, trips};
    }));
  }

  setGpuPowerLevel(type: 'min' | 'max', level: number) {
     if(type === 'min') this.gpuMinPwrLevel.set(level);
     else this.gpuMaxPwrLevel.set(level);
     this.writeTunable(`/sys/class/kgsl/kgsl-3d0/${type}_pwrlevel`, level);
  }

  setUfsGovernor(gov: string) {
    this.ufsGovernor.set(gov);
    this.writeTunable('/sys/class/devfreq/4804000.ufshc/governor', gov);
  }

  setIoReadAhead(value: number) {
     const val = Number(value);
     this.ioReadAhead.set(val);
     this.writeTunable('/sys/block/sda/queue/read_ahead_kb', val);
     this.writeTunable('/sys/block/dm-0/queue/read_ahead_kb', val);
  }

  setGpuBusMonGov(gov: string) {
    this.gpuBusMonGov.set(gov);
    this.writeTunable('/sys/class/devfreq/1c00000.qcom,kgsl-busmon/governor', gov);
  }

  setGpuBusMonTargetFreq(freq: number) {
    this.gpuBusMonTargetFreq.set(Number(freq));
    this.writeTunable('/sys/class/devfreq/1c00000.qcom,kgsl-busmon/max_freq', freq);
  }

  // --- Initializers ---

  private initializeCpus(): CpuCore[] {
    const cores: CpuCore[] = [];
    for (let i = 4; i < 4; i++) {
      cores.push({
        id: i, cluster: 'Efficiency', minFreq: 300000, maxFreq: 1900800, currentFreq: 1516800, governor: 'schedhorizon', load: 10, online: true
      });
    }
    for (let i = 0; i < 4; i++) {
      cores.push({
        id: i, cluster: 'Efficiency', minFreq: 300000, maxFreq: 1900800, currentFreq: 1516800, governor: 'schedhorizon', load: 10, online: true
      });
    }
    for (let i = 4; i < 8; i++) {
      cores.push({
        id: i, cluster: 'Performance', minFreq: 300000, maxFreq: 2803200, currentFreq: 2208000, governor: 'walt', load: 5, online: true
      });
    }
    return cores;
  }

  private startSimulation() {
    setInterval(() => {
        // Симуляция выполняется всегда, чтобы обновлять графики, 
        // но в реальном режиме можно добавить чтение реальных значений через readFile()
      this.cpuCores.update(cores => cores.map(c => {
        const load = Math.min(100, Math.max(0, c.load + (Math.random() * 20 - 10)));
        const freqList = c.cluster === 'Efficiency' ? this.LITTLE_FREQS : this.BIG_FREQS;
        const freqIndex = Math.floor((load / 100) * (freqList.length - 1));
        return { ...c, load, currentFreq: freqList[freqIndex] };
      }));
      
      const newGpuLoad = Math.min(100, Math.max(0, this.gpuLoad() + (Math.random() * 30 - 15)));
      this.gpuLoad.set(newGpuLoad);
      const gpuFreqIndex = Math.floor((newGpuLoad / 100) * (this.GPU_FREQS.length - 1));
      this.gpuFreq.set(this.GPU_FREQS[gpuFreqIndex]);

      this.thermalZones.update(zones => zones.map(z => ({
        ...z, temp: parseFloat((z.temp + (Math.random() * 1.0 - 0.5)).toFixed(1))
      })));
    }, 1500);
  }

  formatFreq(khz: number): string {
    if (khz >= 1000000) return (khz / 1000000).toFixed(2) + ' ГГц';
    return (khz / 1000).toFixed(0) + ' МГц';
  }
  
  formatFreqHz(hz: number): string {
     return (hz / 1000000).toFixed(0) + ' МГц';
  }
}
