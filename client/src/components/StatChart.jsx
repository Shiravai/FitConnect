// src/components/StatChart.jsx — reusable D3.js chart (requirement #29).
// Supports "bar", "line" and "pie". Data is [{ label, value }] and comes live from the DB.
import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function StatChart({ type, data, title }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    d3.select(el).selectAll("*").remove(); // clear on re-render
    if (!data || data.length === 0) {
      d3.select(el).append("p").attr("class", "muted").text("No data yet.");
      return;
    }

    const width = 360;
    const height = 260;
    const margin = { top: 20, right: 20, bottom: 50, left: 45 };
    const color = d3.scaleOrdinal(d3.schemeTableau10);

    const svg = d3.select(el).append("svg").attr("width", width).attr("height", height);

    if (type === "bar") {
      const x = d3.scaleBand().domain(data.map((d) => d.label)).range([margin.left, width - margin.right]).padding(0.2);
      const y = d3.scaleLinear().domain([0, d3.max(data, (d) => d.value) || 1]).nice().range([height - margin.bottom, margin.top]);

      svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x))
        .selectAll("text").attr("transform", "rotate(-35)").style("text-anchor", "end");
      svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y).ticks(5));

      svg.selectAll("rect").data(data).join("rect")
        .attr("x", (d) => x(d.label)).attr("y", (d) => y(d.value))
        .attr("width", x.bandwidth()).attr("height", (d) => y(0) - y(d.value))
        .attr("rx", 4).attr("fill", (d, i) => color(i));
    }

    if (type === "line") {
      const x = d3.scalePoint().domain(data.map((d) => d.label)).range([margin.left, width - margin.right]);
      const y = d3.scaleLinear().domain([0, d3.max(data, (d) => d.value) || 1]).nice().range([height - margin.bottom, margin.top]);

      svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x))
        .selectAll("text").attr("transform", "rotate(-35)").style("text-anchor", "end");
      svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y).ticks(5));

      const line = d3.line().x((d) => x(d.label)).y((d) => y(d.value)).curve(d3.curveMonotoneX);
      svg.append("path").datum(data).attr("fill", "none").attr("stroke", "#ff5722").attr("stroke-width", 2.5).attr("d", line);
      svg.selectAll("circle").data(data).join("circle")
        .attr("cx", (d) => x(d.label)).attr("cy", (d) => y(d.value)).attr("r", 4).attr("fill", "#ff5722");
    }

    if (type === "pie") {
      const radius = Math.min(width, height) / 2 - 30;
      const g = svg.append("g").attr("transform", `translate(${width / 2},${height / 2})`);
      const pie = d3.pie().value((d) => d.value);
      const arc = d3.arc().innerRadius(0).outerRadius(radius);

      g.selectAll("path").data(pie(data)).join("path")
        .attr("d", arc).attr("fill", (d, i) => color(i)).attr("stroke", "#fff").attr("stroke-width", 2);
      g.selectAll("text").data(pie(data)).join("text")
        .attr("transform", (d) => `translate(${arc.centroid(d)})`).attr("text-anchor", "middle")
        .attr("font-size", "10px").attr("fill", "#fff").text((d) => d.data.label);
    }
  }, [type, data]);

  return (
    <div className="stat-chart">
      <h3>{title}</h3>
      <div ref={ref} />
    </div>
  );
}
