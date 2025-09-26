'use client'

import React from 'react'
import { BaseChart } from './BaseChart'

interface TrendData {
  period: string
  value: number
  label?: string
}

interface TrendChartProps {
  data: TrendData[]
  title?: string
  color?: string
  type?: 'line' | 'bar'
  height?: number
  valueFormatter?: (value: number) => string
}

export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  title = 'Trend nel Tempo',
  color = '#3b82f6',
  type = 'line',
  height = 300,
  valueFormatter = (value) => value.toString()
}) => {
  const chartData = {
    labels: data.map(item => item.period),
    datasets: [
      {
        label: title,
        data: data.map(item => item.value),
        borderColor: color,
        backgroundColor: type === 'line'
          ? `${color}20`
          : color,
        borderWidth: 2,
        fill: type === 'line',
        tension: 0.4,
        pointBackgroundColor: color,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        borderRadius: type === 'bar' ? 4 : 0,
      }
    ]
  }

  const options = {
    plugins: {
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: 20
      },
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${valueFormatter(context.parsed.y)}`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => valueFormatter(value)
        }
      }
    }
  }

  return (
    <BaseChart
      type={type}
      data={chartData}
      options={options}
      height={height}
    />
  )
}