export interface Plan {
  id: string;
  submitDate: string;
  planDate: string;
  description: string;
  alternative: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback: string;
}

export interface PlanUpdateInput {
  status: 'approved' | 'rejected';
  feedback: string;
}