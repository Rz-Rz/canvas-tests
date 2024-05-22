// src/app/test-data.service.ts
import { Injectable } from '@angular/core';

interface DataPoint {
  time: number;  // Assuming time is in seconds from start
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
  providedIn: 'root'
})
export class TestDataService {

  generateTestData(startTime: number, timeInterval: number, pointsCount: number): { reliefData: DataPoint[], trajectoryData: DataPoint[], xScale: Scale, yScale: Scale } {
    const reliefData: DataPoint[] = [];
    const trajectoryData: DataPoint[] = [];

    // Initial elevation
    let elevation = 200;

    // Generate random relief data
    for (let i = 0; i < pointsCount; i++) {
      elevation += (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 50);
      reliefData.push({
        time: startTime + i * timeInterval,
        elevation: elevation
      });
    }

    // Parameters for the parabola that stays under the relief data
    const peakTimeIndex = Math.floor(pointsCount / 2);  // Assume peak at middle
    const peakElevation = Math.min(...reliefData.map(d => d.elevation)) - 100;  // Ensure peak is below the lowest point
    const a = -0.002;
    const b = 0;
    const c = peakElevation;

    // Generate trajectory data
    for (let i = 0; i < pointsCount; i++) {
      const x = i * timeInterval;  // Time in seconds from start
      const parabolicElevation = a * x * x + b * x + c;  // Parabolic equation
      trajectoryData.push({
        time: reliefData[i].time,
        elevation: Math.min(parabolicElevation, reliefData[i].elevation - 10)  // Ensure trajectory is below relief
      });
    }

    // Define scales
    const xScale: Scale = {
      min: startTime,
      max: startTime + (pointsCount - 1) * timeInterval,
      step: timeInterval,
      decimalPlaces: 0,
      showDecimals: false,
      labelOffset: 10
    };
    const yScale: Scale = {
      min: Math.min(...trajectoryData.map(d => d.elevation)),
      max: Math.max(...reliefData.map(d => d.elevation)),
      step: 100,
      decimalPlaces: 0,
      showDecimals: false,
      labelOffset: 10
    };

    return { reliefData, trajectoryData, xScale, yScale };
  }
}

