import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RaceCategoryType } from 'src/app/constants/races.constants';
import { Race } from 'src/app/interfaces/race';
import { Positions } from 'src/app/interfaces/reports';
import { AuthService } from 'src/app/services/auth.service';
import { FormattingService } from 'src/app/services/formatting.service';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-report-position',
  templateUrl: './report-position.component.html',
  styleUrls: ['./report-position.component.css']
})
export class ReportPositionComponent implements OnInit {

  racesList: { r: Race, id: number }[] = [];

  positions: Positions[] = []


  constructor(private authService: AuthService, private searchService: SearchService, public formatter: FormattingService) { }

  ngOnInit(): void {
  }



}
