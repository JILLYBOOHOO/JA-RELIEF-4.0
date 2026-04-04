import { Component } from '@angular/core';
import { AlertService } from '../../services/alert.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-wifi-access',
  templateUrl: './wifi-access.component.html',
  styleUrls: ['./wifi-access.component.css']
})
export class WifiAccessComponent {
  voucherCode = 'JA-RELIEF-1234';

  constructor(private alertService: AlertService, private router: Router) {}

  goToContact() {
    this.router.navigate(['/contact-us']);
  }

  copyCode() {
    navigator.clipboard.writeText(this.voucherCode).then(() => {
      this.alertService.show({
        type: 'success',
        title: 'Copied!',
        message: 'Voucher code JA-RELIEF-1234 copied to clipboard.',
        btnText: 'Great'
      });
    });
  }
}
