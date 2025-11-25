import { ReactFlowNode, Node } from "../../../types";
import { Card, CardContent, CardHeader } from "../../ui/card";
import NodeHeader from "./NodeHeader";
import StepEditor from "./StepEditor";
import ConditionEditor from "./ConditionEditor";

export default function NodeDetails({
  node,
  onUpdate,
  setBrowserOpen,
  recentUrl,
}: {
  node: ReactFlowNode;
  onUpdate: (
    sourceId: string,
    type: "update" | "delete",
    updates?: Partial<Node["data"]>
  ) => void;
  setBrowserOpen: (arg?: boolean | string) => void;
  recentUrl: string;
}) {
  const { data, id } = node;

  // Helper function to handle picking a selector
  const handlePickSelector = async (setter: (selector: string) => void) => {
    if (!(window as any).electronAPI?.pickSelector) {
      alert("Electron API not available. Ensure the browser is set up.");
      return;
    }
    try {
      // Ensure recentUrl is a valid string
      const urlToOpen = typeof recentUrl === 'string' && recentUrl ? recentUrl : "https://";
      const selector = await (window as any).electronAPI.pickSelector(urlToOpen);
      if (selector) {
        if (data.step?.type === "selectOption") {
          const sel = selector.toString().split("||");
          setter(sel[0]);
          onUpdate(id, "update", {
            step: {
              ...data.step,
              selector: sel[0],
              optionIndex: sel[1] ? parseInt(sel[1]) : undefined,
              optionValue: sel[2] || "",
            },
          });
          console.log("Option selector picked:", selector);
        } else {
          setter(selector);
        }
      }
      (window as any).electronAPI.focusMainWindow?.();
    } catch (err: any) {
      console.error("Selector pick failed:", err);
      alert(err.message || "Failed to pick selector. Ensure the browser is open and try again.");
    }
  };

  return (
    <Card className="w-80 max-h-[80vh] overflow-y-auto">
      <CardHeader className="p-3">
        <NodeHeader title={data.step ? data.step.type : "Conditional"} id={id} onDelete={(nodeId) => onUpdate(nodeId, "delete")} />
      </CardHeader>
      <CardContent className="p-3 space-y-4">
        {data.step ? (
          <StepEditor node={node} onUpdate={onUpdate} onPickWithSetter={handlePickSelector} />
        ) : (
          <ConditionEditor node={node} onUpdate={onUpdate} onPickWithSetter={handlePickSelector} />
        )}
      </CardContent>
    </Card>
  );
}
