"use client";
import { useState, useEffect, useRef, useCallback } from "react";

interface TimelineItem {
  id: number;
  title: string;
  content: string;
  category: string;
  icon: React.ElementType;
  relatedIds: number[];
  status: "completed" | "in-progress" | "pending";
  energy: number;
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[];
}

export default function RadialOrbitalTimeline({
  timelineData,
}: RadialOrbitalTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const closeItem = useCallback(() => {
    setActiveNodeId(null);
    setAutoRotate(true);
    setExpandedItems({});
    setPulseEffect({});
  }, []);

  const openItem = useCallback((id: number) => {
    if (activeNodeId === id) return;
    setExpandedItems({ [id]: true });
    setActiveNodeId(id);
    setAutoRotate(false);

    const currentItem = timelineData.find((item) => item.id === id);
    const relatedItems = currentItem ? currentItem.relatedIds : [];
    const newPulseEffect: Record<number, boolean> = {};
    relatedItems.forEach((relId) => {
      newPulseEffect[relId] = true;
    });
    setPulseEffect(newPulseEffect);
  }, [activeNodeId, timelineData]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeNodeId !== null) {
        closeItem();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeNodeId, closeItem]);

  useEffect(() => {
    let rotationTimer: ReturnType<typeof setInterval>;

    if (autoRotate) {
      rotationTimer = setInterval(() => {
        setRotationAngle((prev) => {
          const newAngle = (prev + 0.3) % 360;
          return Number(newAngle.toFixed(3));
        });
      }, 50);
    }

    return () => {
      if (rotationTimer) {
        clearInterval(rotationTimer);
      }
    };
  }, [autoRotate]);

  const centerViewOnNode = (nodeId: number) => {
    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
    const totalNodes = timelineData.length;
    const targetAngle = (nodeIndex / totalNodes) * 360;
    setRotationAngle(270 - targetAngle);
  };

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radius = 250;
    const radian = (angle * Math.PI) / 180;

    const x = radius * Math.cos(radian);
    const y = radius * Math.sin(radian);

    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(
      0.4,
      Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2))
    );

    return { 
      x: Number(x.toFixed(1)), 
      y: Number(y.toFixed(1)), 
      angle: Number(angle.toFixed(1)), 
      zIndex, 
      opacity: Number(opacity.toFixed(2)) 
    };
  };

  const getRelatedItems = (itemId: number): number[] => {
    const currentItem = timelineData.find((item) => item.id === itemId);
    return currentItem ? currentItem.relatedIds : [];
  };

  const isRelatedToActive = (itemId: number): boolean => {
    if (!activeNodeId) return false;
    const relatedItems = getRelatedItems(activeNodeId);
    return relatedItems.includes(itemId);
  };

  const getStatusColor = (status: TimelineItem["status"]): string => {
    switch (status) {
      case "completed":
        return "#00e87b";
      case "in-progress":
        return "#3b82f6";
      case "pending":
        return "#888899";
      default:
        return "#888899";
    }
  };

  return (
    <div
      className="orbital-container"
      ref={containerRef}
      onClick={handleContainerClick}
      onMouseLeave={closeItem}
      onBlur={(e) => {
        if (!containerRef.current?.contains(e.relatedTarget as Node)) {
          closeItem();
        }
      }}
    >
      <div className="orbital-viewport">
        <div
          className="orbital-scene"
          ref={orbitRef}
        >
          {/* Central glowing orb */}
          <div className="orbital-center">
            <div className="orbital-center-ping" />
            <div className="orbital-center-ping delay" />
            <div className="orbital-center-core" />
          </div>

          {/* Orbit ring */}
          <div className="orbital-ring" />
          <div className="orbital-ring outer" />

          {/* Nodes */}
          {timelineData.map((item, index) => {
            const position = calculateNodePosition(index, timelineData.length);
            const isExpanded = expandedItems[item.id];
            const isRelated = isRelatedToActive(item.id);
            const isPulsing = pulseEffect[item.id];
            const Icon = item.icon;

            return (
              <button
                type="button"
                key={item.id}
                ref={(el) => { nodeRefs.current[item.id] = el; }}
                className="orbital-node"
                aria-label={`View details for ${item.title}`}
                aria-expanded={isExpanded}
                style={{
                  transform: `translate(${position.x}px, ${position.y}px)`,
                  zIndex: isExpanded ? 200 : position.zIndex,
                  opacity: isExpanded ? 1 : position.opacity,
                  background: 'none',
                  border: 'none',
                  padding: 0
                }}
                onMouseEnter={() => openItem(item.id)}
                onFocus={() => openItem(item.id)}
              >
                {/* Energy glow */}
                {(isPulsing || isExpanded) && (
                  <div
                    className="orbital-node-glow"
                    style={{
                      width: `${item.energy * 0.5 + 40}px`,
                      height: `${item.energy * 0.5 + 40}px`,
                      left: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                      top: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                      background: `radial-gradient(circle, ${getStatusColor(item.status)}33 0%, transparent 70%)`,
                    }}
                  />
                )}

                {/* Node circle */}
                <div
                  className={`orbital-node-circle ${
                    isExpanded
                      ? "expanded"
                      : isRelated
                      ? "related"
                      : ""
                  }`}
                  style={{
                    borderColor: isExpanded || isRelated
                      ? getStatusColor(item.status)
                      : "rgba(255,255,255,0.25)",
                    boxShadow: isExpanded
                      ? `0 0 20px ${getStatusColor(item.status)}40`
                      : "none",
                  }}
                >
                  <Icon size={16} />
                </div>

                {/* Label */}
                <div className={`orbital-node-label ${isExpanded ? "active" : ""}`}>
                  {item.title}
                </div>

                {/* Removed Expanded card from node */}
              </button>
            );
          })}
          {/* Centered Expanded Card */}
          {activeNodeId && (
            (() => {
              const activeItem = timelineData.find((i) => i.id === activeNodeId);
              if (!activeItem) return null;
              return (
                <div
                  className="orbital-card"
                  onMouseEnter={() => setAutoRotate(false)}
                >
                  <div className="orbital-card-connector" />
                  <div className="orbital-card-header">
                    <span
                      className="orbital-card-status"
                      style={{
                        background: getStatusColor(activeItem.status),
                        color: "#000",
                      }}
                    >
                      {activeItem.status === "completed"
                        ? "ACTIVE"
                        : activeItem.status === "in-progress"
                        ? "FEATURED"
                        : "COMING SOON"}
                    </span>
                    <span className="orbital-card-category">{activeItem.category}</span>
                  </div>
                  <h4 className="orbital-card-title">{activeItem.title}</h4>
                  <p className="orbital-card-content">{activeItem.content}</p>
                  <div className="orbital-card-energy">
                    <div className="orbital-card-energy-header">
                      <span>Capability</span>
                      <span className="orbital-card-energy-val">{activeItem.energy}%</span>
                    </div>
                    <div className="orbital-card-energy-bar">
                      <div
                        className="orbital-card-energy-fill"
                        style={{
                          width: `${activeItem.energy}%`,
                          background: `linear-gradient(90deg, ${getStatusColor(activeItem.status)}, #00e87b)`,
                        }}
                      />
                    </div>
                  </div>
                  {activeItem.relatedIds.length > 0 && (
                    <div className="orbital-card-related">
                      <span className="orbital-card-related-label">Connected Features</span>
                      <div className="orbital-card-related-list">
                        {activeItem.relatedIds.map((relatedId) => {
                          const relatedItem = timelineData.find((i) => i.id === relatedId);
                          return (
                            <button
                              key={relatedId}
                              className="orbital-card-related-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                openItem(relatedId);
                              }}
                            >
                              {relatedItem?.title} →
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
}
