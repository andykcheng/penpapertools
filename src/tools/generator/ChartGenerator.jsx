import React, { useState, useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export const metadata = {
  id: 'chart-generator',
  name: 'Chart Generator',
  description: 'Generate random charts (Bar, Line, Pie) for placeholders',
  category: 'generator'
};

const PALETTES = {
  vibrant: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'],
  pastel: ['#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#A0C4FF', '#BDB2FF'],
  corporate: ['#2c3e50', '#e74c3c', '#ecf0f1', '#3498db', '#2980b9', '#f1c40f', '#8e44ad'],
};

const ChartGenerator = () => {
  const [type, setType] = useState('bar');
  const [title, setTitle] = useState('Monthly Overview');
  const [palette, setPalette] = useState('vibrant');
  const [chartData, setChartData] = useState(null);
  const chartRef = useRef(null);

  const generateRandomData = () => {
    let labels, dataCount;

    if (type === 'pie' || type === 'doughnut') {
      labels = ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'];
      dataCount = 5;
    } else {
      labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
      dataCount = 7;
    }

    const data = Array.from({ length: dataCount }, () => Math.floor(Math.random() * 100) + 10);
    const colors = PALETTES[palette];

    setChartData({
      labels,
      datasets: [
        {
          label: 'Dataset 1',
          data: data,
          backgroundColor: type === 'line' ? colors[0] : colors,
          borderColor: type === 'line' ? colors[0] : '#ffffff',
          borderWidth: 2,
          tension: type === 'line' ? 0.4 : 0, // Smooth lines
          fill: type === 'line',
        },
      ],
    });
  };

  useEffect(() => {
    generateRandomData();
  }, [type, palette]);

  const handleDownload = () => {
    if (chartRef.current) {
      const link = document.createElement('a');
      link.download = `${type}-chart.png`;
      link.href = chartRef.current.toBase64Image();
      link.click();
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: !!title,
        text: title,
        font: { size: 18 }
      },
    },
  };

  const renderChart = () => {
    if (!chartData) return null;
    const props = { ref: chartRef, data: chartData, options };
    
    switch (type) {
      case 'bar': return <Bar {...props} />;
      case 'line': return <Line {...props} />;
      case 'pie': return <Pie {...props} />;
      case 'doughnut': return <Doughnut {...props} />;
      default: return null;
    }
  };

  return (
    <div className="tool-container">
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Chart Type:</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              style={{ padding: '8px', width: '100%' }}
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="pie">Pie Chart</option>
              <option value="doughnut">Doughnut Chart</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Chart Title:</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              style={{ padding: '8px', width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Color Palette:</label>
            <select 
              value={palette} 
              onChange={(e) => setPalette(e.target.value)}
              style={{ padding: '8px', width: '100%' }}
            >
              <option value="vibrant">Vibrant</option>
              <option value="pastel">Pastel</option>
              <option value="corporate">Corporate</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button 
              onClick={generateRandomData}
              style={{ padding: '10px 20px', cursor: 'pointer', flex: 1 }}
            >
              Randomize Data
            </button>
            <button 
              onClick={handleDownload}
              style={{ padding: '10px 20px', cursor: 'pointer', flex: 1, backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Download PNG
            </button>
          </div>
        </div>

        <div style={{ flex: 2, minWidth: '300px', height: '400px', border: '1px solid #eee', padding: '10px', borderRadius: '4px', backgroundColor: '#fff' }}>
          {renderChart()}
        </div>
      </div>
    </div>
  );
};

export default ChartGenerator;
