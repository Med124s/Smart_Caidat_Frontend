import { MenuItem } from '../models/menu.model';

export class Menu {
  public static pages: MenuItem[] = [
    {
      group: 'Base',
      separator: false,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/chart-pie.svg',
          label: 'Tableau de bord',
          route: '/dashboard',
          children: [{ label: 'Statistiques', route: '/dashboard/statistics' }],
        },
        {
          icon: 'assets/icons/heroicons/outline/cube.svg',
          label: 'Gestion des documents',
          route: '/document_management',
          children: [
            { label: 'Archives administratives', route: '/document_management/archives' },
            { label: 'Demandes de documents', route: '/document_management/requests' },
          ],
        },
      ],
    },
    {
      group: "Gestion des utilisateurs",
      separator: true,
      items: [
        // {
        //   icon: 'assets/icons/heroicons/outline/download.svg',
        //   label: 'Download',
        //   route: '/download',
        // },
        // {
        //   icon: 'assets/icons/heroicons/outline/gift.svg',
        //   label: 'Gift Card',
        //   route: '/gift',
        // },
        {
          icon: 'assets/icons/heroicons/outline/users.svg',
          label: 'Utilisateurs',
          route: '/users',
        },
      ],
    },
    {
      group: "Gestion des citoyens",
      separator: true,
      items: [
        // {
        //   icon: 'assets/icons/heroicons/outline/download.svg',
        //   label: 'Download',
        //   route: '/download',
        // },
        // {
        //   icon: 'assets/icons/heroicons/outline/gift.svg',
        //   label: 'Gift Card',
        //   route: '/gift',
        // },
        {
          icon: 'assets/icons/heroicons/outline/users.svg',
          label: 'Citoyens',
          route: '/citoyens',
        },
      ],
    },
    {
      group: "Gestion des réclamations",
      separator: true,
      items: [
        // {
        //   icon: 'assets/icons/heroicons/outline/download.svg',
        //   label: 'Download',
        //   route: '/download',
        // },
        // {
        //   icon: 'assets/icons/heroicons/outline/gift.svg',
        //   label: 'Gift Card',
        //   route: '/gift',
        // },
        {
          icon: 'assets/icons/heroicons/outline/users.svg',
          label: 'Réclamations',
          route: '/reclamations',
        },
      ],
    },
    {
      group: "Gestion des correspondances",
      separator: true,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/envelope-open-text-thin-full.svg',
          label: 'Correspondances',
          route: '/correspondances',
        },
        {
          icon: 'assets/icons/heroicons/outline/square-envelope-thin-full.svg',
          label: 'Type Correspondance',
          route: '/type-correspondances',
        }
      ],
    },
     {
      group: "Réunions",
      separator: true,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/calendar-thin-full.svg',
          label: 'Réunions',
          route: '/meetings',
        },
        {
          icon: 'assets/icons/heroicons/outline/people-roof-thin-full.svg',
          label: 'Salles de réunions',
          route: '/salles',
        }
      ],
    }, 
     {
      group: "Gestion des tâches",
      separator: true,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/list-check-thin-full.svg',
          label: 'Tâches',
          route: '/tasks',
        },
      ],
    }
  ];
}