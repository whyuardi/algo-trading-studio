"use client";

import { useCallback, useRef, useState } from "react";
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
  type NodeTypes,
  type OnConnect,
  type NodeProps,
  Handle,
  Position,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  GitBranch,
  Zap,
  Target,
  Shield,
  Clock,
  BarChart3,
  ArrowRight,
  Play,
  Rocket,
  Save,
  Download,
  Settings,
  ChevronDown,
  X,
  Menu,
} from "lucide-react";

// ─── CUSTOM NODES ───

function IndicatorNode({ data, selected }: NodeProps) {
  const colors: Record<string, string> = {
    RSI: "#FF6B6B",
    MACD: "#4ECDC4",
    "Moving Average": "#FFD93D",
    "Bollinger Bands": "#6C5CE7",
    Volume: "#00FFAA",
    "Stochastic": "#FF8A5C",
  };
  const color = colors[data.indicator as string] || "#00FFAA";

  return (
    <div
      className={`bg-[#111118] border ${selected ? "border-[#00FFAA]" : "border-[#1A1A24]"} min-w-[180px] shadow-lg`}
    >
      <div className="px-3 py-1.5 border-b border-[#1A1A24] flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
        <span className="text-[0.6rem] font-mono uppercase tracking-wider text-[#4A4845]">
          Indicator
        </span>
      </div>
      <div className="px-3 py-2">
        <p className="text-sm font-medium text-[#E8E6E3]">{data.indicator as string}</p>
        <p className="text-[0.65rem] font-mono text-[#4A4845] mt-0.5">
          {data.params as string}
        </p>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-[#00FFAA] !border-2 !border-[#0A0A0F] !-bottom-[5px]"
      />
    </div>
  );
}

function ConditionNode({ data, selected }: NodeProps) {
  const icons: Record<string, React.ReactNode> = {
    ">": <TrendingUp className="w-3.5 h-3.5" />,
    "<": <TrendingDown className="w-3.5 h-3.5" />,
    ">=": <TrendingUp className="w-3.5 h-3.5" />,
    "<=": <TrendingDown className="w-3.5 h-3.5" />,
    "crosses_above": <ArrowRight className="w-3.5 h-3.5 rotate-[-45deg]" />,
    "crosses_below": <ArrowRight className="w-3.5 h-3.5 rotate-[45deg]" />,
  };

  return (
    <div className={`bg-[#111118] border ${selected ? "border-[#00FFAA]" : "border-[#1A1A24]"} min-w-[160px] shadow-lg`}>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-[#FFD93D] !border-2 !border-[#0A0A0F] !-top-[5px]"
      />
      <div className="px-3 py-1.5 border-b border-[#1A1A24] flex items-center gap-2">
        <GitBranch className="w-3 h-3 text-[#FFD93D]" />
        <span className="text-[0.6rem] font-mono uppercase tracking-wider text-[#4A4845]">
          Condition
        </span>
      </div>
      <div className="px-3 py-2 flex items-center gap-2">
        {icons[data.condition as string] || <Zap className="w-3.5 h-3.5 text-[#FFD93D]" />}
        <span className="text-sm font-medium text-[#E8E6E3]">
          {data.label as string}
        </span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-[#FFD93D] !border-2 !border-[#0A0A0F] !-bottom-[5px]"
      />
    </div>
  );
}

function ActionNode({ data, selected }: NodeProps) {
  const isBuy = data.action === "BUY";
  return (
    <div className={`bg-[#111118] border ${selected ? "border-[#00FFAA]" : "border-[#1A1A24]"} min-w-[160px] shadow-lg`}>
      <Handle
        type="target"
        position={Position.Top}
        className={`!w-2.5 !h-2.5 !border-2 !border-[#0A0A0F] !-top-[5px] ${isBuy ? "!bg-[#00FFAA]" : "!bg-[#FF6B6B]"}`}
      />
      <div className="px-3 py-1.5 border-b border-[#1A1A24] flex items-center gap-2">
        {isBuy ? (
          <TrendingUp className="w-3 h-3 text-[#00FFAA]" />
        ) : (
          <TrendingDown className="w-3 h-3 text-[#FF6B6B]" />
        )}
        <span className="text-[0.6rem] font-mono uppercase tracking-wider text-[#4A4845]">
          Action
        </span>
      </div>
      <div className="px-3 py-2">
        <p className={`text-sm font-bold ${isBuy ? "text-[#00FFAA]" : "text-[#FF6B6B]"}`}>
          {data.action as string}
        </p>
        <p className="text-[0.65rem] font-mono text-[#4A4845] mt-0.5">
          {data.params as string}
        </p>
      </div>
    </div>
  );
}

function FilterNode({ data, selected }: NodeProps) {
  return (
    <div className={`bg-[#111118] border ${selected ? "border-[#00FFAA]" : "border-[#1A1A24]"} min-w-[160px] shadow-lg`}>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-[#6C5CE7] !border-2 !border-[#0A0A0F] !-top-[5px]"
      />
      <div className="px-3 py-1.5 border-b border-[#1A1A24] flex items-center gap-2">
        <Clock className="w-3 h-3 text-[#6C5CE7]" />
        <span className="text-[0.6rem] font-mono uppercase tracking-wider text-[#4A4845]">
          Filter
        </span>
      </div>
      <div className="px-3 py-2">
        <p className="text-sm font-medium text-[#E8E6E3]">{data.label as string}</p>
        <p className="text-[0.65rem] font-mono text-[#4A4845] mt-0.5">
          {data.params as string}
        </p>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-[#6C5CE7] !border-2 !border-[#0A0A0F] !-bottom-[5px]"
      />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  indicator: IndicatorNode,
  condition: ConditionNode,
  action: ActionNode,
  filter: FilterNode,
};

// ─── DEFAULT STRATEGY ───

const defaultNodes: Node[] = [
  {
    id: "rsi",
    type: "indicator",
    position: { x: 250, y: 0 },
    data: { indicator: "RSI", params: "period: 14" },
  },
  {
    id: "cond-buy",
    type: "condition",
    position: { x: 260, y: 150 },
    data: { condition: "<", label: "RSI < 30", indicator: "RSI", value: 30 },
  },
  {
    id: "cond-sell",
    type: "condition",
    position: { x: 460, y: 150 },
    data: { condition: ">", label: "RSI > 70", indicator: "RSI", value: 70 },
  },
  {
    id: "buy",
    type: "action",
    position: { x: 260, y: 300 },
    data: { action: "BUY", params: "size: 2% portfolio" },
  },
  {
    id: "sell",
    type: "action",
    position: { x: 460, y: 300 },
    data: { action: "SELL", params: "size: 100% position" },
  },
  {
    id: "stop-loss",
    type: "action",
    position: { x: 660, y: 300 },
    data: { action: "STOP_LOSS", params: "trigger: -5%" },
  },
  {
    id: "time-filter",
    type: "filter",
    position: { x: 60, y: 150 },
    data: { label: "Trading Hours", params: "09:00 - 16:00 UTC" },
  },
];

const defaultEdges: Edge[] = [
  { id: "e-rsi-buy", source: "rsi", target: "cond-buy", animated: true, style: { stroke: "#00FFAA" } },
  { id: "e-rsi-sell", source: "rsi", target: "cond-sell", animated: true, style: { stroke: "#FF6B6B" } },
  { id: "e-cond-buy", source: "cond-buy", target: "buy", style: { stroke: "#00FFAA" } },
  { id: "e-cond-sell", source: "cond-sell", target: "sell", style: { stroke: "#FF6B6B" } },
  { id: "e-time-rsi", source: "time-filter", target: "rsi", style: { stroke: "#6C5CE7" } },
  { id: "e-sell-sl", source: "sell", target: "stop-loss", style: { stroke: "#FF8A5C" }, label: "on fill" },
];

// ─── NODE PALETTE ───

const palette = [
  {
    category: "Indicators",
    items: [
      { type: "indicator", data: { indicator: "RSI", params: "period: 14" }, label: "RSI" },
      { type: "indicator", data: { indicator: "MACD", params: "12/26/9" }, label: "MACD" },
      { type: "indicator", data: { indicator: "Moving Average", params: "SMA 50" }, label: "MA" },
      { type: "indicator", data: { indicator: "Bollinger Bands", params: "20, 2σ" }, label: "BB" },
      { type: "indicator", data: { indicator: "Volume", params: "SMA 20" }, label: "Volume" },
    ],
  },
  {
    category: "Conditions",
    items: [
      { type: "condition", data: { condition: ">", label: "Greater Than" }, label: ">" },
      { type: "condition", data: { condition: "<", label: "Less Than" }, label: "<" },
      { type: "condition", data: { condition: "crosses_above", label: "Crosses Above" }, label: "↑" },
      { type: "condition", data: { condition: "crosses_below", label: "Crosses Below" }, label: "↓" },
    ],
  },
  {
    category: "Actions",
    items: [
      { type: "action", data: { action: "BUY", params: "size: 2%" }, label: "Buy" },
      { type: "action", data: { action: "SELL", params: "size: 100%" }, label: "Sell" },
      { type: "action", data: { action: "STOP_LOSS", params: "trigger: -5%" }, label: "Stop Loss" },
      { type: "action", data: { action: "TAKE_PROFIT", params: "trigger: +10%" }, label: "Take Profit" },
    ],
  },
  {
    category: "Filters",
    items: [
      { type: "filter", data: { label: "Trading Hours", params: "09:00 - 16:00 UTC" }, label: "Time" },
      { type: "filter", data: { label: "Price Range", params: "$100 - $50,000" }, label: "Price" },
    ],
  },
];

// ─── BACKTEST RESULTS ───

const mockBacktest = {
  totalReturn: "+142.7%",
  sharpeRatio: "2.31",
  maxDrawdown: "-18.4%",
  winRate: "67.3%",
  totalTrades: 247,
  profitFactor: "3.12",
  avgTrade: "+0.58%",
  sharpe: [1.8, 2.1, 2.3, 2.0, 2.31],
  returns: [12, 28, 45, 67, 89, 112, 134, 142],
};

// ─── MAIN PAGE ───

export default function BuilderPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges);
  const [showBacktest, setShowBacktest] = useState(false);
  const [showDeploy, setShowDeploy] = useState(false);
  const [running, setRunning] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge({ ...connection, animated: false, style: { stroke: "#1A1A24" } }, eds)
      );
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow/type");
      const data = JSON.parse(event.dataTransfer.getData("application/reactflow/data"));
      if (!type || !reactFlowWrapper.current) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = {
        x: event.clientX - bounds.left - 90,
        y: event.clientY - bounds.top - 20,
      };

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data,
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  const handleRunBacktest = () => {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      setShowBacktest(true);
    }, 2000);
  };

  const handleDeploy = () => {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      setDeployed(true);
      setShowDeploy(true);
    }, 3000);
  };

  return (
    <div className="h-screen flex flex-col bg-[#0A0A0F]">
      {/* ─── TOOLBAR ─── */}
      <header className="h-12 border-b border-[#1A1A24] flex items-center justify-between px-4 bg-[#0A0A0F] shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden text-[#4A4845] hover:text-[#E8E6E3] transition-colors p-1"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
          <a href="/" className="flex items-center gap-2 text-[#4A4845] hover:text-[#E8E6E3] transition-colors">
            <Zap className="w-4 h-4" />
            <span className="font-mono text-xs">ALGO STUDIO</span>
          </a>
          <div className="w-px h-5 bg-[#1A1A24] hidden sm:block" />
          <span className="font-mono text-xs text-[#4A4845] hidden sm:inline">RSI Momentum Strategy</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-[0.65rem] font-mono uppercase tracking-wider text-[#4A4845] border border-[#1A1A24] hover:border-[#2A2A35] hover:text-[#E8E6E3] transition-all">
            <Save className="w-3 h-3" />
            <span className="hidden sm:inline">Save</span>
          </button>
          <button
            onClick={handleRunBacktest}
            disabled={running}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[0.65rem] font-mono uppercase tracking-wider text-[#0A0A0F] bg-[#00FFAA] hover:bg-[#00CC88] disabled:opacity-50 transition-all"
          >
            {running ? (
              <>
                <div className="w-3 h-3 border-2 border-[#0A0A0F] border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">Running...</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3" />
                <span className="hidden sm:inline">Backtest</span>
              </>
            )}
          </button>
          <button
            onClick={handleDeploy}
            disabled={running}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[0.65rem] font-mono uppercase tracking-wider text-[#00FFAA] border border-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A0A0F] disabled:opacity-50 transition-all"
          >
            <Rocket className="w-3 h-3" />
            <span className="hidden sm:inline">Deploy</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ─── SIDEBAR PALETTE ─── */}
        <aside className={`
          w-56 border-r border-[#1A1A24] overflow-y-auto bg-[#0A0A0F] shrink-0
          hidden md:block
          ${sidebarOpen ? '!block fixed inset-y-12 left-0 z-40' : ''}
        `}>
          <div className="p-3 border-b border-[#1A1A24]">
            <p className="text-[0.6rem] font-mono uppercase tracking-wider text-[#4A4845]">
              Drag to canvas
            </p>
          </div>
          {palette.map((cat) => (
            <div key={cat.category} className="border-b border-[#1A1A24]">
              <div className="px-3 py-2">
                <p className="text-[0.55rem] font-mono uppercase tracking-[0.15em] text-[#4A4845]">
                  {cat.category}
                </p>
              </div>
              <div className="px-2 pb-2 flex flex-wrap gap-1">
                {cat.items.map((item) => (
                  <div
                    key={item.label}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("application/reactflow/type", item.type);
                      e.dataTransfer.setData("application/reactflow/data", JSON.stringify(item.data));
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    className="px-2.5 py-1.5 text-xs font-mono text-[#E8E6E3] bg-[#111118] border border-[#1A1A24] cursor-grab hover:border-[#00FFAA] hover:text-[#00FFAA] transition-colors active:cursor-grabbing"
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Strategy Info */}
          <div className="p-3">
            <p className="text-[0.55rem] font-mono uppercase tracking-[0.15em] text-[#4A4845] mb-2">
              Strategy Info
            </p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[0.65rem] font-mono">
                <span className="text-[#4A4845]">Nodes</span>
                <span className="text-[#E8E6E3]">{nodes.length}</span>
              </div>
              <div className="flex justify-between text-[0.65rem] font-mono">
                <span className="text-[#4A4845]">Connections</span>
                <span className="text-[#E8E6E3]">{edges.length}</span>
              </div>
              <div className="flex justify-between text-[0.65rem] font-mono">
                <span className="text-[#4A4845]">Status</span>
                <span className="text-[#00FFAA]">Ready</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ─── CANVAS ─── */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            fitView
            className="bg-[#0A0A0F]"
            defaultEdgeOptions={{ style: { stroke: "#1A1A24", strokeWidth: 2 } }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1A1A24" />
            <Controls
              className="!bg-[#111118] !border-[#1A1A24] !shadow-none [&>button]:!bg-[#111118] [&>button]:!border-[#1A1A24] [&>button]:!text-[#4A4845] [&>button:hover]:!bg-[#1A1A24] [&>button]:!w-7 [&>button]:!h-7"
            />
            <MiniMap
              nodeColor="#1A1A24"
              maskColor="rgba(10,10,15,0.8)"
              className="!bg-[#111118] !border-[#1A1A24]"
            />
          </ReactFlow>

          {/* Canvas overlay label */}
          <div className="absolute bottom-4 left-4 font-mono text-[0.55rem] text-[#4A4845] tracking-wider">
            STRATEGY CANVAS — DRAG NODES TO BUILD
          </div>
        </div>

        {/* ─── BACKTEST PANEL ─── */}
        {showBacktest && (
          <div className="w-full sm:w-80 border-l border-[#1A1A24] bg-[#0A0A0F] overflow-y-auto shrink-0 animate-in slide-in-from-right fixed inset-y-12 left-0 z-50 md:relative md:inset-auto">
            <div className="p-4 border-b border-[#1A1A24] flex items-center justify-between">
              <h3 className="font-mono text-xs uppercase tracking-wider text-[#E8E6E3]">
                Backtest Results
              </h3>
              <button onClick={() => setShowBacktest(false)} className="text-[#4A4845] hover:text-[#E8E6E3]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Return Chart (simple bar visualization) */}
            <div className="p-4 border-b border-[#1A1A24]">
              <p className="text-[0.55rem] font-mono uppercase tracking-[0.15em] text-[#4A4845] mb-3">
                Cumulative Return
              </p>
              <div className="h-32 flex items-end gap-1">
                {mockBacktest.returns.map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-[#00FFAA] transition-all duration-500"
                      style={{ height: `${(val / 142) * 100}%`, opacity: 0.3 + (i / 7) * 0.7 }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[0.5rem] font-mono text-[#4A4845]">Jan</span>
                <span className="text-[0.5rem] font-mono text-[#4A4845]">Jun</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-px bg-[#1A1A24]">
              {[
                { label: "Total Return", value: mockBacktest.totalReturn, color: "text-[#00FFAA]" },
                { label: "Sharpe Ratio", value: mockBacktest.sharpeRatio, color: "text-[#00FFAA]" },
                { label: "Max Drawdown", value: mockBacktest.maxDrawdown, color: "text-[#FF6B6B]" },
                { label: "Win Rate", value: mockBacktest.winRate, color: "text-[#00FFAA]" },
                { label: "Total Trades", value: mockBacktest.totalTrades.toString(), color: "text-[#E8E6E3]" },
                { label: "Profit Factor", value: mockBacktest.profitFactor, color: "text-[#00FFAA]" },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#0A0A0F] p-3">
                  <p className="text-[0.5rem] font-mono uppercase tracking-[0.15em] text-[#4A4845]">
                    {stat.label}
                  </p>
                  <p className={`text-lg font-mono font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Deploy CTA */}
            <div className="p-4">
              <button
                onClick={handleDeploy}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-[#0A0A0F] bg-[#00FFAA] hover:bg-[#00CC88] transition-colors"
              >
                <Rocket className="w-3.5 h-3.5" />
                Deploy Strategy
              </button>
            </div>
          </div>
        )}

        {/* ─── DEPLOY PANEL ─── */}
        {showDeploy && (
          <div className="w-full sm:w-80 border-l border-[#1A1A24] bg-[#0A0A0F] overflow-y-auto shrink-0 animate-in slide-in-from-right fixed inset-y-12 left-0 z-50 md:relative md:inset-auto">
            <div className="p-4 border-b border-[#1A1A24] flex items-center justify-between">
              <h3 className="font-mono text-xs uppercase tracking-wider text-[#E8E6E3]">
                Deploy Contract
              </h3>
              <button onClick={() => setShowDeploy(false)} className="text-[#4A4845] hover:text-[#E8E6E3]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {deployed ? (
              <div className="p-4 space-y-4">
                <div className="bg-[#111118] border border-[#00FFAA]/30 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-[#00FFAA] animate-pulse" />
                    <span className="text-xs font-mono text-[#00FFAA]">DEPLOYED</span>
                  </div>
                  <p className="text-[0.65rem] font-mono text-[#4A4845]">Contract Address</p>
                  <p className="text-xs font-mono text-[#E8E6E3] mt-0.5 break-all">
                    0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
                  </p>
                  <div className="mt-3 flex gap-2">
                    <a
                      href="#"
                      className="flex-1 text-center px-2 py-1.5 text-[0.6rem] font-mono text-[#00FFAA] border border-[#00FFAA]/30 hover:bg-[#00FFAA]/10 transition-colors"
                    >
                      View on Explorer
                    </a>
                    <a
                      href="#"
                      className="flex-1 text-center px-2 py-1.5 text-[0.6rem] font-mono text-[#E8E6E3] border border-[#1A1A24] hover:border-[#2A2A35] transition-colors"
                    >
                      Verify Source
                    </a>
                  </div>
                </div>

                {/* Deployment Log */}
                <div className="bg-[#111118] border border-[#1A1A24] p-3">
                  <p className="text-[0.55rem] font-mono uppercase tracking-[0.15em] text-[#4A4845] mb-2">
                    Deploy Log
                  </p>
                  <div className="space-y-1 font-mono text-[0.6rem]">
                    <p className="text-[#4A4845]">✓ Strategy compiled (2.3s)</p>
                    <p className="text-[#4A4845]">✓ Gas estimated: 0.0042 ETH</p>
                    <p className="text-[#4A4845]">✓ Transaction submitted</p>
                    <p className="text-[#4A4845]">✓ Confirmed in block #18,234,567</p>
                    <p className="text-[#00FFAA]">✓ Contract deployed successfully</p>
                  </div>
                </div>

                {/* Chain Selection */}
                <div className="bg-[#111118] border border-[#1A1A24] p-3">
                  <p className="text-[0.55rem] font-mono uppercase tracking-[0.15em] text-[#4A4845] mb-2">
                    Supported Chains
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {["Ethereum", "Arbitrum", "Optimism", "Base", "Polygon", "BSC"].map((chain) => (
                      <span
                        key={chain}
                        className="px-2 py-1 text-[0.55rem] font-mono text-[#4A4845] border border-[#1A1A24]"
                      >
                        {chain}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                <p className="text-xs text-[#4A4845]">
                  Deploy your strategy as a smart contract on-chain.
                </p>

                {/* Network Selection */}
                <div>
                  <p className="text-[0.55rem] font-mono uppercase tracking-[0.15em] text-[#4A4845] mb-2">
                    Target Network
                  </p>
                  <div className="space-y-1.5">
                    {["Ethereum Mainnet", "Arbitrum One", "Optimism", "Base", "Polygon"].map(
                      (network, i) => (
                        <label
                          key={network}
                          className="flex items-center gap-2 px-3 py-2 bg-[#111118] border border-[#1A1A24] cursor-pointer hover:border-[#2A2A35] transition-colors"
                        >
                          <input
                            type="radio"
                            name="network"
                            defaultChecked={i === 1}
                            className="accent-[#00FFAA]"
                          />
                          <span className="text-xs font-mono text-[#E8E6E3]">{network}</span>
                        </label>
                      )
                    )}
                  </div>
                </div>

                {/* Gas Estimate */}
                <div className="bg-[#111118] border border-[#1A1A24] p-3">
                  <div className="flex justify-between text-[0.65rem] font-mono">
                    <span className="text-[#4A4845]">Est. Gas</span>
                    <span className="text-[#E8E6E3]">0.0042 ETH</span>
                  </div>
                  <div className="flex justify-between text-[0.65rem] font-mono mt-1">
                    <span className="text-[#4A4845]">Est. Cost</span>
                    <span className="text-[#00FFAA]">~$14.28</span>
                  </div>
                </div>

                <button
                  onClick={handleDeploy}
                  disabled={running}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-[#0A0A0F] bg-[#00FFAA] hover:bg-[#00CC88] disabled:opacity-50 transition-colors"
                >
                  {running ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#0A0A0F] border-t-transparent rounded-full animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-3.5 h-3.5" />
                      Deploy Now
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
