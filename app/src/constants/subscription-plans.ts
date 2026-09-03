export interface SubscriptionPlanDef {
  id: number;
  name: string;
  price: number;
  benefits: string[];
}

export const SUBSCRIPTION_PLANS: SubscriptionPlanDef[] = [
  {
    id: 1,
    name: 'GOBAADI Premium',
    price: 99.0,
    benefits: [
      '5 AI health detections/month',
      '1 free doctor checkup',
      'Health reminders',
      '30 health alerts',
    ],
  },
  {
    id: 2,
    name: 'GOBAADI Pro',
    price: 29.99,
    benefits: [
      'Unlimited AI health detection',
      '4 free doctor checkups/month',
      '150 health alerts',
      'Priority doctor consultation',
      'Emergency doctor support',
    ],
  },
];
