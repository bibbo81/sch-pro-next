'use client'

import React from 'react'
import { BaseChart } from './BaseChart'

interface MetricData {
  label: string
  value: number
  color?: string
  target?: number
}

interface MetricsChartProps {
  data: MetricData[]
  title?: string
  type?: 'bar' | 'doughnut'
  height?: number
  showTargets?: boolean
  valueFormatter?: (value: number) => string
}

export const MetricsChart: React.FC<MetricsChartProps> = ({
  data,
  title = 'Metriche Performance',
  type = 'bar',
  height = 300,
  showTargets = false,
  valueFormatter = (value) => value.toString()
}) => {
  const defaultColors = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#06b6d4', // cyan
  ]

  const datasets = [
    {
      label: 'Valore Attuale',
      data: data.map(item => item.value),
      backgroundColor: data.map((item, index) =>
        item.color || defaultColors[index % defaultColors.length]
      ),
      borderColor: data.map((item, index) =>
        item.color || defaultColors[index % defaultColors.length]
      ),
      borderWidth: type === 'bar' ? 0 : 2,
      borderRadius: type === 'bar' ? 4 : 0,
    }
  ]

  // Add target dataset if enabled and targets exist
  if (showTargets && type === 'bar' && data.some(item => item.target)) {
    datasets.push({
      label: 'Target',
      data: data.map(item => item.target || 0),
      backgroundColor: data.map(() => 'rgba(156, 163, 175, 0.3)'),
      borderColor: data.map(() => '#9ca3af'),
      borderWidth: 2,
      borderRadius: 4,
    })
  }

  const chartData = {
    labels: data.map(item => item.label),
    datasets
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
        display: showTargets && type === 'bar',
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || ''
            const value = valueFormatter(context.parsed.y || context.parsed)
            return `${label}: ${value}`
          }
        }
      }
    },
    scales: type === 'bar' ? {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => valueFormatter(value)
        }
      }
    } : undefined
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