'use client'

import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
)

interface BaseChartProps {
  type: 'bar' | 'doughnut' | 'line'
  data: any
  options?: any
  height?: number
  className?: string
}

export const BaseChart: React.FC<BaseChartProps> = ({
  type,
  data,
  options = {},
  height = 300,
  className = ''
}) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1
      }
    },
    scales: type !== 'doughnut' ? {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    } : undefined,
    ...options
  }

  const containerStyle = {
    height: `${height}px`,
    width: '100%'
  }

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar data={data} options={defaultOptions} />
      case 'doughnut':
        return <Doughnut data={data} options={defaultOptions} />
      case 'line':
        return <Line data={data} options={defaultOptions} />
      default:
        return <Bar data={data} options={defaultOptions} />
    }
  }

  return (
    <div className={`${className}`} style={containerStyle}>
      {renderChart()}
    </div>
  )
}