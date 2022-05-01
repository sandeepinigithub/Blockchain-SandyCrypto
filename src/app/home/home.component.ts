import { Component, OnInit } from '@angular/core';
import { ethers } from 'ethers';
import { WinRefService } from '../services/win-ref.service';
import { contractABI, contractAddress } from '../utils/constants';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  ethereum: any;
  currentAccount: any
  transactions: any;
  addressTo: any
  amount: any
  message: any
  transactionsCount: any

  constructor(private winRef: WinRefService) {
    this.ethereum = winRef.window.ethereum;
  }

  ngOnInit(): void { }
  async checkIfWalletIsConnect() {
    try {
      if (!this.ethereum) {
        alert("Please install MetaMask.");
      }
      else {
        const accounts = await this.ethereum.request({ method: "eth_accounts" });
        if (accounts.length) {
          this.currentAccount = accounts[0];
          this.getAllTransactions();
        } else {
          console.log("No accounts found");
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getAllTransactions() {
    try {
      if (this.ethereum) {
        const transactionsContract = this.createEthereumContract();

        const availableTransactions = await transactionsContract.getAllTransactions();

        const structuredTransactions = availableTransactions.map((transaction: any) => ({
          addressTo: transaction.receiver,
          addressFrom: transaction.sender,
          timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
          message: transaction.message,
          amount: parseInt(transaction.amount._hex) / (10 ** 18)
        }));

        console.log(structuredTransactions);

        this.transactions = structuredTransactions;
      } else {
        console.log("Ethereum is not present");
      }
    } catch (error) {
      console.log(error);
    }
  }
  createEthereumContract(): any {
    const provider = new ethers.providers.Web3Provider(this.ethereum);
    const signer = provider.getSigner();
    const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);
    return transactionsContract;
  };

  async sendTransaction() {
    // console.log("address:-",this.addressTo);
    // console.log("amount:-",this.amount);
    // console.log("message:-",this.message);

    try {
      if (this.ethereum && (this.addressTo != undefined && this.addressTo != null) && (this.amount != undefined && this.amount != null) && (this.message != undefined && this.message != null)) {

        const transactionsContract = this.createEthereumContract();
        const parsedAmount = ethers.utils.parseEther(this.amount)._hex;
        const accounts = await this.ethereum.request({ method: "eth_accounts" });
        accounts?.length ? this.currentAccount = accounts[0] : '';

        await this.ethereum.request({
          method: "eth_sendTransaction",
          params: [{
            from: this.currentAccount,
            to: this.addressTo,
            gas: "0x5208",
            value: parsedAmount,
          }],
        });

        const transactionHash = await transactionsContract.addToBlockchain(this.addressTo, parsedAmount, this.message);
        console.log(`Loading - ${transactionHash.hash}`);
        await transactionHash.wait();
        console.log(`Success - ${transactionHash.hash}`);

        const transactionsCount = await transactionsContract.getTransactionCount();
        this.transactionsCount = transactionsCount.toNumber();
        // window.location.reload();
      } else {
        console.log("No ethereum object");
      }
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }
  };
}
