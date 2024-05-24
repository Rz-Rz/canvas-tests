import { Injectable } from '@angular/core';

interface DataPoint {
  time: number; // Assuming time is in seconds from start
  elevation: number;
}

interface Scale {
  min: number;
  max: number;
  step: number;
  decimalPlaces?: number;
  showDecimals?: boolean;
  labelOffset?: number;
}

@Injectable({
  providedIn: 'root',
})
export class TestDataService {
  generateTestData(
    startTime: number,
    timeInterval: number,
    pointsCount: number,
  ): {
    reliefData: DataPoint[];
    trajectoryData: DataPoint[];
    xScale: Scale;
    yScale: Scale;
  } {
    const reliefData: DataPoint[] = [];
    const trajectoryData: DataPoint[] = [];

    // Initial elevation
    let elevation = 200;

    // Generate random relief data
    for (let i = 0; i < pointsCount; i++) {
      elevation +=
        (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 50);
      reliefData.push({
        time: startTime + i * timeInterval,
        elevation: Math.max(elevation, 0), // Ensure non-negative elevation
      });
    }

    // Ensure the trajectory starts and ends at the same points as the relief
    const startElevation = reliefData[0].elevation;
    const endElevation = reliefData[pointsCount - 1].elevation;

    // Define the parabolic curve parameters
    const peakTime = (pointsCount / 2) * timeInterval;
    const peakElevation = Math.max(...reliefData.map((d) => d.elevation)) + 100;

    // Calculate a, b, and c for the parabolic equation y = ax^2 + bx + c
    const a =
      (2 * (startElevation + endElevation - 2 * peakElevation)) /
      (Math.pow(pointsCount * timeInterval, 2) - 4 * peakTime * peakTime);
    const b =
      (endElevation -
        startElevation -
        a * Math.pow(pointsCount * timeInterval, 2)) /
      (pointsCount * timeInterval);
    const c = startElevation;

    // Generate trajectory data
    for (let i = 0; i < pointsCount; i++) {
      const x = i * timeInterval;
      const parabolicElevation = a * Math.pow(x - peakTime, 2) + peakElevation;
      trajectoryData.push({
        time: reliefData[i].time,
        elevation: Math.max(parabolicElevation, reliefData[i].elevation + 10), // Ensure trajectory is above relief
      });
    }

    // Define scales
    const xScale: Scale = {
      min: startTime,
      max: startTime + (pointsCount - 1) * timeInterval,
      step: timeInterval,
      decimalPlaces: 0,
      showDecimals: false,
      labelOffset: 10,
    };
    const yScale: Scale = {
      min: 0,
      max: Math.max(...trajectoryData.map((d) => d.elevation)),
      step: 100,
      decimalPlaces: 0,
      showDecimals: false,
      labelOffset: 10,
    };

    return { reliefData, trajectoryData, xScale, yScale };
  }

  generateInitialAndLatePoints(
    startTime: number,
    timeInterval: number,
    pointsCount: number,
  ): { initialPoints: DataPoint[]; latePoints: DataPoint[] } {
    const initialPoints: DataPoint[] = [];
    const latePoints: DataPoint[] = [];

    // Generate initial points
    initialPoints.push({
      time: startTime + Math.random() * 100,
      elevation: 200 + Math.random() * 100, // Random elevation between 200 and 300
    });
    initialPoints.push({
      time: startTime + Math.random() * 100 + 100,
      elevation: 200 + Math.random() * 100,
    });

    // Sort initial points by time
    initialPoints.sort((a, b) => a.time - b.time);

    // Generate late points
    const firstLatePointTime =
      startTime + Math.random() * (pointsCount - 1) * timeInterval;
    const firstLatePointElevation = 200 + Math.random() * 100;
    latePoints.push({
      time: firstLatePointTime,
      elevation: firstLatePointElevation,
    });

    const secondLatePointTime =
      firstLatePointTime +
      timeInterval *
      (1 +
        Math.random() *
        (pointsCount - firstLatePointTime / timeInterval - 1));
    const secondLatePointElevation = 200 + Math.random() * 100;
    latePoints.push({
      time: secondLatePointTime,
      elevation: secondLatePointElevation,
    });

    // Sort late points by time
    latePoints.sort((a, b) => a.time - b.time);

    // console.log('initialPoints', initialPoints);
    // console.log('latePoints', latePoints);
    return { initialPoints, latePoints };
  }
}
