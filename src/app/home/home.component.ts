import { Component, OnInit } from '@angular/core';
import { WinRefService } from '../services/win-ref.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  ethereum: any;

  constructor(private winRef: WinRefService) {
    this.ethereum = winRef.window.ethereum;
  }

  ngOnInit(): void {
    console.log(this.ethereum);

  }
  checkIfWalletIsConnect() {
    try {
      debugger
      if (!this.ethereum) {
        alert("Please install MetaMask.");
        console.log("No Accounts found");
      }
    } catch (error) {
      console.error(error);
    }
  }

}
