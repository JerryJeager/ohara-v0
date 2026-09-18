import { Globe2, Plus, Sparkles, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { Website } from '@/types/knowledge-base';

type KnowledgeBaseSidebarProps = {
  websites: Website[];
  selectedId: number | null;
  isCreating: boolean;
  showSidebar: boolean;
  onSelectWebsite: (id: number) => void;
  onCreateNew: () => void;
  onCloseSidebar: () => void;
};

export function KnowledgeBaseSidebar({
  websites,
  selectedId,
  isCreating,
  showSidebar,
  onSelectWebsite,
  onCreateNew,
  onCloseSidebar,
}: KnowledgeBaseSidebarProps) {
  return (
    <>
      {showSidebar && (
        <button
          aria-label="Close sidebar"
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onCloseSidebar}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-[280px] flex-col border-r border-border bg-sidebar transition-transform lg:static lg:translate-x-0 ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="size-3.5" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight">Ohara</span>
          </div>
          <button
            className="rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground lg:hidden"
            aria-label="Close sidebar"
            onClick={onCloseSidebar}
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-3">
          <Button
            className="h-9 w-full justify-start gap-2 text-sm"
            onClick={onCreateNew}
          >
            <Plus className="size-4" /> New Website
          </Button>

          <div className="space-y-1">
            <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Knowledge bases
            </p>

            {websites.map((site) => (
              <button
                key={site.id}
                onClick={() => onSelectWebsite(site.id)}
                className={`flex w-full items-center gap-3 rounded-md px-2.5 py-2.5 text-left text-sm transition-colors ${selectedId === site.id && !isCreating ? 'bg-sidebar-accent text-sidebar-foreground' : 'text-muted-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'}`}
              >
                <Globe2 className="size-4 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{site.name}</span>
                {selectedId === site.id && !isCreating && (
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="size-2 rounded-full bg-emerald-400" /> All systems
            operational
          </div>
        </div>
      </aside>
    </>
  );
}
