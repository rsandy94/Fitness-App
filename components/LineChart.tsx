import { View, Text, Dimensions } from 'react-native';
import Svg, { Line, Polyline, Circle, Text as SvgText } from 'react-native-svg';

interface LineChartProps {
  data: {
    labels: string[];
    datasets: { data: number[] }[];
  };
  width: number;
  height: number;
  chartConfig: {
    backgroundColor?: string;
    color?: (opacity?: number) => string;
    labelColor?: (opacity?: number) => string;
    style?: any;
  };
  bezier?: boolean;
}

export function SimpleLineChart({ data, width, height, chartConfig }: LineChartProps) {
  const padding = { top: 20, right: 20, bottom: 30, left: 45 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const values = data.datasets[0]?.data || [];
  const labels = data.labels || [];

  if (values.length === 0) return null;

  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const getX = (index: number) => padding.left + (index / Math.max(values.length - 1, 1)) * chartWidth;
  const getY = (value: number) => padding.top + chartHeight - ((value - minVal) / range) * chartHeight;

  const points = values.map((val, i) => `${getX(i)},${getY(val)}`).join(' ');

  const color = chartConfig.color?.(1) || '#58a6ff';
  const labelColor = chartConfig.labelColor?.(1) || '#8b949e';

  const yTicks = 4;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) => minVal + (range / yTicks) * i);

  return (
    <Svg width={width} height={height}>
      {yTickValues.map((val, i) => (
        <Line
          key={`grid-${i}`}
          x1={padding.left}
          y1={getY(val)}
          x2={width - padding.right}
          y2={getY(val)}
          stroke="#30363d"
          strokeWidth={1}
          strokeDasharray="4,4"
        />
      ))}

      {yTickValues.map((val, i) => (
        <SvgText
          key={`label-${i}`}
          x={padding.left - 8}
          y={getY(val) + 4}
          fill={labelColor}
          fontSize={10}
          textAnchor="end"
        >
          {val.toFixed(1)}
        </SvgText>
      ))}

      <Polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
      />

      {values.map((val, i) => (
        <Circle
          key={`dot-${i}`}
          cx={getX(i)}
          cy={getY(val)}
          r={4}
          fill={color}
          stroke="#0d1117"
          strokeWidth={2}
        />
      ))}

      {labels.map((label, i) => (
        <SvgText
          key={`xlabel-${i}`}
          x={getX(i)}
          y={height - 8}
          fill={labelColor}
          fontSize={10}
          textAnchor="middle"
        >
          {label}
        </SvgText>
      ))}
    </Svg>
  );
}
