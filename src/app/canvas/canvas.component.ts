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

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private testDataService: TestDataService,
  ) { }
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

      const { initialPoints, latePoints } =
        this.testDataService.generateInitialAndLatePoints(
          startTime,
          timeInterval,
          pointsCount,
        );

      const trajOptions: DrawOptions = {
        color: 'lightgrey',
        lineWidth: 0.5,
      };

      const axisOptions: AxisOptions = {
        fontSize: 10,
        fontColor: 'lightgrey',
        font: 'Verdana',
        padding: {
          left: 100,
          right: 0,
          top: 50,
          bottom: 100,
        },
        xScale: xScale,
        yScale: yScale,
        yAxisStyle: { color: 'lightgrey', lineWidth: 1 },
        xAxisStyle: { color: 'lightgrey', lineWidth: 1 },
        xLabel: 'Time',
        yLabel: 'Elevation',
      };

      // this.lineGraph.drawAxes(axisOptions);

      this.lineGraph.connectDataPoints(reliefData, axisOptions, trajOptions);

      // Optionally plot the trajectory data if needed
      const trajOptions2: DrawOptions = {
        color: 'lightgrey',
        lineWidth: 1,
      };

      this.lineGraph.connectDataPoints(
        trajectoryData,
        axisOptions,
        trajOptions2,
      );

      this.lineGraph.fillAreaUnderCurve(
        trajectoryData,
        axisOptions,
        'rgba(80, 80, 80, 0.25)',
      );

      this.lineGraph.drawVerticalLineToTrajectoryWithLimits(
        initialPoints,
        trajectoryData,
        axisOptions,
        { color: 'yellow', lineWidth: 0.6, lineDash: [5, 5] },
      );

      this.lineGraph.drawVerticalLineToTrajectoryWithLimits(
        latePoints,
        trajectoryData,
        axisOptions,
        { color: 'red', lineWidth: 0.6, lineDash: [5, 5] },
      );

      // this.lineGraph.drawSelectors(
      //   initialPoints,
      //   axisOptions,
      //   {
      //     color: 'yellow',
      //     lineWidth: 1.5,
      //     lineDash: [0, 0],
      //   },
      //   40,
      //   'aaaaaaaaaa',
      // );

      this.lineGraph.drawSelectorsAndIndicators(
        initialPoints,
        axisOptions,
        {
          color: 'yellow',
          lineWidth: 1.5,
          lineDash: [0, 0],
        },
        40,
        'aaaaaaaaaa',
        'Initial',
        'Final'
      );

      this.lineGraph.drawSelectors(
        latePoints,
        axisOptions,
        {
          color: 'red',
          lineWidth: 1.5,
          lineDash: [0, 0],
        },
        10,
        'aaaaa bbbbb',
      );
      this.lineGraph.displayMaxValues(axisOptions, {
        color: 'white',
        lineWidth: 0.8,
        font: '14px Trebuchet MS',
      });
    }
  }
}
