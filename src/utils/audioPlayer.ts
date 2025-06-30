export class AudioPlayer {
  private static instance: AudioPlayer;
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private isMuted: boolean = false;

  private constructor() {
    // Initialize Web Audio API
    if (typeof window !== 'undefined') {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.warn('Web Audio API not supported in this browser');
      }
    }
  }

  public static getInstance(): AudioPlayer {
    if (!AudioPlayer.instance) {
      AudioPlayer.instance = new AudioPlayer();
    }
    return AudioPlayer.instance;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  // Generate synthetic sounds using Web Audio API
  private createTone(frequency: number, duration: number, type: OscillatorType = 'sine'): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });

    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let value = 0;
      
      switch (type) {
        case 'sine':
          value = Math.sin(2 * Math.PI * frequency * t);
          break;
        case 'square':
          value = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
          break;
        case 'sawtooth':
          value = 2 * (t * frequency - Math.floor(t * frequency + 0.5));
          break;
        case 'triangle':
          value = 2 * Math.abs(2 * (t * frequency - Math.floor(t * frequency + 0.5))) - 1;
          break;
      }
      
      // Apply envelope (fade in/out)
      const envelope = Math.sin(Math.PI * i / length);
      data[i] = value * envelope * 0.3; // Reduce volume
    }

    return buffer;
  }

  private createNoise(duration: number, filterFreq: number = 1000): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });

    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.1; // White noise, low volume
    }

    return buffer;
  }

  private createComplexTone(frequencies: number[], duration: number): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });

    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let value = 0;
      
      // Mix multiple frequencies
      frequencies.forEach((freq, index) => {
        const amplitude = 1 / frequencies.length; // Normalize amplitude
        value += amplitude * Math.sin(2 * Math.PI * freq * t);
      });
      
      // Apply envelope (fade in/out)
      const envelope = Math.sin(Math.PI * i / length);
      data[i] = value * envelope * 0.4;
    }

    return buffer;
  }

  public async initializeSounds(): Promise<void> {
    if (!this.audioContext) return;

    try {
      // Generate enhanced synthetic ritual sounds
      this.sounds.set('rune_select', this.createTone(440, 0.2, 'sine'));
      this.sounds.set('rune_deselect', this.createTone(220, 0.15, 'sine'));
      this.sounds.set('parameter_change', this.createTone(330, 0.1, 'triangle'));
      this.sounds.set('invoke_start', this.createComplexTone([110, 165, 220], 1.5));
      this.sounds.set('entity_manifest', this.createComplexTone([660, 880, 1100], 1.0));
      this.sounds.set('collect_entity', this.createComplexTone([880, 1320, 1760], 0.6));
      this.sounds.set('sacrifice_entity', this.createNoise(0.8, 500));
      this.sounds.set('gacha_pull', this.createComplexTone([523, 659, 784, 1047], 1.0));
      this.sounds.set('gacha_reveal', this.createComplexTone([1047, 1319, 1568, 2093], 0.8));
      this.sounds.set('portal_open', this.createComplexTone([87, 130, 174, 220], 1.2));
      this.sounds.set('reality_tear', this.createNoise(0.8, 200));
    } catch (error) {
      console.warn('Failed to initialize audio:', error);
    }
  }

  public async playSound(soundName: string, volume: number = 0.5): Promise<void> {
    if (this.isMuted || !this.audioContext || !this.sounds.has(soundName)) return;

    try {
      // Resume audio context if suspended (required by browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const buffer = this.sounds.get(soundName);
      if (!buffer) return;

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = buffer;
      gainNode.gain.value = Math.max(0, Math.min(1, volume));
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start();
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }

  public async playChord(frequencies: number[], duration: number = 0.5): Promise<void> {
    if (this.isMuted || !this.audioContext) return;

    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          if (!this.audioContext) return;
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();
          
          oscillator.frequency.value = freq;
          oscillator.type = 'sine';
          gainNode.gain.value = 0.1;
          
          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext.destination);
          
          oscillator.start();
          oscillator.stop(this.audioContext.currentTime + duration);
        }, index * 100);
      });
    } catch (error) {
      console.warn('Failed to play chord:', error);
    }
  }

  public async playSequence(sounds: { name: string; delay: number; volume?: number }[]): Promise<void> {
    if (this.isMuted) return;
    
    sounds.forEach(({ name, delay, volume = 0.5 }) => {
      setTimeout(() => this.playSound(name, volume), delay);
    });
  }
}

// Convenience functions
export const audioPlayer = AudioPlayer.getInstance();

export const playRuneSound = (isSelecting: boolean) => {
  audioPlayer.playSound(isSelecting ? 'rune_select' : 'rune_deselect', 0.3);
};

export const playParameterSound = () => {
  audioPlayer.playSound('parameter_change', 0.2);
};

export const playInvokeSound = () => {
  // Play enhanced invocation sequence
  audioPlayer.playSequence([
    { name: 'invoke_start', delay: 0, volume: 0.4 },
    { name: 'portal_open', delay: 500, volume: 0.3 },
    { name: 'reality_tear', delay: 1500, volume: 0.2 }
  ]);
};

export const playManifestSound = (entityType: string) => {
  // Play manifestation sound first
  audioPlayer.playSound('entity_manifest', 0.5);
  
  // Play type-specific chord with delay
  setTimeout(() => {
    switch (entityType) {
      case 'demon':
        audioPlayer.playChord([110, 146.83, 174.61], 1.5); // Dark minor chord
        break;
      case 'divine':
        audioPlayer.playChord([261.63, 329.63, 392.00], 1.5); // Bright major chord
        break;
      case 'ancient':
        audioPlayer.playChord([87.31, 103.83, 130.81], 2.0); // Deep, ominous chord
        break;
    }
  }, 300);
};

export const playCollectSound = () => {
  audioPlayer.playSound('collect_entity', 0.4);
};

export const playSacrificeSound = () => {
  audioPlayer.playSound('sacrifice_entity', 0.3);
};

export const playGachaPullSound = () => {
  // Simpler sequence with fewer sounds
  audioPlayer.playSound('gacha_pull', 0.4);
  
  // Add a delay before the reveal sound
  setTimeout(() => {
    audioPlayer.playSound('gacha_reveal', 0.5);
  }, 2000);
};