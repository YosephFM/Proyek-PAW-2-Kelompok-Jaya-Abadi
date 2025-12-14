import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParticipantService } from '../services/participant.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {

  participants: any[] = [];

  total = 0;
  countBeginner = 0;
  countIntermediate = 0;
  countAdvanced = 0;

  constructor(private participantService: ParticipantService) {}

  ngOnInit(): void {
    this.participantService.getAll().subscribe((data: any[]) => {
      this.participants = data;
      this.total = data.length;

      this.countBeginner = 0;
      this.countIntermediate = 0;
      this.countAdvanced = 0;

      data.forEach((p: any) => {
        if (p.level === 'Beginner') this.countBeginner++;
        if (p.level === 'Intermediate') this.countIntermediate++;
        if (p.level === 'Advanced') this.countAdvanced++;
      });
    });
  }
}
