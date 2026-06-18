// src/components/Chart.js — bar / line / pie charts drawn with react-native-svg + d3 (requirement #29).
import { View, Text } from "react-native";
import Svg, { Rect, Path, G, Circle, Line as SvgLine, Text as SvgText } from "react-native-svg";
import { scaleBand, scaleLinear, scalePoint } from "d3-scale";
import { line as d3line, pie as d3pie, arc as d3arc, curveMonotoneX } from "d3-shape";
import { colors } from "../theme";

const PALETTE = ["#ff5722", "#4fc3f7", "#81c784", "#ffb74d", "#ba68c8", "#f06292", "#a1887f", "#90a4ae"];

export default function Chart({ type, data, title }) {
  const W = 320, H = 230;
  const m = { top: 16, right: 14, bottom: 46, left: 38 };
  const iw = W - m.left - m.right;
  const ih = H - m.top - m.bottom;

  if (!data || data.length === 0) {
    return (
      <View style={{ marginBottom: 8 }}>
        <Text style={{ color: colors.text, fontWeight: "700", marginBottom: 8 }}>{title}</Text>
        <Text style={{ color: colors.muted }}>no data yet.</Text>
      </View>
    );
  }

  const maxV = Math.max(...data.map((d) => d.value), 1);

  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={{ color: colors.text, fontWeight: "700", marginBottom: 8 }}>{title}</Text>
      <Svg width={W} height={H}>
        {type === "bar" && <Bars data={data} m={m} iw={iw} ih={ih} maxV={maxV} />}
        {type === "line" && <LineChart data={data} m={m} iw={iw} ih={ih} maxV={maxV} />}
        {type === "pie" && <PieChart data={data} W={W} H={H} />}
      </Svg>
    </View>
  );
}

function Bars({ data, m, iw, ih, maxV }) {
  const x = scaleBand().domain(data.map((d) => d.label)).range([0, iw]).padding(0.25);
  const y = scaleLinear().domain([0, maxV]).range([ih, 0]);
  return (
    <G x={m.left} y={m.top}>
      {data.map((d, i) => (
        <G key={i}>
          <Rect x={x(d.label)} y={y(d.value)} width={x.bandwidth()} height={ih - y(d.value)} rx={4} fill={PALETTE[i % PALETTE.length]} />
          <SvgText x={x(d.label) + x.bandwidth() / 2} y={ih + 14} fill={colors.muted} fontSize="9" textAnchor="middle" rotation="0">
            {d.label.length > 6 ? d.label.slice(0, 6) : d.label}
          </SvgText>
        </G>
      ))}
      <SvgLine x1={0} y1={ih} x2={iw} y2={ih} stroke="rgba(255,255,255,0.2)" />
    </G>
  );
}

function LineChart({ data, m, iw, ih, maxV }) {
  const x = scalePoint().domain(data.map((d) => d.label)).range([0, iw]);
  const y = scaleLinear().domain([0, maxV]).range([ih, 0]);
  const path = d3line().x((d) => x(d.label)).y((d) => y(d.value)).curve(curveMonotoneX)(data);
  return (
    <G x={m.left} y={m.top}>
      <Path d={path} stroke={colors.primary} strokeWidth={2.5} fill="none" />
      {data.map((d, i) => (
        <G key={i}>
          <Circle cx={x(d.label)} cy={y(d.value)} r={3.5} fill={colors.primary} />
          <SvgText x={x(d.label)} y={ih + 14} fill={colors.muted} fontSize="8" textAnchor="middle">{d.label}</SvgText>
        </G>
      ))}
      <SvgLine x1={0} y1={ih} x2={iw} y2={ih} stroke="rgba(255,255,255,0.2)" />
    </G>
  );
}

function PieChart({ data, W, H }) {
  const r = Math.min(W, H) / 2 - 30;
  const arcs = d3pie().value((d) => d.value)(data);
  const arcGen = d3arc().innerRadius(0).outerRadius(r);
  return (
    <G x={W / 2} y={H / 2}>
      {arcs.map((a, i) => {
        const [cx, cy] = arcGen.centroid(a);
        return (
          <G key={i}>
            <Path d={arcGen(a)} fill={PALETTE[i % PALETTE.length]} stroke="#0a0a0b" strokeWidth={2} />
            <SvgText x={cx} y={cy} fill="#fff" fontSize="9" textAnchor="middle">{a.data.label.slice(0, 7)}</SvgText>
          </G>
        );
      })}
    </G>
  );
}
