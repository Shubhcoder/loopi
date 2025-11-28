import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { SelectorButton } from "../customComponents";
import { StepProps } from "./types";

export function SelectOptionStep({ step, id, onUpdate, onPickWithSetter }: StepProps) {
  return (
    <>
      <div className="space-y-2">
        <Label className="text-xs">CSS Selector</Label>
        <div className="flex gap-2">
          <Input
            value={step.selector || ""}
            placeholder="CSS Selector"
            onChange={(e) =>
              onUpdate(id, "update", { step: { ...step, selector: e.target.value } })
            }
            className="text-xs flex-1"
          />
          <SelectorButton
            onPick={async () =>
              onPickWithSetter((selector) =>
                onUpdate(id, "update", { step: { ...step, selector } })
              )
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Option Value</Label>
        <Input
          value={step.optionValue || ""}
          placeholder="Option value to select"
          onChange={(e) =>
            onUpdate(id, "update", { step: { ...step, optionValue: e.target.value } })
          }
          className="text-xs"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Option Index</Label>
        <Input
          type="number"
          value={step.optionIndex || ""}
          placeholder="Option index to select"
          onChange={(e) =>
            onUpdate(id, "update", { step: { ...step, optionIndex: Number(e.target.value) } })
          }
          className="text-xs"
        />
      </div>
    </>
  );
}
