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
  padding?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
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
    if (options.lineDash) this.ctx.setLineDash(options.lineDash);
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
      padding = { top: 50, bottom: 50, left: 50, right: 50 },
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
      top: yPaddingTop = 50,
      bottom: yPaddingBottom = 50,
      left: xPaddingLeft = 50,
      right: xPaddingRight = 50,
    } = padding;

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
      xPaddingLeft,
      this.height - yPaddingBottom,
      this.width - xPaddingRight,
      this.height - yPaddingBottom,
      xAxisStyle,
    );
    if (xLabel) {
      this.drawText(xLabel, this.width / 2, this.height - yPaddingBottom / 2, {
        color: fontColor,
        font: `${fontSize + 4}px ${font}`,
      });
    }

    // Draw X-axis labels and ticks
    for (let x = xMin; x <= xMax; x += xStep) {
      const xPos =
        xPaddingLeft +
        ((x - xMin) / (xMax - xMin)) *
        (this.width - xPaddingLeft - xPaddingRight);
      const label = xShowDecimals
        ? x.toFixed(xDecimalPlaces)
        : Math.round(x).toString();
      this.drawText(
        label,
        xPos,
        this.height - yPaddingBottom + fontSize + xLabelOffset,
        {
          color: fontColor,
          font: `${fontSize}px ${font}`,
        },
      );
    }

    // Draw Y-axis
    this.drawLine(
      xPaddingLeft,
      yPaddingTop,
      xPaddingLeft,
      this.height - yPaddingBottom,
      yAxisStyle,
    );
    if (yLabel) {
      this.drawText(yLabel, xPaddingLeft / 2, this.height / 2, {
        color: fontColor,
        font: `${fontSize + 4}px ${font}`,
        angle: -90,
      });
    }

    // Draw Y-axis labels and ticks
    for (let y = yMin; y <= yMax; y += yStep) {
      const yPos =
        this.height -
        yPaddingBottom -
        ((y - yMin) / (yMax - yMin)) *
        (this.height - yPaddingTop - yPaddingBottom);
      const label = yShowDecimals
        ? y.toFixed(yDecimalPlaces)
        : Math.round(y).toString();
      this.drawText(label, xPaddingLeft - fontSize - yLabelOffset, yPos + 5, {
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

  // drawVerticalLinesAtPositions(
  //   xPositions: number[],
  //   text: string,
  //   axisOptions: AxisOptions,
  //   drawOptions: DrawOptions = {},
  //   textOptions: DrawOptions = {},
  //   minHeight: number = 0, // Minimum y-coordinate
  //   maxHeight: number = this.height, // Maximum y-coordinate
  // ): void {
  //   const { xScale, xPadding = 50, yPadding = 50 } = axisOptions;
  //   const { min: xMin, max: xMax } = xScale || { min: 0, max: 1 };
  //
  //   if (xPositions.length !== 2) {
  //     console.error('xPositions array must contain exactly two positions');
  //     return;
  //   }
  //
  //   const x1 =
  //     yPadding +
  //     ((xPositions[0] - xMin) / (xMax - xMin)) * (this.width - 2 * yPadding);
  //   const x2 =
  //     yPadding +
  //     ((xPositions[1] - xMin) / (xMax - xMin)) * (this.width - 2 * yPadding);
  //
  //   // Ensure minHeight and maxHeight are within the canvas bounds
  //   minHeight = Math.max(0, minHeight);
  //   maxHeight = Math.min(this.height, maxHeight);
  //
  //   // Draw the vertical lines with the specified min and max heights
  //   this.drawLine(x1, minHeight, x1, maxHeight, drawOptions);
  //   this.drawLine(x2, minHeight, x2, maxHeight, drawOptions);
  //
  //   // Calculate the position for the text (midpoint between the two lines)
  //   const textX = (x1 + x2) / 2;
  //   const textY = maxHeight + (minHeight - maxHeight) / 2; // Centered between min and max heights
  //
  //   // Draw the text
  //   this.drawText(text, textX, textY, textOptions);
  // }

  connectDataPoints(
    data: DataPoint[],
    axisOptions: AxisOptions,
    options: DrawOptions = {},
  ): void {
    const {
      xScale,
      yScale,
      padding = { top: 50, bottom: 50, left: 50, right: 50 },
    } = axisOptions;
    const { min: xMin, max: xMax } = xScale || { min: 0, max: 1 };
    const { min: yMin, max: yMax } = yScale || { min: 0, max: 1 };
    const {
      top: yPaddingTop = 50,
      bottom: yPaddingBottom = 50,
      left: xPaddingLeft = 50,
      right: xPaddingRight = 50,
    } = padding;

    const xScaleFactor =
      (this.width - xPaddingLeft - xPaddingRight) / (xMax - xMin);
    const yScaleFactor =
      (this.height - yPaddingTop - yPaddingBottom) / (yMax - yMin);

    this.ctx.beginPath();
    data.forEach((dataPoint, index) => {
      const x = xPaddingLeft + (dataPoint.time - xMin) * xScaleFactor;
      const y =
        this.height -
        yPaddingBottom -
        (dataPoint.elevation - yMin) * yScaleFactor;

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

  fillAreaUnderCurve(
    data: DataPoint[],
    axisOptions: AxisOptions,
    fillColor: string = 'rgba(0, 0, 0, 0.15)',
  ): void {
    if (data.length === 0) return;

    const {
      xScale,
      yScale,
      padding = { top: 50, bottom: 50, left: 50, right: 50 },
    } = axisOptions;
    const { min: xMin, max: xMax } = xScale || { min: 0, max: 1 };
    const { min: yMin, max: yMax } = yScale || { min: 0, max: 1 };
    const {
      top: yPaddingTop = 50,
      bottom: yPaddingBottom = 50,
      left: xPaddingLeft = 50,
      right: xPaddingRight = 50,
    } = padding;

    const xScaleFactor =
      (this.width - xPaddingLeft - xPaddingRight) / (xMax - xMin);
    const yScaleFactor =
      (this.height - yPaddingTop - yPaddingBottom) / (yMax - yMin);

    this.ctx.beginPath();
    this.ctx.moveTo(
      xPaddingLeft + (data[0].time - xMin) * xScaleFactor,
      this.height - yPaddingBottom,
    );

    data.forEach((dataPoint) => {
      const x = xPaddingLeft + (dataPoint.time - xMin) * xScaleFactor;
      const y =
        this.height -
        yPaddingBottom -
        (dataPoint.elevation - yMin) * yScaleFactor;
      this.ctx.lineTo(x, y);
    });

    this.ctx.lineTo(
      xPaddingLeft + (data[data.length - 1].time - xMin) * xScaleFactor,
      this.height - yPaddingBottom,
    );
    this.ctx.closePath();
    this.ctx.fillStyle = fillColor;
    this.ctx.fill();
  }

  drawVerticalLineToTrajectoryWithLimits(
    markersPoints: DataPoint[], // Array of DataPoint objects on the x-axis
    lineLimit: DataPoint[], // The line limit represented by DataPoint array
    axisOptions: AxisOptions,
    drawOptions: DrawOptions = {},
  ): void {
    const {
      xScale,
      yScale,
      padding = { top: 50, bottom: 50, left: 50, right: 50 },
    } = axisOptions;
    const { min: xMin, max: xMax } = xScale || { min: 0, max: 1 };
    const { min: yMin, max: yMax } = yScale || { min: 0, max: 1 };
    const {
      top: yPaddingTop = 50,
      bottom: yPaddingBottom = 50,
      left: xPaddingLeft = 50,
      right: xPaddingRight = 50,
    } = padding;
    const yBase = this.height - yPaddingBottom;

    markersPoints.forEach((marker) => {
      const x =
        xPaddingLeft +
        ((marker.time - xMin) / (xMax - xMin)) *
        (this.width - xPaddingLeft - xPaddingRight);

      // Ensure the vertical line does not go beyond the lineLimit
      let yLimit = null;

      for (let i = 1; i < lineLimit.length; i++) {
        if (lineLimit[i].time >= marker.time) {
          const point1 = lineLimit[i - 1];
          const point2 = lineLimit[i];

          // Perform linear interpolation to find the y-value at marker.time
          const t = (marker.time - point1.time) / (point2.time - point1.time);
          const interpolatedY =
            point1.elevation + t * (point2.elevation - point1.elevation);

          yLimit =
            yBase -
            ((interpolatedY - yMin) / (yMax - yMin)) *
            (this.height - yPaddingTop - yPaddingBottom);
          break;
        }
      }

      if (yLimit !== null) {
        // Draw the vertical line from x-axis to the interpolated y-value
        this.drawLine(x, yBase, x, yLimit, drawOptions);
      }
    });
  }

  drawSelectors(
    initialPoints: DataPoint[], // Array of DataPoint objects on the x-axis
    axisOptions: AxisOptions,
    drawOptions: DrawOptions = {},
    padTop: number = 0,
    text: string = '', // Text to be displayed between or beside the selectors
  ): void {
    const {
      xScale,
      yScale,
      padding = { top: 50, bottom: 50, left: 50, right: 50 },
    } = axisOptions;
    const { min: xMin, max: xMax } = xScale || { min: 0, max: 1 };
    const {
      top: yPaddingTop = 50,
      bottom: yPaddingBottom = 50,
      left: xPaddingLeft = 50,
      right: xPaddingRight = 50,
    } = padding;

    const barHeight = 20; // Height of the vertical bar below the graph
    const barWidth = 10; // Width of the horizontal bar
    const verticalBarWidth = 2; // Width of the vertical bar

    // Calculate x positions of the selectors
    const xPositions = initialPoints.map(
      (point) =>
        xPaddingLeft +
        ((point.time - xMin) / (xMax - xMin)) *
        (this.width - xPaddingLeft - xPaddingRight),
    );

    xPositions.forEach((x, index) => {
      // Draw the vertical bar
      const verticalBarYStart = this.height - yPaddingBottom + padTop;
      const verticalBarYEnd = this.height - yPaddingBottom + barHeight + padTop;
      this.drawLine(x, verticalBarYStart, x, verticalBarYEnd, drawOptions);

      // Draw the horizontal bar
      const horizontalBarDirection = index === 0 ? 1 : -1; // First faces right, second faces left
      const horizontalBarXEnd = x + horizontalBarDirection * barWidth;
      const horizontalBarY = verticalBarYStart + barHeight / 2;
      this.drawLine(
        x,
        horizontalBarY,
        horizontalBarXEnd,
        horizontalBarY,
        drawOptions,
      );
    });

    // Calculate text position
    if (text) {
      const [x1, x2] = xPositions;
      const textWidth = this.ctx.measureText(text).width;
      const spaceBetweenSelectors =
        Math.abs(x2 - x1) - (barWidth + verticalBarWidth + 5) * 2;
      console.log('spaceBetweenSelectors', spaceBetweenSelectors);
      console.log('textWidth', textWidth);

      let textX, textY;
      textY = this.height - yPaddingBottom + padTop + barHeight / 2 + 5; // Below the horizontal bars

      // Check if text fits between the selectors
      if (spaceBetweenSelectors > textWidth) {
        textX = (x1 + x2) / 2 - textWidth / 2;
        console.log('condition 1');
      } else if (
        this.width - x2 - xPaddingRight - verticalBarWidth >=
        textWidth
      ) {
        // Check if text fits on the right side of the second selector
        textX = x2 + verticalBarWidth + 5;
        console.log('condition2');
      } else if (x1 - xPaddingLeft - verticalBarWidth >= textWidth) {
        // Check if text fits on the left side of the first selector
        textX = x1 - textWidth - verticalBarWidth - 5;
        console.log('condition3');
      } else {
        // If no space available, center the text between the selectors
        textX = (x1 + x2) / 2 - textWidth / 2;
        console.log('condition4');
      }

      this.ctx.fillStyle = drawOptions.color || 'black';
      this.ctx.font = drawOptions.font || '12px Arial';
      this.ctx.fillText(text, textX, textY);
    }
  }

  displayMaxValues(
    axisOptions: AxisOptions,
    drawOptions: DrawOptions = {},
  ): void {
    const {
      xScale,
      yScale,
      padding = { top: 50, bottom: 50, left: 50, right: 50 },
    } = axisOptions;
    const { max: xMax } = xScale || { min: 0, max: 1 };
    const { max: yMax } = yScale || { min: 0, max: 1 };
    const {
      top: yPaddingTop = 50,
      left: xPaddingLeft = 50,
      bottom: yPaddingBottom = 50,
    } = padding;

    // Set the positions for the text
    const textXPosition = xPaddingLeft - 10; // Position on the left side of the y-axis padding
    const textYPosition = this.height - yPaddingBottom + 20; // Position above the x-axis padding

    // Draw the max Y value
    this.ctx.fillStyle = drawOptions.color || 'black';
    this.ctx.font = drawOptions.font || '12px Arial';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(
      `-${yMax} m`,
      textXPosition,
      textYPosition - 20,
    );

    // Draw the max X value below the max Y value
    this.ctx.fillText(
      `-${xMax} s`,
      textXPosition,
      textYPosition,
    );
  }

   drawSelectorsAndIndicators(
    initialPoints: DataPoint[], // Array of DataPoint objects on the x-axis
    axisOptions: AxisOptions,
    drawOptions: DrawOptions = {},
    padTop: number = 0,
    centerText: string = '', // Text to be displayed between the selectors
    leftText: string = '', // Text to be displayed on the left side of the selectors
    rightText: string = '', // Text to be displayed on the right side of the selectors
  ): void {
    const {
      xScale,
      yScale,
      padding = { top: 50, bottom: 50, left: 50, right: 50 },
    } = axisOptions;
    const { min: xMin, max: xMax } = xScale || { min: 0, max: 1 };
    const {
      top: yPaddingTop = 50,
      bottom: yPaddingBottom = 50,
      left: xPaddingLeft = 50,
      right: xPaddingRight = 50,
    } = padding;

    const barHeight = 20; // Height of the vertical bar below the graph
    const barWidth = 10; // Width of the horizontal bar
    const verticalBarWidth = 2; // Width of the vertical bar
    const textPadding = 5; // Padding around the text

    // Calculate x positions of the selectors
    const xPositions = initialPoints.map(
      (point) =>
        xPaddingLeft +
        ((point.time - xMin) / (xMax - xMin)) *
        (this.width - xPaddingLeft - xPaddingRight),
    );

    xPositions.forEach((x, index) => {
      // Draw the vertical bar
      const verticalBarYStart = this.height - yPaddingBottom + padTop;
      const verticalBarYEnd = this.height - yPaddingBottom + barHeight + padTop;
      this.drawLine(x, verticalBarYStart, x, verticalBarYEnd, drawOptions);

      // Draw the horizontal bar
      const horizontalBarDirection = index === 0 ? 1 : -1; // First faces right, second faces left
      const horizontalBarXEnd = x + horizontalBarDirection * barWidth;
      const horizontalBarY = verticalBarYStart + barHeight / 2;
      this.drawLine(x, horizontalBarY, horizontalBarXEnd, horizontalBarY, drawOptions);
    });

    // Calculate text positions
    if (centerText || leftText || rightText) {
      const [x1, x2] = xPositions;
      const centerTextWidth = this.ctx.measureText(centerText).width;
      const leftTextWidth = this.ctx.measureText(leftText).width;
      const rightTextWidth = this.ctx.measureText(rightText).width;

      const horizontalBarTotalWidth = barWidth + verticalBarWidth + textPadding;

      // Position for center text
      let centerTextX, centerTextY;
      centerTextY = this.height - yPaddingBottom + padTop + barHeight + 5; // Below the horizontal bars

      if ((x2 - x1) - (horizontalBarTotalWidth * 2) >= centerTextWidth) {
        centerTextX = (x1 + x2) / 2 - centerTextWidth / 2;
      } else {
        centerTextX = (x1 + x2) / 2 - centerTextWidth / 2;
      }

      this.ctx.fillStyle = drawOptions.color || 'black';
      this.ctx.font = drawOptions.font || '12px Arial';
      this.ctx.fillText(centerText, centerTextX, centerTextY);

      // Position for left text
      let leftTextX, leftTextY;
      leftTextY = centerTextY + 20; // Slightly below center text

      if (x1 - xPaddingLeft - horizontalBarTotalWidth >= leftTextWidth) {
        leftTextX = x1 - leftTextWidth - horizontalBarTotalWidth;
      } else {
        leftTextX = x1 + horizontalBarTotalWidth + 5; // Place to the right of the first selector if no space on left
      }

      this.ctx.fillText(leftText, leftTextX, leftTextY);

      // Position for right text
      let rightTextX, rightTextY;
      rightTextY = leftTextY + 20; // Slightly below left text

      if (this.width - x2 - xPaddingRight - horizontalBarTotalWidth >= rightTextWidth) {
        rightTextX = x2 + horizontalBarTotalWidth;
      } else {
        rightTextX = x2 - rightTextWidth - horizontalBarTotalWidth - 5; // Place to the left of the second selector if no space on right
      }

      this.ctx.fillText(rightText, rightTextX, rightTextY);
    }
  }
}

export { LineGraph, DataPoint, DrawOptions, AxisOptions };
