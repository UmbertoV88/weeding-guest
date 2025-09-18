import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trash2, Users, Plus, Save, RotateCcw, Move } from 'lucide-react';

interface Guest {
  id: string;
  name: string;
  tableId?: string;
  status?: string; // Aggiunto per gestire lo status dell'ospite
}

interface Table {
  id: string;
  name: string;
  seats: number;
  x: number;
  y: number;
  shape: 'round' | 'rectangular';
  guests: Guest[];
}

interface SeatingEditorProps {
  guests: Guest[];
  tables: Table[];
  onUpdateTables: (tables: Table[]) => void;
  onAddTable?: (tableData: { name: string; capacity: number }) => void; // Nuova prop per aggiungere tavoli
}

export const SeatingEditor: React.FC<SeatingEditorProps> = ({
  guests,
  tables: initialTables,
  onUpdateTables,
  onAddTable
}) => {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [unassignedGuests, setUnassignedGuests] = useState<Guest[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [draggedGuest, setDraggedGuest] = useState<Guest | null>(null);
  const [newTableName, setNewTableName] = useState('');
  const [newTableSeats, setNewTableSeats] = useState(8);
  
  // Stati per il drag dei tavoli
  const [isDraggingTable, setIsDraggingTable] = useState(false);
  const [draggedTable, setDraggedTable] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragMode, setIsDragMode] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const assignedGuestIds = tables.flatMap(table => table.guests.map(g => g.id));
    
    // FILTRO CORRETTO: Solo ospiti confermati non assegnati
    const unassigned = guests.filter(guest => {
      const isNotAssigned = !assignedGuestIds.includes(guest.id);
      const isConfirmed = guest.status === 'confirmed'; // Solo ospiti confermati
      
      console.log(`Guest: ${guest.name}, Status: ${guest.status}, Not Assigned: ${isNotAssigned}, Is Confirmed: ${isConfirmed}`);
      
      return isNotAssigned && isConfirmed;
    });
    
    console.log(`Total guests: ${guests.length}, Confirmed unassigned: ${unassigned.length}`);
    setUnassignedGuests(unassigned);
  }, [guests, tables]);

  useEffect(() => {
    drawCanvas();
  }, [tables, selectedTable, isDraggingTable, draggedTable]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid if in drag mode
    if (isDragMode) {
      drawGrid(ctx, canvas.width, canvas.height);
    }

    // Draw tables
    tables.forEach(table => {
      const isSelected = selectedTable === table.id;
      const isBeingDragged = draggedTable === table.id;
      
      // Set styles
      ctx.fillStyle = isSelected ? '#3b82f6' : isBeingDragged ? '#10b981' : '#f3f4f6';
      ctx.strokeStyle = isSelected ? '#1d4ed8' : isBeingDragged ? '#059669' : '#d1d5db';
      ctx.lineWidth = isSelected || isBeingDragged ? 3 : 2;

      // Add shadow for dragged tables
      if (isBeingDragged) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
      }

      if (table.shape === 'round') {
        // Draw round table
        ctx.beginPath();
        ctx.arc(table.x, table.y, 40, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      } else {
        // Draw rectangular table
        ctx.fillRect(table.x - 50, table.y - 30, 100, 60);
        ctx.strokeRect(table.x - 50, table.y - 30, 100, 60);
      }

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Draw table name
      ctx.fillStyle = isSelected || isBeingDragged ? '#ffffff' : '#374151';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(table.name, table.x, table.y - 5);

      // Draw guest count
      ctx.font = '12px Arial';
      ctx.fillText(`${table.guests.length}/${table.seats}`, table.x, table.y + 10);

      // Draw seats around table
      const seatRadius = 8;
      const tableRadius = table.shape === 'round' ? 55 : 70;
      
      for (let i = 0; i < table.seats; i++) {
        const angle = (2 * Math.PI * i) / table.seats;
        const seatX = table.x + Math.cos(angle) * tableRadius;
        const seatY = table.y + Math.sin(angle) * tableRadius;

        ctx.fillStyle = i < table.guests.length ? '#10b981' : '#e5e7eb';
        ctx.beginPath();
        ctx.arc(seatX, seatY, seatRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw drag handle if in drag mode
      if (isDragMode && !isBeingDragged) {
        ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
        ctx.beginPath();
        ctx.arc(table.x + 35, table.y - 35, 12, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw move icon
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(table.x + 30, table.y - 35);
        ctx.lineTo(table.x + 40, table.y - 35);
        ctx.moveTo(table.x + 35, table.y - 40);
        ctx.lineTo(table.x + 35, table.y - 30);
        ctx.stroke();
      }
    });
  };

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 20;
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
    ctx.lineWidth = 1;

    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const getMousePos = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };

  const getTableAt = (x: number, y: number) => {
    return tables.find(table => {
      const distance = Math.sqrt((x - table.x) ** 2 + (y - table.y) ** 2);
      return distance <= (table.shape === 'round' ? 40 : 50);
    });
  };

  const getDragHandleAt = (x: number, y: number) => {
    if (!isDragMode) return null;
    return tables.find(table => {
      const distance = Math.sqrt((x - (table.x + 35)) ** 2 + (y - (table.y - 35)) ** 2);
      return distance <= 12;
    });
  };

  const handleCanvasMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const mousePos = getMousePos(event);
    
    if (isDragMode) {
      // Check if clicking on a drag handle
      const tableWithHandle = getDragHandleAt(mousePos.x, mousePos.y);
      if (tableWithHandle) {
        setIsDraggingTable(true);
        setDraggedTable(tableWithHandle.id);
        setDragOffset({
          x: mousePos.x - tableWithHandle.x,
          y: mousePos.y - tableWithHandle.y
        });
        // Also select the table when starting to drag
        setSelectedTable(tableWithHandle.id);
        return;
      }
    }

    // Regular table selection (works both in normal and drag mode)
    const clickedTable = getTableAt(mousePos.x, mousePos.y);
    setSelectedTable(clickedTable ? clickedTable.id : null);
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingTable || !draggedTable) return;

    const mousePos = getMousePos(event);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newX = Math.max(60, Math.min(canvas.width - 60, mousePos.x - dragOffset.x));
    const newY = Math.max(60, Math.min(canvas.height - 60, mousePos.y - dragOffset.y));

    // Snap to grid if enabled
    const gridSize = 20;
    const snappedX = Math.round(newX / gridSize) * gridSize;
    const snappedY = Math.round(newY / gridSize) * gridSize;

    const updatedTables = tables.map(table =>
      table.id === draggedTable
        ? { ...table, x: snappedX, y: snappedY }
        : table
    );

    setTables(updatedTables);
  };

  const handleCanvasMouseUp = () => {
    if (isDraggingTable) {
      setIsDraggingTable(false);
      setDraggedTable(null);
      setDragOffset({ x: 0, y: 0 });
      onUpdateTables(tables);
    }
  };

  // MODIFICATA: Ora usa onAddTable invece di aggiungere direttamente
  const addTable = async () => {
    if (!newTableName.trim()) return;
    
    if (onAddTable) {
      await onAddTable({
        name: newTableName,
        capacity: newTableSeats
      });
      
      setNewTableName('');
      setNewTableSeats(8);
    }
  };

  const removeTable = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    const updatedUnassigned = [...unassignedGuests, ...table.guests];
    setUnassignedGuests(updatedUnassigned);

    const updatedTables = tables.filter(t => t.id !== tableId);
    setTables(updatedTables);
    onUpdateTables(updatedTables);
    setSelectedTable(null);
  };

  const assignGuestToTable = (guest: Guest, tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (!table || table.guests.length >= table.seats) return;

    const updatedTables = tables.map(t => ({
      ...t,
      guests: t.guests.filter(g => g.id !== guest.id)
    }));

    const targetTable = updatedTables.find(t => t.id === tableId);
    if (targetTable) {
      targetTable.guests.push(guest);
    }

    const updatedUnassigned = unassignedGuests.filter(g => g.id !== guest.id);
    setUnassignedGuests(updatedUnassigned);

    setTables(updatedTables);
    onUpdateTables(updatedTables);
  };

  const removeGuestFromTable = (guest: Guest) => {
    const updatedTables = tables.map(table => ({
      ...table,
      guests: table.guests.filter(g => g.id !== guest.id)
    }));

    const updatedUnassigned = [...unassignedGuests, guest];
    setUnassignedGuests(updatedUnassigned);

    setTables(updatedTables);
    onUpdateTables(updatedTables);
  };

  const handleDragStart = (guest: Guest) => {
    setDraggedGuest(guest);
  };

  const handleDragEnd = () => {
    setDraggedGuest(null);
  };

  const handleDrop = (tableId: string) => {
    if (draggedGuest) {
      assignGuestToTable(draggedGuest, tableId);
    }
    handleDragEnd();
  };

  const resetLayout = () => {
    const allGuests = [...unassignedGuests, ...tables.flatMap(t => t.guests)];
    setUnassignedGuests(allGuests);

    const resetTables = tables.map(table => ({
      ...table,
      guests: []
    }));

    setTables(resetTables);
    onUpdateTables(resetTables);
    setSelectedTable(null);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Editor Disposizione Tavoli
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Table Form */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="tableName">Nome Tavolo</Label>
              <Input
                id="tableName"
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                placeholder="Es: Tavolo Sposi"
              />
            </div>
            <div>
              <Label htmlFor="tableSeats">Posti</Label>
              <Input
                id="tableSeats"
                type="number"
                min="2"
                max="12"
                value={newTableSeats}
                onChange={(e) => setNewTableSeats(parseInt(e.target.value) || 8)}
                className="w-20"
              />
            </div>
            <Button onClick={addTable} className="gap-2">
              <Plus className="w-4 h-4" />
              Aggiungi
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant={isDragMode ? "default" : "outline"} 
              onClick={() => setIsDragMode(!isDragMode)} 
              className="gap-2"
            >
              <Move className="w-4 h-4" />
              {isDragMode ? 'Modalità Spostamento ON' : 'Modalità Spostamento'}
            </Button>
            <Button variant="outline" onClick={resetLayout} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset Layout
            </Button>
            <Button onClick={() => onUpdateTables(tables)} className="gap-2">
              <Save className="w-4 h-4" />
              Salva Disposizione
            </Button>
          </div>

          {isDragMode && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700 flex items-center gap-2">
                <Move className="w-4 h-4" />
                <strong>Modalità Spostamento Attiva:</strong> Clicca e trascina l'icona blu sui tavoli per spostarli. I tavoli si agganciano automaticamente alla griglia.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Pianta Sala</CardTitle>
            </CardHeader>
            <CardContent>
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className={`border border-gray-200 rounded-lg w-full ${
                  isDragMode ? 'cursor-move' : 'cursor-pointer'
                } ${isDraggingTable ? 'cursor-grabbing' : ''}`}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Selected Table Info */}
          {selectedTable && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {tables.find(t => t.id === selectedTable)?.name}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeTable(selectedTable)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const table = tables.find(t => t.id === selectedTable);
                  if (!table) return null;
                  
                  return (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Posti occupati:</span>
                        <Badge variant={table.guests.length === table.seats ? "destructive" : "secondary"}>
                          {table.guests.length}/{table.seats}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span>Posizione:</span>
                        <span className="font-medium">
                          x: {Math.round(table.x)}, y: {Math.round(table.y)}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Ospiti assegnati:</Label>
                        {table.guests.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Nessun ospite assegnato</p>
                        ) : (
                          <div className="space-y-1">
                            {table.guests.map(guest => (
                              <div key={guest.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span className="text-sm">{guest.name}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeGuestFromTable(guest)}
                                  className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {/* Unassigned Guests - SOLO OSPITI CONFERMATI */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Ospiti Confermati Non Assegnati
                <Badge variant="secondary">{unassignedGuests.length}</Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Solo ospiti e accompagnatori che hanno confermato la presenza
              </p>
            </CardHeader>
            <CardContent>
              {unassignedGuests.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Tutti gli ospiti confermati sono stati assegnati ai tavoli!
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {unassignedGuests.map(guest => (
                    <div
                      key={guest.id}
                      draggable
                      onDragStart={() => handleDragStart(guest)}
                      onDragEnd={handleDragEnd}
                      className="p-2 bg-green-50 border border-green-200 rounded cursor-move hover:bg-green-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{guest.name}</span>
                        <Badge variant="outline" className="text-xs bg-green-100 text-green-700">
                          Confermato
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tables List */}
          <Card>
            <CardHeader>
              <CardTitle>Tavoli ({tables.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {tables.map(table => (
                  <div
                    key={table.id}
                    className={`p-2 rounded cursor-pointer transition-colors ${
                      selectedTable === table.id
                        ? 'bg-blue-100 border border-blue-300'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedTable(table.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(table.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{table.name}</span>
                      <Badge variant={table.guests.length === table.seats ? "destructive" : "secondary"}>
                        {table.guests.length}/{table.seats}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Posizione: {Math.round(table.x)}, {Math.round(table.y)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};