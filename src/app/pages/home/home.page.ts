import { Component, inject, signal } from '@angular/core';
import { MentorRouletteStatsModel } from '@app/models/mentor-roulette-stats.model';
import { DutyBreakdownChart } from './duty-breakdown-chart/duty-breakdown-chart';
import { JobDutyBreakdownChart } from './job-duty-breakdown-chart/job-duty-breakdown-chart';
import { MentorRouletteLogService } from '@app/services/mentor-roulette-log.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'mrt-page-home',
  imports: [ButtonModule, CardModule, DutyBreakdownChart, JobDutyBreakdownChart, ProgressBarModule, SkeletonModule, TagModule],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  providers: [MentorRouletteLogService],
})
export class HomePage {
  private _data: MentorRouletteLogService = inject(MentorRouletteLogService);

  public isLoading = signal(true);
  public errorMessage = signal<string | null>(null);
  public stats = signal<MentorRouletteStatsModel | null>(null);

  ngOnInit(): void {
    this.reload();
  }

  public reload(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this._data
      .getStats()
      .subscribe({
        next: (stats: MentorRouletteStatsModel) => {
          this.stats.set(stats);
          this.errorMessage.set(null);
        },
        error: () => {
          this.stats.set(null);
          this.errorMessage.set('Unable to load mentor roulette stats right now.');
        },
      })
      .add(() => this.isLoading.set(false));
  }
}
