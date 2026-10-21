export type DeterministicFixTemplate = {
  whatIsWrong: string;
  whyItMatters: string;
  genericPattern: string;
  whatNotToDo: string;
  howToVerify: string;
};

export type RuleKnowledge = {
  ruleId: string;
  plainTitle?: string;
  userImpact?: string;
  fixCategory?: string;
  deterministicFixTemplate?: DeterministicFixTemplate;
  beforeExample?: string;
  afterExample?: string;
  manualVerificationSteps?: string[];
  groupingHints?: string[];
  commonFalsePositiveNotes?: string[];
};
