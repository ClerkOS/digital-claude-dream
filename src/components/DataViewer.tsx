import { motion } from 'framer-motion';
import { X, Database, Table as TableIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GetSessionResponse } from '@/lib/api/sessions';
import { useEffect, useState } from 'react';

interface DataViewerProps {
  sessionId: string;
  onClose: () => void;
}

interface SessionData {
  session_id: string;
  total_rows: number;
  preview_rows: number;
  columns: Array<{ name: string; dtype: string }>;
  data: Array<Record<string, any>>;
}

export function DataViewer({ sessionId, onClose }: DataViewerProps) {
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8081/sessions/${sessionId}/data`);
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        setSessionData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [sessionId]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      >
        <div className="bg-background rounded-lg p-8">
          <div className="text-center">Loading data...</div>
        </div>
      </motion.div>
    );
  }

  if (error || !sessionData) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <div className="bg-background rounded-lg p-8">
          <div className="text-center text-red-500">Error: {error || 'No data'}</div>
          <Button onClick={onClose} className="mt-4">Close</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-background rounded-lg shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">Data Preview</h2>
              <p className="text-xs text-muted-foreground">
                Showing {sessionData.preview_rows} of {sessionData.total_rows.toLocaleString()} rows
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TableIcon className="h-4 w-4" />
                Data Rows ({sessionData.columns.length} columns)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border border-border rounded-lg overflow-auto max-h-[600px]">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border-r border-border">
                        #
                      </th>
                      {sessionData.columns.map((column) => (
                        <th 
                          key={column.name}
                          className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border-r border-border last:border-r-0"
                        >
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-foreground">{column.name}</span>
                            <span className="text-[10px] text-muted-foreground">{column.dtype}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-background divide-y divide-border">
                    {sessionData.data.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3 text-sm text-muted-foreground font-medium border-r border-border">
                          {rowIndex + 1}
                        </td>
                        {sessionData.columns.map((column) => (
                          <td 
                            key={column.name}
                            className="px-4 py-3 text-sm text-foreground border-r border-border last:border-r-0"
                          >
                            {row[column.name] !== null && row[column.name] !== undefined 
                              ? String(row[column.name]) 
                              : <span className="text-muted-foreground italic">null</span>
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {sessionData.total_rows > sessionData.preview_rows && (
                <div className="mt-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Note:</strong> Showing first {sessionData.preview_rows} rows. 
                    {sessionData.total_rows - sessionData.preview_rows} more rows available.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}

