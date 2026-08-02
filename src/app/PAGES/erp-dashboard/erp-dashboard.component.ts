import { Component, ViewChild } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexStroke,
  ApexXAxis,
  ApexYAxis,
  ApexFill,
  ApexTooltip,
  ApexGrid,
  ApexLegend,
  ApexNonAxisChartSeries,
  ChartComponent
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  fill: ApexFill;
  tooltip: ApexTooltip;
  grid: ApexGrid;
  colors: string[];
  legend: ApexLegend;
};

export type PieChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  colors: string[];
  legend: ApexLegend;
};

@Component({
  selector: 'app-erp-dashboard',
  templateUrl: './erp-dashboard.component.html',
  styleUrls: ['./erp-dashboard.component.css'],
  imports: [ChartComponent]
})
export class ErpDashboardComponent {
  public chartOptions: Partial<ChartOptions>;
  public pieChart: Partial<PieChartOptions>;
  
  @ViewChild("chart") chart!: ChartComponent;

  constructor() {
    this.chartOptions = {
      series: [
        {
          name: "Revenue",
          data: [35, 42, 58, 48, 72, 80, 95, 85, 110, 95, 120, 105]
        },
        {
          name: "Cost",
          data: [25, 35, 40, 52, 60, 68, 75, 70, 85, 75, 90, 80]
        }
      ],
      chart: {
        type: "area",
        height: 350,
        toolbar: { show: false },
        zoom: { enabled: false },
        fontFamily: 'Inter, sans-serif'
      },
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 3 },
      fill: {
        opacity: 0.3,
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.1
        }
      },
      xaxis: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      },
      yaxis: {
        title: { text: "Amount ($)" }
      },
      tooltip: { shared: true },
      grid: { borderColor: "#f0f2f5" },
      colors: ["#4B49AC", "#57C7D4"],
      legend: {
        position: "top",
        horizontalAlign: "right"
      }
    };

    this.pieChart = {
      series: [44, 25, 18, 13],
      chart: {
        type: "donut",
        height: 300,
        fontFamily: 'Inter, sans-serif'
      },
      labels: ["Direct", "Social", "Referral", "Email"],
      colors: ["#4B49AC", "#57C7D4", "#FFC100", "#FF7B7B"],
      legend: {
        position: "bottom",
        fontSize: "13px"
      }
    };
  }
}