import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { SpeechService } from '../../services/speech.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isDarkMode = false;
  isListening = false;
  currentVoiceMode: 'command' | 'dictation' | 'none' = 'none';
  deferredPrompt: any;
  showInstallButton = false;
  isOnline = navigator.onLine;
  get currentUser(): User | null {
    // Zero-Dependency Bridge: Read directly from local storage
    const saved = localStorage.getItem('survivor_user');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        // Robust name detection for Katie
        if (user.email?.toLowerCase().includes('katie') || (user.identifier && user.identifier.toLowerCase().includes('katie'))) {
           user.name = user.name || 'Katie';
        }
        return user;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  constructor(
    public authService: AuthService,
    public speechService: SpeechService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      document.body.classList.add('dark-theme');
    }

    this.speechService.voiceMode$.subscribe(mode => {
      this.currentVoiceMode = mode;
      this.isListening = (mode === 'dictation');
      this.cdr.detectChanges();
    });

    // Subscribing just for Change Detection trigger
    this.authService.currentUser$.subscribe(() => {
      this.cdr.detectChanges();
    });

    // PWA Install Logic
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton = true;
      this.cdr.detectChanges();
    });

    // Online/Offline Monitoring
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.cdr.detectChanges();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.cdr.detectChanges();
    });

    // High-Frequency Sync Heartbeat (Force refresh logout button)
    setInterval(() => {
       this.cdr.detectChanges();
       this.cdr.markForCheck();
    }, 1000);
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    const modeText = this.isDarkMode ? 'Dark mode enabled' : 'Light mode enabled';
    this.speechService.speak(modeText);

    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }

  toggleVoice(): void {
    this.speechService.toggleListening('dictation');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  installApp(): void {
    if (!this.deferredPrompt) return;
    this.deferredPrompt.prompt();
    this.deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        this.showInstallButton = false;
      }
      this.deferredPrompt = null;
      this.cdr.detectChanges();
    });
  }
}

