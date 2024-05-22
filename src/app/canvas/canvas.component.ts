import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import {
  LineGraph,
  DataPoint,
  DrawOptions,
  AxisOptions,
} from '../../line-graph';
import { isPlatformBrowser } from '@angular/common';
import { TestDataService } from '../test-data.service';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.css',
})
export class CanvasComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas', { static: false })
  canvasElement!: ElementRef<HTMLCanvasElement>;

  private lineGraph!: LineGraph;

  constructor(@Inject(PLATFORM_ID) private platformId: Object,  private testDataService: TestDataService) { }
  ngOnInit(): void { }
  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const canvas = this.canvasElement.nativeElement;
      this.lineGraph = new LineGraph(canvas, 800, 500);
        const startTime = 0; // Start time in seconds
      const timeInterval = 30; // Interval in seconds
      const pointsCount = 25; // Number of data points

      const { reliefData, trajectoryData, xScale, yScale } =
        this.testDataService.generateTestData(
          startTime,
          timeInterval,
          pointsCount,
        );

      const trajOptions: DrawOptions = {
        color: 'red',
        lineWidth: 1,
      };

      const axisOptions: AxisOptions = {
        fontSize: 10,
        fontColor: 'lightgrey',
        font: 'Verdana',
        xPadding: 50,
        yPadding: 100,
        xScale: xScale,
        yScale: yScale,
        yAxisStyle: { color: 'lightgrey', lineWidth: 1 },
        xAxisStyle: { color: 'lightgrey', lineWidth: 1 },
        // xLabel: 'Time',
        // yLabel: 'Elevation',
      };

      this.lineGraph.drawAxes(axisOptions);

      this.lineGraph.connectDataPoints(
        reliefData,
        axisOptions.xPadding,
        axisOptions.yPadding,
        trajOptions,
        xScale,
        yScale
      );

      // Optionally plot the trajectory data if needed
      const trajOptions2: DrawOptions = {
        color: 'blue',
        lineWidth: 1,
      };
      this.lineGraph.connectDataPoints(
        trajectoryData,
        axisOptions.xPadding,
        axisOptions.yPadding,
        trajOptions2,
        xScale,
        yScale
      );
    }
  }
}
