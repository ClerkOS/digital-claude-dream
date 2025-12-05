import { motion } from 'framer-motion';
import { X, Database, Table as TableIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GetSessionResponse } from '@/lib/api/sessions';

interface DataViewerProps {
  sessionData: GetSessionResponse;
  onClose: () => void;
}

export function DataViewer({ sessionData, onClose }: DataViewerProps) {
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
        className="bg-background rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">Data Overview</h2>
              <p className="text-xs text-muted-foreground">
                Session: {sessionData.session_id.slice(0, 8)}... • Version {sessionData.version}
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
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground">
                      {sessionData.schema.row_count.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Total Rows</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground">
                      {sessionData.schema.columns.length}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Columns</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground">
                      {sessionData.history.length}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Transformations</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Schema Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TableIcon className="h-4 w-4" />
                  Column Schema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Column Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Data Type
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-border">
                      {sessionData.schema.columns.map((column, index) => (
                        <tr key={index} className="hover:bg-muted/50 transition-colors">
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-foreground">
                            {column.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              {column.dtype}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Transformation History */}
            {sessionData.history.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Transformation History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sessionData.history.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground">
                            {item.step?.op || 'Unknown operation'}
                          </div>
                          {item.diff && Object.keys(item.diff).length > 0 && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              {item.diff.columns_added && (
                                <div>✓ Added: {item.diff.columns_added.join(', ')}</div>
                              )}
                              {item.diff.columns_removed && (
                                <div>✗ Removed: {item.diff.columns_removed.join(', ')}</div>
                              )}
                              {item.diff.row_change !== undefined && (
                                <div>
                                  Rows: {item.diff.row_change > 0 ? '+' : ''}{item.diff.row_change}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Info Note */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Note:</strong> This shows the current schema and structure of your data. 
                The actual row data is stored securely in the backend session and is transformed when you execute rules.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

