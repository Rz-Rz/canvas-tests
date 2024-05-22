// src/app/line-graph.ts

interface DataPoint {
  time: number;
  elevation: number;
}

interface DrawOptions {
  color?: string;
  lineWidth?: number;
  fillColor?: string;
  font?: string;
  lineDash?: number[];
  angle?: number; // Angle in degrees for text rotation
}

interface AxisOptions {
  fontSize?: number;
  fontColor?: string;
  font?: string;
  xPadding?: number;
  yPadding?: number;
  xScale?: {
    min: number;
    max: number;
    step: number;
    decimalPlaces?: number;
    showDecimals?: boolean;
    labelOffset?: number;
  };
  yScale?: {
    min: number;
    max: number;
    step: number;
    decimalPlaces?: number;
    showDecimals?: boolean;
    labelOffset?: number;
  };
  xLabel?: string;
  yLabel?: string;
  xAxisStyle?: DrawOptions;
  yAxisStyle?: DrawOptions;
}

class LineGraph {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private data: DataPoint[] = [];
  private width: number;
  private height: number;

  constructor(canvas: HTMLCanvasElement, width: number, height: number) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d')!;
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
  }

  clearCanvas(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  drawLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    options: DrawOptions = {},
  ): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    if (options.color) this.ctx.strokeStyle = options.color;
    if (options.lineWidth) this.ctx.lineWidth = options.lineWidth;
    this.ctx.stroke();
  }

  drawCircle(
    x: number,
    y: number,
    radius: number,
    options: DrawOptions = {},
  ): void {
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
    if (options.fillColor) {
      this.ctx.fillStyle = options.fillColor;
      this.ctx.fill();
    }
    if (options.color) {
      this.ctx.strokeStyle = options.color;
      this.ctx.stroke();
    }
  }

  drawText(
    text: string,
    x: number,
    y: number,
    options: DrawOptions = {},
  ): void {
    const { color, font, angle } = options;
    if (angle) {
      this.ctx.save();
      this.ctx.translate(x, y);
      this.ctx.rotate(angle * (Math.PI / 180));
      this.ctx.fillStyle = color || 'black';
      this.ctx.font = font || '12px Arial';
      this.ctx.fillText(text, 0, 0);
      this.ctx.restore();
      return;
    }
    if (options.font) this.ctx.font = options.font;
    if (options.color) this.ctx.fillStyle = options.color;
    this.ctx.fillText(text, x, y);
  }

  drawAxes(options: AxisOptions = {}): void {
    const {
      fontSize = 12,
      fontColor = 'black',
      font = 'Arial',
      xPadding = 50,
      yPadding = 50,
      xScale = {
        min: 0,
        max: 10,
        step: 1,
        decimalPlaces: 0,
        showDecimals: false,
        labelOffset: 10,
      },
      yScale = {
        min: 0,
        max: 10,
        step: 1,
        decimalPlaces: 0,
        showDecimals: false,
        labelOffset: 10,
      },
      xLabel = null,
      yLabel = null,
      xAxisStyle = { color: 'black', lineWidth: 1 },
      yAxisStyle = { color: 'black', lineWidth: 1 },
    } = options;

    const {
      min: xMin,
      max: xMax,
      step: xStep,
      decimalPlaces: xDecimalPlaces = 0,
      showDecimals: xShowDecimals = false,
      labelOffset: xLabelOffset = 10,
    } = xScale;

    const {
      min: yMin,
      max: yMax,
      step: yStep,
      decimalPlaces: yDecimalPlaces = 0,
      showDecimals: yShowDecimals = false,
      labelOffset: yLabelOffset = 20,
    } = yScale;

    // Draw X-axis
    this.drawLine(
      xPadding,
      this.height - yPadding,
      this.width - xPadding,
      this.height - yPadding,
      xAxisStyle,
    );
    if (xLabel) {
      this.drawText(xLabel, this.width / 2, this.height - yPadding / 2, {
        color: fontColor,
        font: `${fontSize + 4}px ${font}`,
      });
    }

    // Draw X-axis labels and ticks
    for (let x = xMin; x <= xMax; x += xStep) {
      const xPos =
        xPadding + ((x - xMin) / (xMax - xMin)) * (this.width - 2 * xPadding);
      const label = xShowDecimals
        ? x.toFixed(xDecimalPlaces)
        : Math.round(x).toString();
      this.drawText(
        label,
        xPos,
        this.height - yPadding + fontSize + xLabelOffset,
        {
          color: fontColor,
          font: `${fontSize}px ${font}`,
        },
      );
    }

    // Draw Y-axis
    this.drawLine(
      xPadding,
      yPadding,
      xPadding,
      this.height - yPadding,
      yAxisStyle,
    );
    if (yLabel) {
      this.drawText(yLabel, xPadding / 2, this.height / 2, {
        color: fontColor,
        font: `${fontSize + 4}px ${font}`,
        angle: -90,
      });
    }

    // Draw Y-axis labels and ticks
    for (let y = yMin; y <= yMax; y += yStep) {
      const yPos =
        this.height -
        yPadding -
        ((y - yMin) / (yMax - yMin)) * (this.height - 2 * yPadding);
      const label = yShowDecimals
        ? y.toFixed(yDecimalPlaces)
        : Math.round(y).toString();
      this.drawText(label, xPadding - fontSize - yLabelOffset, yPos + 5, {
        color: fontColor,
        font: `${fontSize}px ${font}`,
      });
    }
  }

  plotDataPoints(): void {
    const padding = 50;
    const times = this.data.map((d) => d.time);
    const elevations = this.data.map((d) => d.elevation);

    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);
    const maxElevation = Math.max(...elevations);
    const minElevation = Math.min(...elevations);

    this.data.forEach((dataPoint) => {
      const x =
        padding +
        ((dataPoint.time - minTime) / (maxTime - minTime)) *
        (this.width - 2 * padding);
      const y =
        this.height -
        padding -
        ((dataPoint.elevation - minElevation) / (maxElevation - minElevation)) *
        (this.height - 2 * padding);
      this.drawCircle(x, y, 5, { fillColor: 'blue' });
    });
  }

  drawVerticalLinesAtPositions(
    xPositions: number[],
    text: string,
    axisOptions: AxisOptions,
    drawOptions: DrawOptions = {},
    textOptions: DrawOptions = {},
    minHeight: number = 0, // Minimum y-coordinate
    maxHeight: number = this.height, // Maximum y-coordinate
  ): void {
    const { xScale, xPadding = 50, yPadding = 50 } = axisOptions;
    const { min: xMin, max: xMax } = xScale || { min: 0, max: 1 };

    if (xPositions.length !== 2) {
      console.error('xPositions array must contain exactly two positions');
      return;
    }

    const x1 =
      yPadding +
      ((xPositions[0] - xMin) / (xMax - xMin)) * (this.width - 2 * yPadding);
    const x2 =
      yPadding +
      ((xPositions[1] - xMin) / (xMax - xMin)) * (this.width - 2 * yPadding);

    // Ensure minHeight and maxHeight are within the canvas bounds
    minHeight = Math.max(0, minHeight);
    maxHeight = Math.min(this.height, maxHeight);

    // Draw the vertical lines with the specified min and max heights
    this.drawLine(x1, minHeight, x1, maxHeight, drawOptions);
    this.drawLine(x2, minHeight, x2, maxHeight, drawOptions);

    // Calculate the position for the text (midpoint between the two lines)
    const textX = (x1 + x2) / 2;
    const textY = maxHeight + (minHeight - maxHeight) / 2; // Centered between min and max heights

    // Draw the text
    this.drawText(text, textX, textY, textOptions);
  }

  connectDataPoints(
    data: DataPoint[],
    xPadding: number = 50,
    yPadding: number = 50,
    options: DrawOptions = {},
    xScale: { min: number; max: number },
    yScale: { min: number; max: number },
  ): void {
    const xScaleFactor =
      (this.width - 2 * xPadding) / (xScale.max - xScale.min);
    const yScaleFactor =
      (this.height - 2 * yPadding) / (yScale.max - yScale.min);

    this.ctx.beginPath();
    data.forEach((dataPoint, index) => {
      const x = xPadding + (dataPoint.time - xScale.min) * xScaleFactor;
      const y =
        this.height -
        yPadding -
        (dataPoint.elevation - yScale.min) * yScaleFactor;

      if (index === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    });
    if (options.color) this.ctx.strokeStyle = options.color;
    if (options.lineWidth) this.ctx.lineWidth = options.lineWidth;
    if (options.lineDash) this.ctx.setLineDash(options.lineDash);
    this.ctx.stroke();
  }
}

export { LineGraph, DataPoint, DrawOptions, AxisOptions };
