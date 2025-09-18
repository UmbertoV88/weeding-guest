import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, RotateCcw } from 'lucide-react';
import { AdvancedTable, Venue, TableGuest, VenueElement } from '@/types/table';

interface FloorPlanCanvasProps {
  tables: AdvancedTable[];
  guests: TableGuest[];
  venue: Venue;
  onTableUpdate: (tableId: string, updates: Partial<AdvancedTable>) => void;
  onTableSelect: (table: AdvancedTable) => void;
  selectedTable: AdvancedTable | null;
  viewMode?: 'design' | 'preview';
}

const FloorPlanCanvas: React.FC<FloorPlanCanvasProps> = ({ 
  tables, 
  guests, 
  venue, 
  onTableUpdate, 
  onTableSelect, 
  selectedTable,
  viewMode = 'design'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggedTable, setDraggedTable] = useState<AdvancedTable | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(0.8);

  // Table data received and ready for rendering

  // Draw table on canvas
  const drawTable = useCallback((ctx: CanvasRenderingContext2D, table: AdvancedTable, isSelected = false, isDragged = false) => {
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
    if (shape === 'round') {
      const radius = tableSize.width / 2;
      ctx.beginPath();
      ctx.arc(x + radius, y + radius, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(x, y, tableSize.width, tableSize.height);
      ctx.strokeRect(x, y, tableSize.width, tableSize.height);
    }
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Draw table name
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(name, x + tableSize.width / 2, y + tableSize.height / 2 - 5);
    
    // Draw seat count
    ctx.font = '12px system-ui';
    ctx.fillStyle = '#6b7280';
    ctx.fillText(`${assignedGuests.length}/${seats} ospiti`, x + tableSize.width / 2, y + tableSize.height / 2 + 10);
    
    // Draw seat positions for round tables
    if (shape === 'round' && viewMode === 'design') {
      const radius = tableSize.width / 2;
      const centerX = x + radius;
      const centerY = y + radius;
      const seatRadius = 8;
      const seatDistance = radius + 20;
      
      for (let i = 0; i < seats; i++) {
        const angle = (2 * Math.PI * i) / seats - Math.PI / 2;
        const seatX = centerX + Math.cos(angle) * seatDistance;
        const seatY = centerY + Math.sin(angle) * seatDistance;
        
        // Seat color based on assignment
        const isAssigned = i < assignedGuests.length;
        ctx.fillStyle = isAssigned ? '#10b981' : '#e5e7eb';
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        ctx.arc(seatX, seatY, seatRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Seat number
        ctx.fillStyle = isAssigned ? '#ffffff' : '#6b7280';
        ctx.font = '10px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText((i + 1).toString(), seatX, seatY + 3);
      }
    }
  }, [viewMode]);

  // Draw venue elements
  const drawVenueElement = useCallback((ctx: CanvasRenderingContext2D, element: VenueElement) => {
    const { x, y, width, height, type, label } = element;
    
    // Element colors
    const colors: Record<VenueElement['type'], { fill: string; stroke: string }> = {
      dancefloor: { fill: '#fef3c7', stroke: '#f59e0b' },
      stage: { fill: '#ddd6fe', stroke: '#8b5cf6' },
      bar: { fill: '#fecaca', stroke: '#ef4444' },
      entrance: { fill: '#d1fae5', stroke: '#10b981' },
      kitchen: { fill: '#fed7d7', stroke: '#e53e3e' },
      bathroom: { fill: '#e0f2fe', stroke: '#0ea5e9' }
    };
    
    const color = colors[type];
    
    ctx.fillStyle = color.fill;
    ctx.strokeStyle = color.stroke;
    ctx.lineWidth = 2;
    
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);
    
    // Element label
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + width / 2, y + height / 2 + 4);
  }, []);

  // Draw canvas content
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw venue background
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, venue.width * scale, venue.height * scale);
    
    // Draw venue border
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, venue.width * scale, venue.height * scale);
    
    // Scale context for venue elements
    ctx.save();
    ctx.scale(scale, scale);
    
    // Draw venue elements
    venue.elements.forEach(element => {
      drawVenueElement(ctx, element);
    });
    
    // Draw tables
    console.log(`🎨 Disegnando ${tables.length} tavoli nel canvas`);
    tables.forEach(table => {
      const isSelected = selectedTable?.id === table.id;
      const isDragged = draggedTable?.id === table.id;
      console.log(`  📋 Disegnando tavolo: ${table.name} at (${table.x}, ${table.y})`);
      drawTable(ctx, table, isSelected, isDragged);
    });
    
    ctx.restore();
  }, [tables, venue, selectedTable, draggedTable, scale, drawTable, drawVenueElement]);

  // Handle mouse events for table interaction
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (viewMode === 'preview') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    // Find clicked table
    const clickedTable = tables.find(table => {
      const baseSize = Math.max(60, table.seats * 8);
      const tableSize = table.shape === 'rectangular' ? 
        { width: baseSize * 1.5, height: baseSize * 0.8 } : 
        { width: baseSize, height: baseSize };
      
      if (table.shape === 'round') {
        const centerX = table.x + tableSize.width / 2;
        const centerY = table.y + tableSize.height / 2;
        const radius = tableSize.width / 2;
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        return distance <= radius;
      } else {
        return x >= table.x && x <= table.x + tableSize.width &&
               y >= table.y && y <= table.y + tableSize.height;
      }
    });
    
    if (clickedTable) {
      setDraggedTable(clickedTable);
      setDragOffset({
        x: x - clickedTable.x,
        y: y - clickedTable.y
      });
      onTableSelect(clickedTable);
    }
  }, [tables, scale, onTableSelect, viewMode]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggedTable || viewMode === 'preview') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale - dragOffset.x;
    const y = (e.clientY - rect.top) / scale - dragOffset.y;
    
    // Update table position
    onTableUpdate(draggedTable.id, { x, y });
  }, [draggedTable, dragOffset, scale, onTableUpdate, viewMode]);

  const handleMouseUp = useCallback(() => {
    setDraggedTable(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  // Set up canvas and draw
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    if (!canvas || !container) return;
    
    // Set canvas size
    const containerWidth = container.clientWidth;
    const containerHeight = Math.min(600, container.clientHeight || 600);
    
    canvas.width = containerWidth;
    canvas.height = containerHeight;
    
    // Calculate scale to fit venue
    const scaleX = containerWidth / venue.width;
    const scaleY = containerHeight / venue.height;
    setScale(Math.min(scaleX, scaleY, 1));
    
    draw();
  }, [venue, draw]);

  // Redraw when dependencies change
  useEffect(() => {
    console.log('🔄 Canvas redraw triggered by draw function change');
    draw();
  }, [draw]);

  // Force redraw specifically when tables change
  useEffect(() => {
    console.log('🔄 Canvas force redraw due to tables change');
    draw();
  }, [tables, draw]);

  return (
    <div ref={containerRef} className="relative w-full h-96 lg:h-[600px] bg-gray-50">
      <canvas
        ref={canvasRef}
        className="cursor-move border border-gray-200 rounded-lg"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setScale(prev => Math.min(prev + 0.1, 2))}
          className="bg-white shadow-md"
        >
          +
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setScale(prev => Math.max(prev - 0.1, 0.3))}
          className="bg-white shadow-md"
        >
          -
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setScale(0.8)}
          className="bg-white shadow-md"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Table info panel */}
      {selectedTable && (
        <Card className="absolute bottom-4 left-4 p-4 bg-white shadow-lg border max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">{selectedTable.name}</h4>
              <Badge variant="outline">
                {selectedTable.assignedGuests.length}/{selectedTable.seats}
              </Badge>
            </div>
            <div className="text-sm text-gray-600">
              <div>Forma: {selectedTable.shape === 'round' ? 'Rotondo' : selectedTable.shape === 'rectangular' ? 'Rettangolare' : 'Quadrato'}</div>
              <div>Posti: {selectedTable.seats}</div>
              <div>Posizione: ({Math.round(selectedTable.x)}, {Math.round(selectedTable.y)})</div>
            </div>
            {selectedTable.assignedGuests.length > 0 && (
              <div className="pt-2 border-t">
                <div className="text-xs text-gray-500 mb-1">Ospiti assegnati:</div>
                <div className="space-y-1">
                  {selectedTable.assignedGuests.map(guestId => {
                    const guest = guests.find(g => g.id === guestId);
                    return guest ? (
                      <div key={guestId} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {guest.name}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default FloorPlanCanvas;