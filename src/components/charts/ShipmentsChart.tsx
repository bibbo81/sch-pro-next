'use client'

import React from 'react'
import { BaseChart } from './BaseChart'

interface ShipmentData {
  status: string
  count: number
  color: string
}

interface ShipmentsChartProps {
  data: ShipmentData[]
  type?: 'bar' | 'doughnut'
  title?: string
  height?: number
}

export const ShipmentsChart: React.FC<ShipmentsChartProps> = ({
  data,
  type = 'doughnut',
  title = 'Distribuzione Spedizioni',
  height = 300
}) => {
  const chartData = {
    labels: data.map(item => item.status),
    datasets: [
      {
        label: 'Spedizioni',
        data: data.map(item => item.count),
        backgroundColor: data.map(item => item.color),
        borderColor: data.map(item => item.color),
        borderWidth: type === 'bar' ? 0 : 2,
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
        position: type === 'doughnut' ? 'right' : 'top',
        labels: {
          usePointStyle: type === 'doughnut',
          padding: 15
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