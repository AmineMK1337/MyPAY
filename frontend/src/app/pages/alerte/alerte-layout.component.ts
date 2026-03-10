import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-alerte-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './alerte-layout.component.html',
  styleUrl: './alerte-layout.component.scss'
})
export class AlerteLayoutComponent {
  isActive(path: string): boolean {
    return typeof window !== 'undefined' && window.location.pathname.endsWith(path);
  }
}
