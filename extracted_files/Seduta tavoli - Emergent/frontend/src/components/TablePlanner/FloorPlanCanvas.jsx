import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Users, RotateCcw } from 'lucide-react';

const FloorPlanCanvas = ({ 
  tables, 
  guests, 
  venue, 
  onTableUpdate, 
  onTableSelect, 
  selectedTable,
  viewMode = 'design'
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [draggedTable, setDraggedTable] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(0.8);

  // Draw table on canvas
  const drawTable = useCallback((ctx, table, isSelected = false, isDragged = false) => {
    const { x, y, shape, seats, name, assignedGuests } = table;
    
    // Table dimensions based on seats
    const baseSize = Math.max(60, seats * 8);
    const tableSize = shape === 'rectangular' ? 
      { width: baseSize * 1.5, height: baseSize * 0.8 } : 
      { width: baseSize, height: baseSize };
    
    // Shadow for depth
    if (!isDragged) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    }
    
    // Table color based on occupancy
    const occupancyRate = assignedGuests.length / seats;
    let fillColor = '#ffffff';
    if (occupancyRate === 1) {
      fillColor = '#dcfce7'; // Full - green tint
    } else if (occupancyRate > 0.5) {
      fillColor = '#fef3c7'; // Partial - yellow tint
    } else if (occupancyRate > 0) {
      fillColor = '#fee2e2'; // Some guests - red tint
    }
    
    // Border color
    const borderColor = isSelected ? '#e11d48' : '#d1d5db';
    const borderWidth = isSelected ? 3 : 1;
    
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    
    // Draw table shape
    ctx.beginPath();
    if (shape === 'round') {
      ctx.arc(x, y, tableSize.width / 2, 0, 2 * Math.PI);
    } else {
      const halfWidth = tableSize.width / 2;
      const halfHeight = tableSize.height / 2;
      ctx.roundRect(x - halfWidth, y - halfHeight, tableSize.width, tableSize.height, 8);
    }
    ctx.fill();
    ctx.stroke();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    
    // Draw table label
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 14px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(name, x, y - 5);
    
    // Draw occupancy info
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.fillText(`${assignedGuests.length}/${seats}`, x, y + 12);
    
    // Draw seats as small circles around the table
    if (viewMode === 'design') {
      const seatRadius = 8;
      const tableRadius = tableSize.width / 2;
      
      for (let i = 0; i < seats; i++) {
        const angle = (i * 2 * Math.PI) / seats - Math.PI / 2;
        const seatX = x + Math.cos(angle) * (tableRadius + 20);
        const seatY = y + Math.sin(angle) * (tableRadius + 20);
        
        const isOccupied = i < assignedGuests.length;
        
        ctx.beginPath();
        ctx.arc(seatX, seatY, seatRadius, 0, 2 * Math.PI);
        ctx.fillStyle = isOccupied ? '#10b981' : '#f3f4f6';
        ctx.fill();
        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw guest initial if occupied
        if (isOccupied) {
          const guest = guests.find(g => g.id === assignedGuests[i]);
          if (guest) {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px Inter, system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(guest.name.charAt(0).toUpperCase(), seatX, seatY + 3);
          }
        }
      }
    }
  }, [guests, viewMode]);

  // Draw venue elements (dance floor, stage, etc.)
  const drawVenueElements = useCallback((ctx) => {
    venue.elements?.forEach(element => {
      const { type, x, y, width, height, label } = element;
      
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      
      if (type === 'dancefloor') {
        ctx.fillStyle = '#fbbf24';
        ctx.strokeStyle = '#f59e0b';
      } else if (type === 'stage') {
        ctx.fillStyle = '#8b5cf6';
        ctx.strokeStyle = '#7c3aed';
      } else {
        ctx.fillStyle = '#6b7280';
        ctx.strokeStyle = '#4b5563';
      }
      
      ctx.lineWidth = 2;
      ctx.fillRect(x, y, width, height);
      ctx.strokeRect(x, y, width, height);
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      
      // Draw label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, x + width / 2, y + height / 2 + 4);
    });
  }, [venue]);

  // Main draw function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set high DPI scaling
    const dpr = window.devicePixelRatio || 1;
    ctx.scale(dpr * scale, dpr * scale);
    
    // Draw venue background
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, venue.width, venue.height);
    
    // Draw grid if in design mode
    if (viewMode === 'design') {
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      const gridSize = 40;
      
      for (let x = 0; x <= venue.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, venue.height);
        ctx.stroke();
      }
      
      for (let y = 0; y <= venue.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(venue.width, y);
        ctx.stroke();
      }
    }
    
    // Draw venue elements
    drawVenueElements(ctx);
    
    // Draw tables (non-dragged first)
    tables.forEach(table => {
      if (!draggedTable || table.id !== draggedTable.id) {
        drawTable(ctx, table, selectedTable?.id === table.id, false);
      }
    });
    
    // Draw dragged table last (on top)
    if (draggedTable) {
      drawTable(ctx, draggedTable, selectedTable?.id === draggedTable.id, true);
    }
  }, [tables, selectedTable, draggedTable, venue, scale, viewMode, drawTable, drawVenueElements]);

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    
    canvas.width = venue.width * scale * dpr;
    canvas.height = venue.height * scale * dpr;
    canvas.style.width = `${venue.width * scale}px`;
    canvas.style.height = `${venue.height * scale}px`;
    
    draw();
  }, [venue, scale, draw]);

  // Get table at position
  const getTableAt = (x, y) => {
    return tables.find(table => {
      const dx = x - table.x;
      const dy = y - table.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const tableSize = Math.max(60, table.seats * 8);
      return distance <= tableSize / 2;
    });
  };

  // Mouse event handlers
  const handleMouseDown = (e) => {
    if (viewMode !== 'design') return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    const table = getTableAt(x, y);
    if (table) {
      setDraggedTable(table);
      setDragOffset({ x: x - table.x, y: y - table.y });
      onTableSelect(table);
    } else {
      onTableSelect(null);
    }
  };

  const handleMouseMove = (e) => {
    if (!draggedTable || viewMode !== 'design') return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    const newX = Math.max(50, Math.min(venue.width - 50, x - dragOffset.x));
    const newY = Math.max(50, Math.min(venue.height - 50, y - dragOffset.y));
    
    setDraggedTable(prev => ({ ...prev, x: newX, y: newY }));
    draw();
  };

  const handleMouseUp = () => {
    if (draggedTable && viewMode === 'design') {
      onTableUpdate(draggedTable.id, { x: draggedTable.x, y: draggedTable.y });
    }
    setDraggedTable(null);
    setDragOffset({ x: 0, y: 0 });
  };

  // Reset view
  const resetView = () => {
    setScale(0.8);
  };

  return (
    <div className="relative h-full min-h-[600px]">
      {/* Canvas Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setScale(prev => Math.min(1.5, prev + 0.1))}
          className="bg-white shadow-md"
        >
          +
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setScale(prev => Math.max(0.3, prev - 0.1))}
          className="bg-white shadow-md"
        >
          -
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={resetView}
          className="bg-white shadow-md gap-1"
        >
          <RotateCcw className="w-3 h-3" />
        </Button>
      </div>

      {/* Legend */}
      {viewMode === 'design' && (
        <div className="absolute top-4 left-4 z-10">
          <Card className="p-3 bg-white/90 backdrop-blur-sm shadow-md">
            <h4 className="font-medium text-sm mb-2">Legenda</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-100 border rounded"></div>
                <span>Tavolo pieno</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-100 border rounded"></div>
                <span>Parzialmente occupato</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-100 border rounded"></div>
                <span>Pochi ospiti</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white border rounded"></div>
                <span>Tavolo vuoto</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className="overflow-auto bg-gray-100 rounded-lg"
        style={{ height: '600px' }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`border-0 ${viewMode === 'design' ? 'cursor-grab' : 'cursor-default'} ${draggedTable ? 'cursor-grabbing' : ''}`}
          style={{ display: 'block', margin: '20px auto' }}
        />
      </div>
    </div>
  );
};

export default FloorPlanCanvas;