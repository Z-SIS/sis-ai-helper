import { z } from 'zod';

export const DisbandmentPlanPhaseSchema = z.object({
  phase: z.number(),
  name: z.string(),
  duration: z.string(),
  description: z.string(),
  tasks: z.array(z.string()),
  responsible: z.string()
});

export const DisbandmentPlanAssetSchema = z.object({
  asset: z.string(),
  disposition: z.string(),
  responsible: z.string()
});

export const DisbandmentPlanKnowledgeTransferSchema = z.object({
  knowledgeArea: z.string(),
  recipient: z.string(),
  method: z.string(),
  deadline: z.string()
});

export const DisbandmentPlanResultSchema = z.object({
  projectName: z.string(),
  reason: z.string(),
  disbandmentDate: z.string(),
  phases: z.array(DisbandmentPlanPhaseSchema),
  assetDistribution: z.array(DisbandmentPlanAssetSchema),
  knowledgeTransfer: z.array(DisbandmentPlanKnowledgeTransferSchema),
  legalConsiderations: z.array(z.string()),
  communicationPlan: z.string(),
  finalChecklist: z.array(z.string())
});

export type DisbandmentPlanPhase = z.infer<typeof DisbandmentPlanPhaseSchema>;
export type DisbandmentPlanAsset = z.infer<typeof DisbandmentPlanAssetSchema>;
export type DisbandmentPlanKnowledgeTransfer = z.infer<typeof DisbandmentPlanKnowledgeTransferSchema>;
export type DisbandmentPlanResult = z.infer<typeof DisbandmentPlanResultSchema>;