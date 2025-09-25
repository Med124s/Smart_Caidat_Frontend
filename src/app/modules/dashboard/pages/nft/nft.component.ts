import { AsyncPipe, DecimalPipe, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NftHeaderComponent } from '../../components/nft/nft-header/nft-header.component';
import {  Kpis, MonthlyStat, UserStat } from '../../models/nft';
import { map, Observable, of } from 'rxjs';
import { DashboardService } from '../../service/dashboard-service';
import { BaseChartDirective } from 'ng2-charts';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart, ChartData, ChartOptions, PieController, ArcElement, Tooltip, Legend, Title } from 'chart.js';

// ⚠️ register required elements & plugin
Chart.register(PieController, ArcElement, Tooltip, Legend, Title, ChartDataLabels);


@Component({
  selector: 'app-nft',
  templateUrl: './nft.component.html',
  imports: [
    NftHeaderComponent,NgIf,AsyncPipe,DecimalPipe,BaseChartDirective
  ],
})
export class DashboardStatComponent {
  // nft: Array<Nft>;
  

  private svc = inject(DashboardService);

  /** KPIs */
  kpis$: Observable<Kpis> = this.svc.getKpis();

  /** Line chart – demandes par mois */
  lineChartData$: Observable<ChartData<'line'>> = this.svc.getRequestsMonthly().pipe(
    map((arr: MonthlyStat[]) => ({
      labels: arr.map(a => a.month),
      datasets: [
        { data: arr.map(a => a.count), label: 'Demandes', fill: false, tension: 0.3 }
      ]
    }))
  );

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: { legend: { position: 'top' } }
  };

  /** Bar chart – demandes par utilisateur */
  barChartData$: Observable<ChartData<'bar'>> = this.svc.getRequestsByUser().pipe(
    map((u: UserStat[]) => ({
      labels: u.map(x => x.userName),
      datasets: [{ data: u.map(x => x.count), label: 'Demandes' }]
    }))
  );

  barChartOptions: ChartOptions<'bar'> = { 
    responsive: true, 
    plugins: { legend: { display: false } } 
  };

    /** ✅ Données statiques pour tester Réclamations par citoyen */
 /** ✅ Données statiques pour Réclamations par statut */
  complaintsByStatus$ = of<ChartData<'doughnut'>>({
    labels: ['Ouverte', 'En cours', 'Résolue', 'Rejetée'],
    datasets: [
      {
        data: [12, 8, 20, 5], // <-- exemple de valeurs
        backgroundColor: [
          '#60A5FA', // bleu clair (ouverte)
          '#FBBF24', // jaune (en cours)
          '#34D399', // vert (résolue)
          '#F87171'  // rouge (rejetée)
        ],
        hoverOffset: 6
      }
    ]
  });

  complaintsByStatusOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };


  
complaintsByCategory: ChartData<'pie', number[], string> = {
  labels: ['Eau', 'Électricité', 'Voirie', 'Sécurité', 'Administration'],
  datasets: [
    {
      data: [10, 7, 5, 3, 2],
      backgroundColor: ['#F87171', '#60A5FA', '#34D399', '#FBBF24', '#A78BFA'],
    },
  ],
};


complaintsByCategoryOptions: ChartOptions<'pie'> = {
  responsive: true,
  plugins: {
    legend: { position: 'top' },
    title: { display: true, text: 'Répartition des réclamations par catégorie', font: { size: 16, weight: 'bold' } },
    // ⚠️ chartjs-plugin-datalabels doit être défini ici
    datalabels: {
      color: '#fff',
      formatter: (value, context) => {
        const label = context.chart.data.labels![context.dataIndex];
        return `${label}: ${value}`;
      },
      font: { weight: 'bold', size: 12 },
    },
  },
};





  /** Bar Chart – Réclamations par citoyen */
  complaintsByCitizen: ChartData<'bar'> = {
    labels: ['Benyghil', 'El malki', 'Achraf', 'Taher', 'Ourmdane'],
    datasets: [
      {
        label: 'Réclamations',
        data: [12, 9, 15, 7, 5],
        backgroundColor: '#F87171'
      }
    ]
  };

  complaintsByCitizenOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { title: { display: true, text: 'Citoyens' } },
      y: { title: { display: true, text: 'Nombre de réclamations' }, beginAtZero: true }
    }
  };

  /** Bar chart – réclamations par citoyen */
  // complaintsByCitizen$: Observable<ChartData<'bar'>> = this.svc.getComplaintsByCitizen().pipe(
  //   map((citizens: { citizenName: string; count: number }[]) => ({
  //     labels: citizens.map(c => c.citizenName),
  //     datasets: [
  //       { 
  //         data: citizens.map(c => c.count), 
  //         label: 'Réclamations', 
  //         backgroundColor: '#F87171' // rouge Tailwind
  //       }
  //     ]
  //   }))
  // );

  // complaintsChartOptions: ChartOptions<'bar'> = {
  //   responsive: true,
  //   plugins: { legend: { display: false } },
  //   scales: {
  //     x: { title: { display: true, text: 'Citoyens' } },
  //     y: { title: { display: true, text: 'Réclamations' }, beginAtZero: true }
  //   }
  // };


}
