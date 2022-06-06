import { Component, OnInit } from '@angular/core';
import { Race } from 'src/app/interfaces/race';
import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-accept-inscriptions',
  templateUrl: './accept-inscriptions.component.html',
  styleUrls: ['./accept-inscriptions.component.css']
})
export class AcceptInscriptionsComponent implements OnInit {

  receipts_list: { u: User, r: Race, raceId: number, userId: number }[] = []

  constructor() { }

  ngOnInit(): void {
  }

  getReceipt(raceId: number, userId: number) {

  }

}
