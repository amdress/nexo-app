export interface WizardStepChildProps {
  state: any;
  updateState: (key: string, value: any) => void;
  onValidate: (isValid: boolean) => void;
}

export interface StepItem {
  component: React.ComponentType<WizardStepChildProps>;
}

export interface BaseWizardProps {
  steps: StepItem[];
  initialState: any;
  onFinish: (finalState: any) => void; 
  onCancel: () => void;
}