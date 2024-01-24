import React, { useState, useEffect, useCallback } from 'react';
import * as d3 from 'd3';
import _debounce from 'lodash/debounce';

const FilteredChart = () => {
  const [intensityData, setIntensityData] = useState([]);
  const [startYearData, setStartYearData] = useState([]);
  const [startYear, setStartYear] = useState([]);
  const [selectedGraph, setSelectedGraph] = useState('');
  const [minIntensity, setMinIntensity] = useState('');
  const [maxIntensity, setMaxIntensity] = useState('');
  const [minRelevance, setMinRelevance] = useState('');
  const [maxRelevance, setMaxRelevance] = useState('');
  const [relevanceData, setRelevanceData] = useState([]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchIntensityData = useCallback(
    _debounce(async (min, max) => {
      try {
        let apiUrl = 'http://localhost:5001/api/v0/intensity';
        if (min !== '' && max !== '') {
          apiUrl += `?min=${min}&max=${max}`;
        }
        const response = await fetch(apiUrl);
        const data = await response.json();
        setIntensityData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }, 500),
    [setIntensityData]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchStartYear = useCallback(
    _debounce(async (year) => {
      try {
        let apiUrl = 'http://localhost:5001/api/v0/year';
        if (year !== '') {
          apiUrl += `?start=${year}`;
        }
        const response = await fetch(apiUrl);
        const data = await response.json();
        setStartYearData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }, 500),
    [setStartYearData]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchRelevanceData = useCallback(
    _debounce(async (min, max) => {
      try {
        let apiUrl = 'http://localhost:5001/api/v0/relevance';
        if (min !== '' && max !== '') {
          apiUrl += `?min=${min}&max=${max}`;
        }
        const response = await fetch(apiUrl);
        const data = await response.json();
        setRelevanceData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }, 500),
    [setRelevanceData]
  );

  const handleFetchIntensityDataClick = () => {
    if (minIntensity !== '' && maxIntensity !== '') {
      fetchIntensityData(minIntensity, maxIntensity);
    } else {
      console.error('Please enter both min and max intensity values.');
    }
  };

  const handleFetchStartYearDataClick = () => {
    if (startYear !== '') {
      fetchStartYear(startYear);
    } else {
      console.error('Please enter the start year.');
    }
  };

  const handleFetchRelevanceDataClick = () => {
    if (minRelevance !== '' && maxRelevance !== '') {
      fetchRelevanceData(minRelevance,maxRelevance);
    } else {
      console.error('Please enter the start year.');
    }
  };

  const drawChart = useCallback(() => {
    const svg = d3.select('#chart');
    svg.selectAll('*').remove(); 
    switch (selectedGraph) {
      case 'bar':
        const chartData = intensityData.map((d) => ({
          intensity: +d.intensity,
          country: d.country,
        }));

        const margin = { top: 20, right: 20, bottom: 30, left: 40 };
        const width = 400 - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;
        const xScale = d3
          .scaleBand()
          .domain(chartData.map((d) => d.country))
          .range([0, width])
          .padding(0.1);

        const yScale = d3
          .scaleLinear()
          .domain([
            d3.min(chartData, (d) => d.intensity),
            d3.max(chartData, (d) => d.intensity),
          ])
          .range([height, 0]);

        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        svg
          .append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`)
          .call(yAxis)
          .append('text') 
          .attr('transform', 'rotate(-90)')
          .attr('y', -margin.left + 5)
          .attr('dy', '0.71em')
          .attr('fill', '#000')
          .text('Intensity');

        svg
          .append('g')
          .attr('transform', `translate(${margin.left},${height + margin.top})`)
          .call(xAxis)
          .append('text') 
          .attr('x', width / 2)
          .attr('y', margin.bottom)
          .attr('fill', '#000')
          .text('Countries');

        svg
          .selectAll('rect')
          .data(chartData)
          .enter()
          .append('rect')
          .attr('x', (d) => xScale(d.country) + margin.left)
          .attr('y', (d) => yScale(d.intensity) + margin.top)
          .attr('width', xScale.bandwidth())
          .attr('height', (d) => height - yScale(d.intensity))
          .attr('fill', 'yellow');

        break;

      case 'line':
        const lineChartData = startYearData.map((d) => ({
          intensity: +d.intensity,
          startYear: +d.start_year,
        }));

        const marginLine = { top: 20, right: 20, bottom: 30, left: 40 };
        const widthLine = 400 - marginLine.left - marginLine.right;
        const heightLine = 300 - marginLine.top - marginLine.bottom;

        const xScaleLine = d3
          .scaleLinear()
          .domain([
            d3.min(lineChartData, (d) => d.startYear),
            d3.max(lineChartData, (d) => d.startYear),
          ])
          .range([0, widthLine]);

        const yScaleLine = d3
          .scaleLinear()
          .domain([0, d3.max(lineChartData, (d) => d.intensity)])
          .range([heightLine, 0]);

        const xAxisLine = d3.axisBottom(xScaleLine);
        const yAxisLine = d3.axisLeft(yScaleLine);

        svg
          .append('g')
          .attr('transform', `translate(${marginLine.left},${marginLine.top + heightLine})`)
          .call(xAxisLine)
          .append('text') 
          .attr('x', widthLine / 2)
          .attr('y', marginLine.bottom )
          .attr('fill', '#000')
          .text('Start Year');

        svg
          .append('g')
          .attr('transform', `translate(${marginLine.left},${marginLine.top})`)
          .call(yAxisLine)
          .append('text') 
          .attr('transform', 'rotate(-90)')
          .attr('x', -heightLine / 2)
          .attr('y', -marginLine.left + 15)
          .attr('fill', '#000')
          .text('Intensity');

        const line = d3
          .line()
          .x((d) => xScaleLine(d.startYear) + marginLine.left)
          .y((d) => yScaleLine(d.intensity) + marginLine.top);

        svg
          .append('path')
          .data([lineChartData])
          .attr('fill', 'none')
          .attr('stroke', 'blue')
          .attr('stroke-width', 2)
          .attr('d', line);

        break;
        
        case 'scatter':
        const scatterData = relevanceData.map((d) => ({
          relevance: +d.relevance,
          likelihood: +d.likelihood,
        }));

        const marginScatter = { top: 20, right: 20, bottom: 30, left: 40 };
        const widthScatter = 400 - marginScatter.left - marginScatter.right;
        const heightScatter = 300 - marginScatter.top - marginScatter.bottom;

        const xScaleScatter = d3
          .scaleLinear()
          .domain([0, d3.max(scatterData, (d) => d.relevance)])
          .range([0, widthScatter]);

        const yScaleScatter = d3
          .scaleLinear()
          .domain([0, d3.max(scatterData, (d) => d.likelihood)])
          .range([heightScatter, 0]);

        const xAxisScatter = d3.axisBottom(xScaleScatter);
        const yAxisScatter = d3.axisLeft(yScaleScatter);

        svg
          .append('g')
          .attr('transform', `translate(${marginScatter.left},${marginScatter.top + heightScatter})`)
          .call(xAxisScatter)
          .append('text')
          .attr('x', widthScatter / 2)
          .attr('y', marginScatter.bottom)
          .attr('fill', '#000')
          .text('Relevance');

        svg
          .append('g')
          .attr('transform', `translate(${marginScatter.left},${marginScatter.top})`)
          .call(yAxisScatter)
          .append('text')
          .attr('transform', 'rotate(-90)')
          .attr('x', -heightScatter / 2)
          .attr('y', -marginScatter.left + 15)
          .attr('fill', '#000')
          .text('Likelihood');

        svg
          .selectAll('circle')
          .data(scatterData)
          .enter()
          .append('circle')
          .attr('cx', (d) => xScaleScatter(d.relevance) + marginScatter.left)
          .attr('cy', (d) => yScaleScatter(d.likelihood) + marginScatter.top)
          .attr('r', 5)
          .attr('fill', 'orange');

        break;

      default:
      //   console.error('Invalid graph type');
    }
  }, [intensityData, startYearData,relevanceData, selectedGraph]);

  useEffect(() => {
    drawChart();
  }, [drawChart, intensityData, startYearData,relevanceData, selectedGraph]);


  return (
    <div>
  <div>
    <label>Select Graph Type:</label>
    <select
      value={selectedGraph}
      onChange={(e) => setSelectedGraph(e.target.value)}
    >
      <option value="select">Select (Graph)</option>
      <option value="bar">Intensity vs Country (Bar Graph)</option>
      <option value="line">Intensity vs Start Year (Line Chart)</option>
      <option value="scatter">Relevance vs Likelihood (Scatter Plot)</option>
    </select>
  </div>
    <br></br>
  {selectedGraph === 'bar' && (
    <div>
      <label>Min Intensity:</label>
      <input
        type="Number"
        value={minIntensity}
        onChange={(e) => setMinIntensity(e.target.value)}
      />
      <label>Max Intensity:</label>
      <input
        type="Number"
        value={maxIntensity}
        onChange={(e) => setMaxIntensity(e.target.value)}
      />
      <br></br>
      <br></br>
      <button onClick={handleFetchIntensityDataClick}>Fetch Data</button>
    </div>
  )}

  {selectedGraph === 'line' && (
    <div>
      <label>Start Year:</label>
      <input
        type="Number"
        value={startYear}
        onChange={(e) => setStartYear(e.target.value)}
      />
      <br></br>
      <br></br>
      <button onClick={handleFetchStartYearDataClick}>Fetch Data</button>
    </div>
  )}

  {selectedGraph === 'scatter' && (
    <div>
    <label>Min Relevance::</label>
    <input
      type="Number"
      value={minRelevance}
      onChange={(e) => setMinRelevance(e.target.value)}
    />
    <label>Max Relevance::</label>
    <input
      type="Number"
      value={maxRelevance}
      onChange={(e) => setMaxRelevance(e.target.value)}
    />
    <br></br>
    <br></br>
    <button onClick={handleFetchRelevanceDataClick}>Fetch Data</button>
    </div>
  )}
  <svg id="chart" width={500} height={300}></svg>
</div>
  );
};

export default FilteredChart;