import { useState, useEffect, useCallback } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  Node as FlowNode,
  Edge as FlowEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  ArrowLeft,
  Save,
  Play,
  Plus,
  Trash2,
  Globe,
  Mouse,
  Type,
  Clock,
  Camera,
  Download,
  Pause,
  Square,
  Settings,
} from "lucide-react";
import type {
  Automation,
  AutomationStep,
  Credential,
  Node,
  Edge,
} from "../app";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { set } from "react-hook-form/dist";

// Define types to bridge reactflow and custom Node/Edge
type ReactFlowNode = FlowNode<
  Node["data"] & {
    onAddNode: (
      sourceId: string,
      type: AutomationStep["type"] | "conditional"
    ) => void;
  },
  Node["type"]
>;
type ReactFlowEdge = FlowEdge;

const stepTypes = [
  {
    value: "navigate",
    label: "Navigate",
    icon: Globe,
    description: "Go to a URL",
  },
  {
    value: "click",
    label: "Click",
    icon: Mouse,
    description: "Click an element",
  },
  { value: "type", label: "Type", icon: Type, description: "Enter text" },
  {
    value: "wait",
    label: "Wait",
    icon: Clock,
    description: "Wait for a duration",
  },
  {
    value: "screenshot",
    label: "Screenshot",
    icon: Camera,
    description: "Take a screenshot",
  },
];

// Custom Node Component
const AutomationNode = ({
  data,
  id,
}: {
  data: Node["data"] & {
    onAddNode: (
      sourceId: string,
      type: AutomationStep["type"] | "conditional" | "update" | "delete",
      updates?: Partial<Node["data"]>
    ) => void;
  };
  id: string;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Card className="w-64">
      {id !== "1" && <Handle type="target" position={Position.Top} />}
      <CardHeader className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {data.step &&
              (() => {
                const Icon = stepTypes.find(
                  (s) => s.value === data.step.type
                )?.icon;
                return Icon ? <Icon className="h-4 w-4" /> : null;
              })()}
            <span className="text-sm font-medium capitalize">
              {data.step ? data.step.type : "Conditional"}
            </span>
          </div>
          {id !== "1" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                data.onAddNode(id, "delete");
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3">
        {data.step ? (
          <>
            <div className="space-y-2">
              <Label className="text-xs">Description</Label>
              <Input
                value={data.step.description}
                onChange={(e) => {
                  data.onAddNode(id, "update", {
                    step: { ...data.step, description: e.target.value },
                  });
                }}
                className="text-xs"
                placeholder="Step description"
              />
            </div>
            {data.step.type === "navigate" && (
              <div className="space-y-2">
                <Label className="text-xs">URL</Label>
                <Input
                  value={data.step.value || ""}
                  placeholder="https://google.com"
                  onChange={(e) => {
                    data.onAddNode(id, "update", {
                      step: { ...data.step, value: e.target.value },
                    });
                  }}
                  className="text-xs"
                />
              </div>
            )}
            {(data.step.type === "click" ||
              data.step.type === "type" ||
              data.step.type === "extractWithLogic") && (
              <div className="space-y-2">
                <Label className="text-xs">CSS Selector</Label>
                <Input
                  value={data.step.selector || ""}
                  placeholder="CSS Selector"
                  onChange={(e) => {
                    data.onAddNode(id, "update", {
                      step: { ...data.step, selector: e.target.value },
                    });
                  }}
                  className="text-xs"
                />
              </div>
            )}
            {data.step.type === "type" && (
              <div className="space-y-2">
                <Label className="text-xs">Text to Type</Label>
                <Input
                  value={data.step.value || ""}
                  placeholder="Text to type"
                  onChange={(e) => {
                    data.onAddNode(id, "update", {
                      step: { ...data.step, value: e.target.value },
                    });
                  }}
                  className="text-xs"
                />
              </div>
            )}
            {data.step.type === "wait" && (
              <div className="space-y-2">
                <Label className="text-xs">Duration (seconds)</Label>
                <Input
                  type="number"
                  value={data.step.value || "1"}
                  placeholder="Milliseconds to wait"
                  onChange={(e) => {
                    data.onAddNode(id, "update", {
                      step: { ...data.step, value: e.target.value },
                    });
                  }}
                  className="text-xs"
                />
              </div>
            )}
            {data.step.type === "screenshot" && (
              <div className="space-y-2">
                <Label className="text-xs">Filename</Label>
                <Input
                  type="text"
                  value={data.step.value}
                  placeholder="filename"
                  onChange={(e) => {
                    data.onAddNode(id, "update", {
                      step: { ...data.step, value: e.target.value },
                    });
                  }}
                  className="text-xs"
                />
              </div>
            )}
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label className="text-xs">Condition Type</Label>
              <Select
                value={data.conditionType || "elementExists"}
                onValueChange={(value) => {
                  data.onAddNode(id, "update", {
                    conditionType: value as any,
                  });
                }}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="elementExists">Element Exists</SelectItem>
                  <SelectItem value="valueMatches">Value Matches</SelectItem>
                </SelectContent>
              </Select>
              <div className="space-y-2">
                <Label className="text-xs">Selector</Label>
                <Input
                  value={data.selector || ""}
                  onChange={(e) => {
                    data.onAddNode(id, "update", {
                      selector: e.target.value,
                    });
                  }}
                  placeholder="CSS Selector"
                  className="text-xs"
                />
              </div>
            </div>
            {data.conditionType === "valueMatches" && (
              <div className="space-y-2">
                <Label className="text-xs">Condition</Label>
                <Select
                  value={data.condition || "equals"}
                  onValueChange={(value) => {
                    data.onAddNode(id, "update", {
                      condition: value as any,
                    });
                  }}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="greaterThan">Greater Than</SelectItem>
                    <SelectItem value="lessThan">Less Than</SelectItem>
                  </SelectContent>
                </Select>
                <Label className="text-xs">Expected Value</Label>
                <Input
                  value={data.expectedValue || ""}
                  onChange={(e) => {
                    data.onAddNode(id, "update", {
                      expectedValue: e.target.value,
                    });
                  }}
                  placeholder="Expected value"
                  className="text-xs"
                />
              </div>
            )}
          </>
        )}
        <div className="relative mt-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <>Close</> : <>Add Step</>}
          </Button>
          {isMenuOpen && (
            <div className="absolute z-10 mt-4 w-full bg-white border border-gray-200 rounded-md shadow-lg">
              {stepTypes.map((stepType) => (
                <Button
                  key={stepType.value}
                  variant="ghost"
                  className="w-full text-left justify-start text-xs py-1 px-2"
                  onClick={() => {
                    data.onAddNode(
                      id,
                      stepType.value as AutomationStep["type"]
                    );
                    setIsMenuOpen(false);
                  }}
                >
                  <stepType.icon className="h-4 w-4 mr-2" />
                  {stepType.label}
                </Button>
              ))}
              <Button
                variant="ghost"
                className="w-full text-left justify-start text-xs py-1 px-2"
                onClick={() => {
                  data.onAddNode(id, "conditional");
                  setIsMenuOpen(false);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Conditional
              </Button>
            </div>
          )}
        </div>
      </CardContent>
      <Handle type="source" position={Position.Bottom} id="default" />
    </Card>
  );
};

const nodeTypes = {
  automationStep: AutomationNode,
  conditional: AutomationNode,
};

interface AutomationBuilderProps {
  automation?: Automation;
  credentials: Credential[];
  onSave: (automation: Automation) => void;
  onCancel: () => void;
}

export function AutomationBuilder({
  automation,
  credentials,
  onSave,
  onCancel,
}: AutomationBuilderProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nodes, setNodes, onNodesChange] = useNodesState<
    Node["data"] & {
      onAddNode: (
        sourceId: string,
        type: AutomationStep["type"] | "conditional" | "update" | "delete",
        updates?: Partial<Node["data"]>
      ) => void;
    }
  >([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [schedule, setSchedule] = useState({
    type: "manual" as "interval" | "fixed" | "manual",
    interval: 30,
    unit: "minutes" as "minutes" | "hours" | "days",
    value: "09:00",
  });
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const [isAutomationRunning, setIsAutomationRunning] = useState(false);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);

  useEffect(() => {
    if (automation) {
      setName(automation.name);
      setDescription(automation.description);
      setNodes(
        automation.nodes.map((node) => ({
          ...node,
          data: { ...node.data, onAddNode: handleNodeAction },
        })) as ReactFlowNode[]
      );
      setEdges(automation.edges as ReactFlowEdge[]);
      if (automation.schedule.type !== "manual") {
        setSchedule({
          type: automation.schedule.type,
          interval: automation.schedule.interval || 30,
          unit: automation.schedule.unit || "minutes",
          value: automation.schedule.value || "09:00",
        });
      }
    } else {
      // Initialize with a default navigation node
      const defaultNode: ReactFlowNode = {
        id: "1",
        type: "automationStep",
        data: {
          step: {
            id: "1",
            type: "navigate",
            description: "Navigate to URL",
            selector: "",
            value: "https://",
          },
          onAddNode: handleNodeAction,
        },
        position: { x: 250, y: 50 },
      };
      setNodes(() => [defaultNode]);
    }
  }, [automation, setNodes]);

  useEffect(() => {
    const handleBrowserClosed = () => {
      setIsBrowserOpen(false);
      setIsAutomationRunning(false);
      setCurrentNodeId(null);
    };
    if ((window as any).electronAPI) {
      (window as any).electronAPI.onBrowserClosed(handleBrowserClosed);
    }
  }, []);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: Edge = {
        id: `e${params.source}-${params.target}-${params.sourceHandle || "default"}`,
        source: params.source!,
        target: params.target!,
        sourceHandle: params.sourceHandle as "then" | "else" | undefined,
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const handleNodeAction = useCallback(
    (
      sourceId: string,
      type: AutomationStep["type"] | "conditional" | "update" | "delete",
      updates?: Partial<Node["data"]>
    ) => {
      if (type === "delete") {
        if (sourceId === "1") return;
        setNodes((nds) => {
          return nds.filter((node) => node.id !== sourceId);
        });
        setEdges((eds) =>
          eds.filter(
            (edge) => edge.source !== sourceId && edge.target !== sourceId
          )
        );
        return;
      }

      if (type === "update" && updates) {
        setNodes((nds) =>
          nds.map((node) =>
            node.id === sourceId
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    ...updates,
                    onAddNode: handleNodeAction,
                  },
                }
              : node
          )
        );
        return;
      }

      // For adding new nodes, use functional update to access current nodes
      setNodes((currentNodes) => {
        const sourceNode = currentNodes.find((n) => n.id === sourceId);
        console.log("currentNodes", currentNodes);
        const newId = Date.now().toString();
        const newNode: ReactFlowNode = {
          id: newId,
          type: type === "conditional" ? "conditional" : "automationStep",
          data:
            type === "conditional"
              ? {
                  conditionType: "elementExists",
                  selector: "",
                  onAddNode: handleNodeAction,
                }
              : {
                  step: {
                    id: newId,
                    type: type as AutomationStep["type"],
                    description: `${
                      stepTypes.find((s) => s.value === type)?.label || "Step"
                    } step`,
                    selector: type === "navigate" ? "" : "body",
                    value: type === "navigate" ? "https://" : "",
                  },
                  onAddNode: handleNodeAction,
                },
          position: {
            x: sourceNode ? sourceNode.position.x : 250,
            y: sourceNode
              ? sourceNode.position.y + 300
              : currentNodes.length * 150 + 50,
          },
        };

        return [...currentNodes, newNode];
      });

      // Add edges
      const newId = Date.now().toString();
      if (type === "conditional") {
        setEdges((eds) => [
          ...eds,
          { id: `e${sourceId}-${newId}`, source: sourceId, target: newId },
        ]);
      } else {
        // Access current nodes inside setNodes, then use that info in setEdges
        setNodes((currentNodes) => {
          const sourceNode = currentNodes.find((n) => n.id === sourceId);
          console.log("sourceNode", sourceNode);

          if (sourceNode.type === "conditional") {
            setEdges((currentEdges) => {
              const outgoingEdges = currentEdges.filter(
                (e) => e.source === sourceId
              );

              if (outgoingEdges.length >= 2) {
                alert(
                  "Cannot add more than two outgoing edges from a conditional node"
                );
                return currentEdges; // Return unchanged
              }

              const handle = outgoingEdges.length === 0 ? "then" : "else";
              return [
                ...currentEdges,
                {
                  id: `e${sourceId}-${newId}-${handle}`,
                  source: sourceId,
                  target: newId,
                  sourceHandle: handle,
                },
              ];
            });
          } else {
            setEdges((eds) => [
              ...eds,
              { id: `e${sourceId}-${newId}`, source: sourceId, target: newId },
            ]);
          }

          return currentNodes; // Return unchanged since we're just reading
        });
      }
    },
    [nodes, edges, setNodes, setEdges] // Include dependencies
  );

  const handleSave = () => {
    const automationData: Automation = {
      id: automation?.id || Date.now().toString(),
      name,
      description,
      status: "idle",
      nodes: nodes.map(({ id, type, data, position }) => ({
        id,
        type,
        data: {
          step: data.step,
          conditionType: data.conditionType,
          selector: data.selector,
          expectedValue: data.expectedValue,
        },
        position,
      })) as Node[],
      edges: edges as Edge[],
      steps: nodes
        .map((node) => node.data.step)
        .filter((step) => step !== undefined) as AutomationStep[],
      schedule:
        schedule.type === "manual"
          ? { type: "manual" }
          : schedule.type === "fixed"
            ? { type: "fixed", value: schedule.value }
            : {
                type: "interval",
                interval: schedule.interval,
                unit: schedule.unit,
              },
      linkedCredentials: nodes
        .filter((node) => node.data.step?.credentialId)
        .map((node) => node.data.step!.credentialId!)
        .filter((id, index, arr) => arr.indexOf(id) === index),
      lastRun: automation?.lastRun,
    };
    onSave(automationData);
  };

  const openBrowser = async () => {
    try {
      await (window as any).electronAPI.openBrowser("https://google.com");
      setIsBrowserOpen(true);
    } catch (err) {
      console.error("Failed to open browser", err);
    }
  };

  const closeBrowser = async () => {
    try {
      await (window as any).electronAPI.closeBrowser();
      setIsBrowserOpen(false);
      setIsAutomationRunning(false);
      setCurrentNodeId(null);
    } catch (err) {
      console.error("Failed to close browser", err);
    }
  };

  const executeNode = async (node: ReactFlowNode) => {
    setCurrentNodeId(node.id);
    if (node.type === "automationStep" && node.data.step) {
      return await (window as any).electronAPI.runStep(node.data.step);
    } else if (node.type === "conditional") {
      const conditionResult = await (window as any).electronAPI.runConditional({
        conditionType: node.data.conditionType,
        selector: node.data.selector,
        expectedValue: node.data.expectedValue,
      });
      console.log("Condition result:", conditionResult);
      return { conditionResult };
    }
  };

  const runAutomation = async () => {
    if (nodes.length === 0) {
      alert("No nodes to execute");
      return;
    }

    if (!isBrowserOpen) {
      await openBrowser();
    }

    setIsAutomationRunning(true);
    setCurrentNodeId(null);

    try {
      const visited = new Set<string>();
      const executeGraph = async (nodeId: string) => {
        if (visited.has(nodeId)) return;
        visited.add(nodeId);

        const node = nodes.find((n) => n.id === nodeId) as
          | ReactFlowNode
          | undefined;
        if (!node) return;

        const result = await executeNode(node);
        let nextNodes: string[] = [];

        console.log("Execution result:", result);

        if (
          node.type === "conditional" &&
          result.conditionResult !== undefined
        ) {
          const branch = result.conditionResult ? "then" : "else";
          console.log("Taking branch:", branch);
          console.log("Node ID:", nodeId);
          console.log("Edges:", edges);
          nextNodes = edges
            .filter((e) => e.source === nodeId && e.sourceHandle === branch)
            .map((e) => e.target);
          console.log("Next nodes:", nextNodes);
        } else {
          nextNodes = edges
            .filter((e) => e.source === nodeId)
            .map((e) => e.target);
          console.log("else Next nodes:", nextNodes);
        }

        for (const nextNodeId of nextNodes) {
          await executeGraph(nextNodeId);
        }
      };

      await executeGraph("1"); // Start with the default navigation node
      alert("Automation completed successfully!");
    } catch (error) {
      console.error("Automation failed:", error);
      alert("Automation failed. Check console for details.");
    } finally {
      setIsAutomationRunning(false);
      setCurrentNodeId(null);
    }
  };

  const pauseAutomation = () => {
    setIsAutomationRunning(false);
  };

  const stopAutomation = () => {
    setIsAutomationRunning(false);
    setCurrentNodeId(null);
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onCancel}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold">
                {automation ? "Edit Automation" : "Create Automation"}
              </h1>
              <p className="text-sm text-muted-foreground">
                Design and test your browser automation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Automation Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Automation Name</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter automation name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what this automation does"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Schedule</Label>
                    <Select
                      value={schedule.type}
                      onValueChange={(value) =>
                        setSchedule((prev) => ({
                          ...prev,
                          type: value as typeof schedule.type,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual only</SelectItem>
                        <SelectItem value="interval">
                          Repeat interval
                        </SelectItem>
                        <SelectItem value="fixed">Fixed time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {schedule.type === "interval" && (
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={schedule.interval}
                        onChange={(e) =>
                          setSchedule((prev) => ({
                            ...prev,
                            interval: parseInt(e.target.value) || 1,
                          }))
                        }
                        className="flex-1"
                        min="1"
                      />
                      <Select
                        value={schedule.unit}
                        onValueChange={(value) =>
                          setSchedule((prev) => ({
                            ...prev,
                            unit: value as typeof schedule.unit,
                          }))
                        }
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minutes">min</SelectItem>
                          <SelectItem value="hours">hrs</SelectItem>
                          <SelectItem value="days">days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {schedule.type === "fixed" && (
                    <Input
                      type="time"
                      value={schedule.value}
                      onChange={(e) =>
                        setSchedule((prev) => ({
                          ...prev,
                          value: e.target.value,
                        }))
                      }
                    />
                  )}
                </div>
              </DialogContent>
            </Dialog>
            {!isBrowserOpen ? (
              <Button variant="outline" onClick={openBrowser}>
                <Globe className="h-4 w-4 mr-2" />
                Open Browser
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={closeBrowser}>
                  <Square className="h-4 w-4 mr-2" />
                  Close Browser
                </Button>
                {!isAutomationRunning ? (
                  <Button
                    variant="default"
                    onClick={runAutomation}
                    disabled={nodes.length === 0}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Run Automation
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={pauseAutomation}>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                    <Button variant="destructive" onClick={stopAutomation}>
                      <Square className="h-4 w-4 mr-2" />
                      Stop
                    </Button>
                  </>
                )}
              </>
            )}
            <Button onClick={handleSave} disabled={!name.trim()}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </header>
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}
