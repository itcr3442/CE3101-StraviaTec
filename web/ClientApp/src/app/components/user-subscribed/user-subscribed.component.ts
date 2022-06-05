import { Component, OnInit } from '@angular/core';
import { RaceStatus } from 'src/app/constants/races.constants';

@Component({
  selector: 'app-user-subscribed',
  templateUrl: './user-subscribed.component.html',
  styleUrls: ['./user-subscribed.component.css']
})
export class UserSubscribedComponent implements OnInit {

  constructor() { }

  raceFilter: RaceStatus = RaceStatus.Registered

  ngOnInit(): void {
  }

  
  selected(event: { name: string, id: number }) {
    console.log(`Se seleccionó el usuario: ${event.name} - ${event.id}`)
  }

}
