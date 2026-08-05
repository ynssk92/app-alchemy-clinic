import { cn } from "@/lib/utils";
import { User, Activity, ShieldCheck, Check, Upload } from "lucide-react";

interface ProgressIndicatorProps {
  currentStep: number;
}

const ProgressIndicator = ({ currentStep }: ProgressIndicatorProps) => {
  const steps = [
    { id: 1, label: "Personal", icon: User },
    { id: 2, label: "Medical", icon: Activity },
    { id: 3, label: "Emergency", icon: ShieldCheck },
    { id: 4, label: "Documents", icon: Upload },
  ];

  return (
    <div className="relative flex justify-between items-center max-w-3xl mx-auto">
      {/* Connector Line */}
      <div className="absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 bg-muted -z-10 rounded-full">
        <div 
          className="h-full bg-primary transition-all duration-500 rounded-full" 
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />
      </div>

      {steps.map((step) => {
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;
        const Icon = step.icon;

        return (
          <div key={step.id} className="flex flex-col items-center gap-2 group">
            <div
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 border-4",
                isActive 
                  ? "bg-primary text-primary-foreground border-primary/20 scale-110 shadow-lg shadow-primary/20" 
                  : isCompleted 
                    ? "bg-emerald-500 text-white border-emerald-500/20" 
                    : "bg-background text-muted-foreground border-muted hover:border-primary/50"
              )}
            >
              {isCompleted ? (
                <Check className="w-5 h-5" />
              ) : (
                <Icon className={cn("w-5 h-5", isActive ? "animate-pulse" : "")} />
              )}
            </div>
            <span className={cn(
              "text-xs font-bold uppercase tracking-wider transition-colors duration-300",
              isActive ? "text-primary" : isCompleted ? "text-emerald-600" : "text-muted-foreground"
            )}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default ProgressIndicator;
