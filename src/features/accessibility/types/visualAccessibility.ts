export type RGBColor = {
  r: number;
  g: number;
  b: number;
};

export type ContrastTextType = "normal" | "large" | "non_text";

export type ContrastVerdict = "pass" | "fail" | "review";

export type ContrastEvaluation = {
  ratio: number;
  displayRatio: string;
  aaNormal: ContrastVerdict;
  aaLarge: ContrastVerdict;
  aaaNormal: ContrastVerdict;
  aaaLarge: ContrastVerdict;
  requiredRatio: number;
  primaryVerdict: ContrastVerdict;
  primaryLabel: string;
};

export type NormalizedSamplePoint = {
  x: number;
  y: number;
};

export type ColorSample = {
  hex: string;
  rgb: RGBColor;
  normalized?: NormalizedSamplePoint;
  label?: string;
};

export type HumanReviewAnswer = "yes" | "no" | "not_sure" | null;

export type VisualChecklistState = {
  colorOnlyMeaning: HumanReviewAnswer;
  textOverComplexBackground: HumanReviewAnswer;
  importantSmallText: HumanReviewAnswer;
  textOnlyInGraphic: HumanReviewAnswer;
  understandableWithoutColor: HumanReviewAnswer;
};

export type MultiBackgroundStats = {
  minRatio: number;
  maxRatio: number;
  avgRatio: number;
  worstRatio: number;
};
